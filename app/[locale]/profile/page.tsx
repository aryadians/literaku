"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { AvatarUpload } from "@/components/ui/AvatarUpload";
import { IoSave, IoPerson, IoBook, IoChatbubbles } from "react-icons/io5";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    booksRead: 0,
    reviews: 0,
  });
  const [readHistory, setReadHistory] = useState<any[]>([]); // New State

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    bio: "",
    website: "",
  });

  useEffect(() => {
    async function fetchProfile() {
      if (!session?.user?.email) return;

      setLoading(true);

      // 1. Fetch Profile
      let { data: userProfile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", session.user.email)
        .single();

      if (!userProfile && session.user) {
        // Fallback if profile missing (should be fixed by scripts but just in case)
        // Or fetching by ID if email mismatch
        // For now assume email is key
      }

      if (userProfile) {
        setProfile(userProfile);
        setFormData({
          fullName: userProfile.full_name || "",
          username: userProfile.username || "",
          bio: userProfile.bio || "",
          website: userProfile.website || "",
        });

        // 2. Fetch Stats
        const { count: reviewsCount } = await supabase
          .from("book_reviews")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userProfile.id);

        const { count: historyCount } = await supabase
          .from("read_history")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userProfile.id);

        setStats({
          booksRead: historyCount || 0,
          reviews: reviewsCount || 0,
        });

        // 3. Fetch Read History List
        const { data: historyData } = await supabase
          .from("read_history")
          .select(
            `
            last_read_at,
            books (
              id,
              title,
              slug,
              cover_url,
              author
            )
          `,
          )
          .eq("user_id", userProfile.id)
          .order("last_read_at", { ascending: false })
          .limit(5);

        setReadHistory(historyData || []);
      }

      setLoading(false);
    }

    if (session) {
      fetchProfile();
    } else {
      // Redirect if not logged in?
      // middleware usually handles this, or client side check
    }
  }, [session]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.fullName,
          username: formData.username,
          bio: formData.bio,
          website: formData.website,
        })
        .eq("id", profile.id);

      if (error) throw error;

      // Update Session if name changed (optional, depends on NextAuth provider)
      // await updateSession({ name: formData.fullName });

      Swal.fire("Berhasil", "Profil berhasil diperbarui", "success");
    } catch (error: any) {
      console.error(error);
      Swal.fire("Gagal", error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpdate = async (newUrl: string) => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: newUrl })
        .eq("id", profile.id);

      if (error) throw error;

      // Update local state to reflect change immediately
      setProfile({ ...profile, avatar_url: newUrl });

      // Trigger session update to reflect new avatar in Navbar
      await updateSession({ user: { ...session?.user, image: newUrl } });
    } catch (error: any) {
      console.error("Avatar update failed db sync:", error);
    }
  };

  if (!session) {
    return (
      <div className="p-10 text-center">
        Silakan login untuk melihat profil.
      </div>
    );
  }

  if (loading) {
    return <div className="p-10 text-center">Loading Data Profil...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Profil Saya
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Mini Stats */}
        <div className="space-y-6">
          <Card className="p-6 text-center">
            <div className="mb-4">
              <AvatarUpload
                currentAvatarUrl={
                  profile?.avatar_url || session.user?.image || null
                }
                onUpload={handleAvatarUpdate}
              />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {formData.fullName || session.user?.name}
            </h2>
            <p className="text-gray-500 text-sm">
              @{formData.username || "username"}
            </p>

            <div className="grid grid-cols-2 gap-4 mt-6 border-t border-gray-100 dark:border-gray-700 pt-6">
              <div>
                <div className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                  {stats.reviews}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  Ulasan
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                  {stats.booksRead}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  Buku Dibaca
                </div>
              </div>
            </div>
          </Card>

          {/* Reading History */}
          <Card className="p-6 mt-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <IoBook className="text-brand-500" />
              Riwayat Baca
            </h3>
            {stats.booksRead === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">
                Belum ada buku dibaca.
              </p>
            ) : (
              <div className="space-y-4">
                {readHistory.map((item: any) => (
                  <a
                    key={item.books.id}
                    href={`/read/${item.books.slug}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                  >
                    <div className="w-10 h-14 bg-gray-200 rounded overflow-hidden relative flex-shrink-0">
                      {item.books.cover_url ? (
                        <img
                          src={item.books.cover_url}
                          alt={item.books.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <IoBook />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                        {item.books.title}
                      </h4>
                      <p className="text-xs text-gray-500 truncate">
                        {item.books.author}
                      </p>
                    </div>
                  </a>
                ))}

                {stats.booksRead > 5 && (
                  <div className="pt-2 text-center">
                    <a href="/library">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs w-full"
                      >
                        Lihat Semua Riwayat
                      </Button>
                    </a>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Edit Form */}
        <div className="lg:col-span-2">
          <Card className="p-6 md:p-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <IoPerson className="text-brand-500" />
              Edit Informasi
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Nama Lengkap"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
                <Input
                  label="Username"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bio / Tentang Saya
                </label>
                <textarea
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-brand-500 outline-none transition-all resize-none h-32"
                  placeholder="Ceritakan sedikit tentang dirimu..."
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                />
              </div>

              <Input
                label="Website (Opsional)"
                placeholder="https://..."
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
              />

              <div className="pt-4 flex justify-end">
                <Button type="submit" isLoading={saving}>
                  <IoSave className="mr-2" /> Simpan Perubahan
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

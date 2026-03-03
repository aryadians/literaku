"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { createClient } from "@/lib/supabase/client";
import { ALL_BADGES } from "@/lib/badges";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { AvatarUpload } from "@/components/ui/AvatarUpload";
import { 
  IoSave, 
  IoPerson, 
  IoBook, 
  IoChatbubbles, 
  IoSettings, 
  IoStatsChart, 
  IoExtensionPuzzle, 
  IoChevronForward, 
  IoTime,
  IoRocket,
  IoGlobeOutline,
  IoCalendar
} from "react-icons/io5";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    booksRead: 0,
    reviews: 0,
    likesReceived: 0,
    commentsMade: 0,
    categoriesCount: 0,
  });
  const [readHistory, setReadHistory] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    bio: "",
    website: "",
  });

  const supabase = createClient();

  // Level Logic
  const xp = (stats.reviews * 20) + (stats.booksRead * 10) + (stats.likesReceived * 5);
  const level = Math.floor(xp / 100) + 1;
  const progress = (xp % 100);

  // Optimized Badge Calculation
  const earnedBadges = useMemo(() => {
    const currentStats = {
      booksRead: stats.booksRead,
      reviewsCount: stats.reviews,
      likesReceived: stats.likesReceived,
      commentsMade: stats.commentsMade,
      categoriesCount: stats.categoriesCount
    };
    return ALL_BADGES.map(badge => ({
      ...badge,
      earned: badge.criteria(currentStats)
    }));
  }, [stats]);

  useEffect(() => {
    async function fetchProfile() {
      let userId = (session?.user as any)?.id;
      
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
      }

      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data: userProfile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (userProfile) {
        setProfile(userProfile);
        setFormData({
          fullName: userProfile.full_name || "",
          username: userProfile.username || "",
          bio: userProfile.bio || "",
          website: userProfile.website || "",
        });

        // Fetch Stats
        const { count: reviewsCount, data: revData } = await supabase
          .from("book_reviews")
          .select("id, category_id", { count: "exact" })
          .eq("user_id", userProfile.id);

        const { count: historyCount } = await supabase
          .from("read_history")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userProfile.id);
        
        const revIds = revData?.map(r => r.id) || [];
        let likesCount = 0;
        if (revIds.length > 0) {
          const { count: lCount } = await supabase
            .from("review_likes")
            .select("*", { count: "exact", head: true })
            .in("review_id", revIds);
          likesCount = lCount || 0;
        }

        const { count: commentsCount } = await supabase
          .from("review_comments")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userProfile.id);

        setStats({
          booksRead: historyCount || 0,
          reviews: reviewsCount || 0,
          likesReceived: likesCount,
          commentsMade: commentsCount || 0,
          categoriesCount: new Set(revData?.map(r => r.category_id)).size
        });

        // Fetch History
        const { data: historyData } = await supabase
          .from("read_history")
          .select(`last_read_at, books (id, title, slug, cover_url, author)`)
          .eq("user_id", userProfile.id)
          .order("last_read_at", { ascending: false })
          .limit(5);

        setReadHistory(historyData || []);
      }
      setLoading(false);
    }
    
    if (session || loading) fetchProfile();
  }, [session]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    
    try {
      // Build update object dynamically to avoid errors if columns are missing
      // although we added them in migration, safe-guarding is good.
      const updateData: any = {
        full_name: formData.fullName,
        username: formData.username,
        bio: formData.bio,
      };
      
      // Check if website column is known to exist or just try update
      updateData.website = formData.website;

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", profile.id);
        
      if (error) {
        if (error.message.includes("column \"website\" of relation \"profiles\" does not exist")) {
          // Fallback if migration hasn't been run yet by user
          delete updateData.website;
          const { error: retryError } = await supabase
            .from("profiles")
            .update(updateData)
            .eq("id", profile.id);
          if (retryError) throw retryError;
          Swal.fire("Peringatan", "Profil diperbarui tapi kolom website belum tersedia di database. Hubungi admin untuk menjalankan migrasi.", "warning");
        } else {
          throw error;
        }
      } else {
        // Update session with new name and username
        await updateSession({ 
          user: { 
            ...session?.user, 
            name: formData.fullName,
            username: formData.username // Include username in session update
          } 
        });
        Swal.fire("Berhasil", "Profil berhasil diperbarui", "success");
      }
    } catch (error: any) {
      Swal.fire("Gagal", error.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpdate = async (newUrl: string) => {
    if (!profile) return;
    try {
      await supabase.from("profiles").update({ avatar_url: newUrl }).eq("id", profile.id);
      setProfile({ ...profile, avatar_url: newUrl });
      await updateSession({ user: { ...session?.user, image: newUrl } });
    } catch (error) { console.error(error); }
  };

  if (!session && !loading) return <div className="p-10 text-center">Silakan login.</div>;
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      {/* Immersive Header - Increased height and fixed positioning */}
      <div className="relative h-[320px] bg-brand-600">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-gray-50 dark:to-gray-950 z-10" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
        
        <div className="container-custom relative z-20 h-full flex flex-col justify-end">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-[-80px]">
            {/* Avatar - High z-index and forced relative positioning */}
            <div className="relative z-50">
              <div className="p-1 bg-white dark:bg-gray-950 rounded-full shadow-2xl">
                <AvatarUpload
                  currentAvatarUrl={profile?.avatar_url || session?.user?.image || null}
                  onUpload={handleAvatarUpdate}
                />
              </div>
            </div>
            
            {/* User Info */}
            <div className="flex-1 text-center md:text-left pb-4 md:pb-12 z-20">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                  {formData.fullName || session?.user?.name || "User"}
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <span className="text-brand-600 dark:text-brand-400 font-bold bg-brand-50 dark:bg-brand-900/30 px-3 py-1 rounded-lg text-sm border border-brand-100 dark:border-brand-800">
                    @{formData.username || "username"}
                  </span>
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest">
                    <IoCalendar className="text-brand-500" />
                    {profile?.created_at || profile?.updated_at ? (
                      <>Bergabung {new Date(profile.created_at || profile.updated_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</>
                    ) : (
                      <>User Baru</>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="hidden md:flex gap-4 pb-12 z-20">
              <Link href={`/profile/${formData.username}`}>
                <Button variant="outline" className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl px-6 shadow-sm">
                  Lihat Profil Publik
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom pt-32 md:pt-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Stats & Badges */}
          <div className="lg:col-span-4 space-y-8">
            {/* XP & Level Card */}
            <Card className="p-8 border-none bg-white dark:bg-gray-900 shadow-xl overflow-hidden relative group rounded-[2rem]">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                <IoStatsChart className="w-24 h-24 rotate-12" />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-2">
                <IoRocket className="text-brand-500" /> Progres Pengalaman
              </h3>
              <div className="flex justify-between items-end mb-3">
                <div>
                  <span className="text-4xl font-black text-gray-900 dark:text-white">{xp}</span>
                  <span className="text-gray-400 font-bold ml-1 text-sm">XP</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-brand-600 uppercase tracking-tighter">Level {level}</p>
                  <p className="text-[9px] text-gray-400 font-bold tracking-tighter uppercase">Ke Level {level + 1}</p>
                </div>
              </div>
              <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-brand-500 to-accent-500 shadow-[0_0_10px_rgba(217,137,67,0.3)]" />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                <div className="text-center">
                  <p className="text-xl font-black text-gray-900 dark:text-white">{stats.booksRead}</p>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Buku</p>
                </div>
                <div className="text-center border-x border-gray-100 dark:border-gray-800">
                  <p className="text-xl font-black text-gray-900 dark:text-white">{stats.reviews}</p>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Review</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-black text-gray-900 dark:text-white">{stats.likesReceived}</p>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Suka</p>
                </div>
              </div>
            </Card>

            {/* Badges Collection */}
            <Card className="p-8 border-none bg-white dark:bg-gray-900 shadow-xl rounded-[2rem]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                  <IoExtensionPuzzle className="text-brand-500" /> Lencana Koleksi
                </h3>
                <span className="text-[10px] font-bold text-brand-600 bg-brand-50 dark:bg-brand-900/30 px-2 py-0.5 rounded-full">{earnedBadges.filter(b => b.earned).length} Didapat</span>
              </div>
              <div className="grid grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {earnedBadges.map((badge) => (
                  <div key={badge.id} className={`aspect-square rounded-xl border flex flex-col items-center justify-center p-2 transition-all duration-500 ${badge.earned ? "bg-white dark:bg-gray-800 border-brand-100 dark:border-brand-900/30 shadow-sm" : "bg-gray-50/50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800 opacity-20 grayscale scale-95"}`} title={`${badge.label}: ${badge.desc}`}>
                    <span className="text-xl mb-1">{badge.icon}</span>
                    <span className={`text-[6px] font-black uppercase text-center leading-tight truncate w-full ${badge.earned ? "text-brand-700 dark:text-brand-400" : "text-gray-500"}`}>{badge.label}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right: Main Forms & History */}
          <div className="lg:col-span-8 space-y-8">
            <Card className="p-8 md:p-10 border-none bg-white dark:bg-gray-900 shadow-xl rounded-[2rem]">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/30 flex items-center justify-center text-brand-600"><IoSettings /></div>
                Pengaturan Profil
              </h3>
              <form onSubmit={handleUpdateProfile} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input label="Nama Lengkap" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} icon={<IoPerson />} />
                  <Input label="Username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} icon={<div className="text-gray-400 font-bold">@</div>} />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Bio / Tentang Saya</label>
                  <textarea className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900 outline-none transition-all resize-none h-32 text-gray-700 dark:text-gray-200" placeholder="Ceritakan sedikit tentang dirimu..." value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} />
                </div>
                <Input label="Website" placeholder="https://..." value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} icon={<IoGlobeOutline />} />
                <div className="pt-4 flex justify-end">
                  <Button type="submit" size="lg" isLoading={saving} className="rounded-2xl px-10 shadow-glow-md"><IoSave className="mr-2" /> Simpan Perubahan</Button>
                </div>
              </form>
            </Card>

            {/* Recent History Grid */}
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 shadow-xl">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600"><IoBook /></div>
                  Riwayat Bacaan
                </h3>
                <Link href="/library" className="text-[10px] font-black text-brand-600 hover:underline uppercase tracking-[0.2em] flex items-center gap-1">Semua Riwayat <IoChevronForward /></Link>
              </div>
              {stats.booksRead === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-100 dark:border-gray-800">
                  <p className="text-sm text-gray-500 font-medium">Belum ada aktivitas membaca. Mulai jelajahi perpustakaan!</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {readHistory.map((item: any) => (
                    <Link key={item.books.id} href={`/read/${item.books.slug}`} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-transparent hover:border-brand-200 hover:bg-white dark:hover:bg-gray-800 shadow-sm hover:shadow-md transition-all group">
                      <div className="w-14 h-20 bg-gray-200 rounded-xl overflow-hidden shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                        {item.books.cover_url ? <img src={item.books.cover_url} alt={item.books.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><IoBook /></div>}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-brand-600 transition-colors text-sm">{item.books.title}</h4>
                        <p className="text-[10px] text-gray-500 truncate mb-2">{item.books.author}</p>
                        <div className="flex items-center gap-1 text-[9px] font-black uppercase text-gray-400 tracking-tighter"><IoTime /> {new Date(item.last_read_at).toLocaleDateString()}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

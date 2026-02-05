"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { IoSave, IoCamera, IoPerson } from "react-icons/io5";

export default function ProfileSettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    website: "",
    avatar_url: "",
  });

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        bio: "", // Need to fetch from DB in real implementation
        website: "",
        avatar_url: session.user.image || "",
      });
      // TODO: Fetch existing profile data from Supabase
    }
  }, [session]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Here we would create an API endpoint PUT /api/profile
      // For now we simulate success
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update session if name changed
      if (session?.user?.name !== formData.name) {
        await update({ name: formData.name });
      }

      router.refresh();
      alert("Profil berhasil diperbarui!");
    } catch (error) {
      console.error(error);
      alert("Gagal memperbarui profil");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <div className="container-custom max-w-2xl">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-8 border border-gray-100 dark:border-gray-800">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-8">
            Pengaturan Profil
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-24 h-24">
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-200 ring-4 ring-white dark:ring-gray-800 shadow-lg">
                  {formData.avatar_url ? (
                    <Image
                      src={formData.avatar_url}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-brand-100 text-brand-500">
                      <IoPerson className="w-10 h-10" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 p-2 bg-brand-600 text-white rounded-full shadow-lg hover:bg-brand-700 transition-colors"
                >
                  <IoCamera className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-500">
                Klik ikon kamera untuk mengganti foto profil
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Bio
                </label>
                <textarea
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  placeholder="Ceritakan sedikit tentang dirimu dan buku kesukaanmu..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Website / Social Media
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  placeholder="https://instagram.com/user"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition-colors shadow-lg flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  "Menyimpan..."
                ) : (
                  <>
                    <IoSave className="w-4 h-4" />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

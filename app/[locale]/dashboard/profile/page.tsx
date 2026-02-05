"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  IoArrowBack,
  IoSave,
  IoCamera,
  IoPerson,
  IoMail,
  IoGlobe,
  IoInformationCircle,
  IoAt,
} from "react-icons/io5";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default function EditProfilePage() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    bio: "",
    website: "",
    avatar_url: "",
  });

  // Load initial data from session
  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        username: (session.user as any).username || "",
        email: session.user.email || "",
        bio: (session.user as any).bio || "",
        website: (session.user as any).website || "",
        avatar_url: session.user.image || "",
      });
    }
  }, [session]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          avatar_url: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock API Call & Session Update
    setTimeout(async () => {
      // Simulate updating session client-side
      await update({
        ...session,
        user: {
          ...session?.user,
          name: formData.name,
          image: formData.avatar_url,
        },
      });

      Swal.fire({
        icon: "success",
        title: "Profil Diperbarui!",
        text: "Perubahan profil Anda telah berhasil disimpan.",
        timer: 2000,
        showConfirmButton: false,
      });
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-20">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-gray-500 hover:text-brand-600 transition-colors mb-2"
          >
            <IoArrowBack /> Kembali ke Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Profil
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Perbarui informasi pribadi dan tampilan profil publik Anda.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid md:grid-cols-[300px_1fr] gap-8"
        >
          {/* Left Column: Avatar & Summary */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 text-center"
            >
              <div
                className="relative w-32 h-32 mx-auto mb-4 group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg relative">
                  {formData.avatar_url ? (
                    <Image
                      src={formData.avatar_url}
                      alt="Avatar"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <IoPerson className="w-16 h-16 text-gray-400" />
                    </div>
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <IoCamera className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 bg-brand-600 text-white p-2 rounded-full shadow-md hover:bg-brand-700 transition-colors">
                  <IoCamera className="w-4 h-4" />
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />

              <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                {formData.name || "User Name"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {formData.email}
              </p>
            </motion.div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-300 flex gap-3">
              <IoInformationCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>
                Foto profil dan nama depan Anda akan terlihat di halaman publik.
              </p>
            </div>
          </div>

          {/* Right Column: Form Fields */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <IoPerson className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    placeholder="Nama Anda"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Username
                </label>
                <div className="relative">
                  <IoAt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    placeholder="username"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="relative">
                <IoMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  disabled
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/50 text-gray-500 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-400 pl-1">
                Email tidak dapat diubah.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none"
                placeholder="Ceritakan sedikit tentang diri Anda..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                Website
              </label>
              <div className="relative">
                <IoGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-8 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-brand-500/30 disabled:opacity-70 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <IoSave className="w-5 h-5" />
                    Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
}

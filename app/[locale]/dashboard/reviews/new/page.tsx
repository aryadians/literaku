"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { IoCloudUpload, IoSave, IoArrowBack, IoStar } from "react-icons/io5";

const categories = [
  { id: "fiction", name: "Fiction" },
  { id: "non-fiction", name: "Non-Fiction" },
  { id: "self-help", name: "Self-Help" },
  { id: "business", name: "Business" },
  { id: "psychology", name: "Psychology" },
  { id: "history", name: "History" },
  { id: "biography", name: "Biography" },
];

export default function CreateReviewPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    book_title: "",
    book_author: "",
    category: "",
    rating: 0,
    content: "",
    book_cover_url: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRating = (rating: number) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (!session) {
        throw new Error("Anda harus login terlebih dahulu.");
      }

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Gagal membuat review");
      }

      router.push("/dashboard/reviews");
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat menyimpan review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <div className="container-custom max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-card p-8 md:p-10 border border-gray-100 dark:border-gray-800"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100 dark:border-gray-800">
            <div>
              <button
                onClick={() => router.back()}
                className="text-gray-500 hover:text-brand-600 flex items-center gap-2 mb-2 transition-colors text-sm font-medium"
              >
                <IoArrowBack /> Batal
              </button>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                Buat Review Baru
              </h1>
            </div>
            <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/20 rounded-xl flex items-center justify-center text-brand-600 dark:text-brand-400">
              <span className="text-2xl">📝</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Book Details */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                📖 Detail Buku
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    Judul Buku <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="book_title"
                    required
                    value={formData.book_title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    placeholder="Contoh: Atomic Habits"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    Penulis Buku <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="book_author"
                    required
                    value={formData.book_author}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    placeholder="Contoh: James Clear"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    Book Cover URL
                  </label>
                  <input
                    type="url"
                    name="book_cover_url"
                    value={formData.book_cover_url}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                    placeholder="https://example.com/cover.jpg"
                  />
                  <p className="text-xs text-gray-500">
                    Masukkan link gambar cover buku (opsional)
                  </p>
                </div>
              </div>
            </div>

            {/* Review Content */}
            <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                ✍️ Isi Review
              </h2>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Judul Review <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 text-lg font-bold rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  placeholder="Review yang Menarik..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Rating <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRating(star)}
                      className={`text-3xl transition-transform hover:scale-110 focus:outline-none ${
                        star <= formData.rating
                          ? "text-yellow-400"
                          : "text-gray-300 dark:text-gray-600 hover:text-yellow-200"
                      }`}
                    >
                      <IoStar />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                    {formData.rating ? `${formData.rating}/5` : "Pilih rating"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  Konten Review <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="content"
                  required
                  rows={10}
                  value={formData.content}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  placeholder="Tulis pendapatmu tentang buku ini... (Markdown Supported)"
                />
                <p className="text-xs text-gray-500">
                  Tip: Kamu bisa menggunakan **bold**, *italic*, dan format
                  markdown lainnya.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2.5 rounded-lg font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting || formData.rating === 0}
                className="px-8 py-2.5 rounded-lg bg-brand-600 text-white font-bold hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-brand-500/30 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <IoSave className="w-5 h-5" />
                    Publikasikan Review
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  IoArrowBack,
  IoSave,
  IoCloudUpload,
  IoStar,
  IoBook,
  IoPerson,
  IoPricetag,
  IoCreate,
  IoImage,
  IoLink,
  IoList,
  IoEye,
  IoCode,
} from "react-icons/io5";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { createClient } from "@/lib/supabase/client";

export default function CreateReviewPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Real Data State
  const [categories, setCategories] = useState<any[]>([]);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    book_title: "",
    book_author: "",
    category_id: "", // Changed from category string to ID
    rating: 0,
    content: "",
    cover_url: "", // Preview URL
  });

  // Fetch Categories on Mount
  useEffect(() => {
    async function fetchCats() {
      const supabase = createClient();
      const { data } = await supabase.from("categories").select("id, name");
      if (data) setCategories(data);
    }
    fetchCats();
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRating = (value: number) => {
    setFormData((prev) => ({ ...prev, rating: value }));
  };

  // --- Image Upload Handling ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setCoverFile(file); // Store file for upload
    // Create preview URL
    const preview = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, cover_url: preview }));
  };

  // --- Text Editor Toolbar ---
  const insertText = (before: string, after: string = "") => {
    if (!textareaRef.current) return;
    const { selectionStart, selectionEnd, value } = textareaRef.current;

    const newText =
      value.substring(0, selectionStart) +
      before +
      value.substring(selectionStart, selectionEnd) +
      after +
      value.substring(selectionEnd);

    setFormData((prev) => ({ ...prev, content: newText }));

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          selectionStart + before.length,
          selectionEnd + before.length,
        );
      }
    }, 0);
  };

  const handleInsertImageInContent = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        // In a real app, we should upload this too.
        // For now, let's just stick to base64 for content images or warn user.
        // Or simple Markdown image syntax.
        const reader = new FileReader();
        reader.onload = (ev) => {
          const base64 = ev.target?.result as string;
          insertText(`\n![${file.name}](${base64})\n`);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (
      !formData.title ||
      !formData.book_title ||
      !formData.content ||
      formData.rating === 0
    ) {
      Swal.fire({
        icon: "error",
        title: "Data Tidak Lengkap",
        text: "Mohon isi semua field wajib (Judul, Buku, Rating, Konten).",
      });
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      // 1. Upload Cover (if exists)
      let finalCoverUrl = null;

      if (coverFile) {
        const fileName = `${Date.now()}-${coverFile.name.replace(/\s/g, "_")}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("library-covers") // Reuse existing bucket
          .upload(fileName, coverFile);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("library-covers").getPublicUrl(fileName);

        finalCoverUrl = publicUrl;
      }

      // 2. Insert Review to DB
      // Generate Slug
      const slug =
        formData.book_title.toLowerCase().replace(/[^a-z0-9]+/g, "-") +
        "-" +
        Date.now();

      // Need user_id. Session gives email usually, but hook gives user object.
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { error: insertError } = await supabase
        .from("book_reviews")
        .insert({
          title: formData.title,
          book_title: formData.book_title,
          book_author: formData.book_author,
          content: formData.content,
          rating: formData.rating,
          book_cover_url: finalCoverUrl,
          category_id: formData.category_id || null, // Optional
          user_id: user.id,
          slug: slug,
          views: 0,
        });

      if (insertError) throw insertError;

      Swal.fire({
        icon: "success",
        title: "Review Berhasil Dibuat!",
        text: "Review Anda telah berhasil diterbitkan.",
        confirmButtonColor: "#4F46E5",
      }).then(() => {
        router.push("/dashboard/reviews"); // Redirect to My Reviews
      });
    } catch (error: any) {
      console.error("Submit Error:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal Menyimpan",
        text: error.message || "Terjadi kesalahan saat menyimpan review.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-20">
      <div className="container-custom max-w-5xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-gray-500 hover:text-brand-600 transition-colors mb-2"
            >
              <IoArrowBack /> Kembali ke Dashboard
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-purple-600 dark:from-brand-400 dark:to-purple-500">
              Tulis Review Baru
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-4 py-2 rounded-lg font-bold border transition-all ${
                previewMode
                  ? "bg-brand-50 border-brand-200 text-brand-600 dark:bg-brand-900/30 dark:border-brand-800 dark:text-brand-400"
                  : "bg-white border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
              }`}
            >
              {previewMode ? (
                <span className="flex items-center gap-2">
                  <IoCreate /> Mode Edit
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <IoEye /> Preview
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Main Form Layout */}
        <form
          onSubmit={handleSubmit}
          className="grid lg:grid-cols-[1fr_350px] gap-8 items-start"
        >
          {/* Left Column: Main Content */}
          <div className="space-y-8">
            {/* Review Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 relative group focus-within:ring-2 ring-brand-500/20 transition-all"
            >
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">
                Judul Review
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Berikan judul yang menarik..."
                className="w-full text-2xl md:text-3xl font-bold text-gray-900 dark:text-white bg-transparent outline-none placeholder:text-gray-300 dark:placeholder:text-gray-700"
              />
            </motion.div>

            {/* Editor Content */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden"
            >
              <div className="border-b border-gray-200 dark:border-gray-800 p-3 bg-gray-50/50 dark:bg-gray-900 flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => insertText("**", "**")}
                  className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                  title="Bold"
                >
                  <strong className="font-serif">B</strong>
                </button>
                <button
                  type="button"
                  onClick={() => insertText("*", "*")}
                  className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                  title="Italic"
                >
                  <em className="font-serif">I</em>
                </button>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
                <button
                  type="button"
                  onClick={() => insertText("# ")}
                  className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold"
                  title="Heading 1"
                >
                  H1
                </button>
                <button
                  type="button"
                  onClick={() => insertText("## ")}
                  className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold text-sm"
                  title="Heading 2"
                >
                  H2
                </button>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
                <button
                  type="button"
                  onClick={() => insertText("- ")}
                  className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                  title="List"
                >
                  <IoList />
                </button>
                <button
                  type="button"
                  onClick={() => insertText("[", "](url)")}
                  className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                  title="Link"
                >
                  <IoLink />
                </button>
                <button
                  type="button"
                  onClick={handleInsertImageInContent}
                  className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                  title="Insert Image"
                >
                  <IoImage />
                </button>
                <button
                  type="button"
                  onClick={() => insertText("`", "`")}
                  className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
                  title="Code"
                >
                  <IoCode />
                </button>
              </div>

              {previewMode ? (
                <div className="p-6 min-h-[500px] prose prose-lg dark:prose-invert max-w-none prose-img:rounded-xl">
                  {/* Only simple markdown preview - for full parsing use react-markdown if needed later */}
                  <div
                    dangerouslySetInnerHTML={{
                      __html: formData.content.replace(/\n/g, "<br/>"),
                    }}
                  />
                  <p className="text-xs text-gray-400 italic mt-4 border-t pt-4">
                    Preview mode raw output (Install react-markdown for full
                    preview)
                  </p>
                </div>
              ) : (
                <textarea
                  ref={textareaRef}
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Mulai tulis reviewmu disini..."
                  className="w-full p-6 min-h-[500px] bg-transparent outline-none text-lg leading-relaxed text-gray-800 dark:text-gray-200 resize-y font-serif"
                />
              )}
            </motion.div>
          </div>

          {/* Right Column: Meta Data */}
          <div className="space-y-6">
            {/* Action Card */}
            <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-brand-600 text-white rounded-xl font-bold text-lg hover:bg-brand-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-brand-500/30 disabled:opacity-70 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <IoSave className="w-5 h-5" />
                    Terbitkan
                  </>
                )}
              </button>
            </div>

            {/* Rating Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800"
            >
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <IoStar className="text-yellow-400" /> Rating Buku
              </h3>
              <div className="flex justify-between px-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRating(star)}
                    onMouseEnter={() => !formData.rating && handleRating(star)} // Hover effect optional hint
                    className={`p-2 rounded-xl transition-all duration-300 ${
                      formData.rating >= star
                        ? "text-yellow-400 bg-yellow-400/10 scale-110 shadow-lg shadow-yellow-400/20"
                        : "text-gray-300 bg-gray-50 dark:bg-gray-800 hover:text-yellow-300"
                    }`}
                  >
                    <IoStar className="w-8 h-8" />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Book Details Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 space-y-4"
            >
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <IoBook className="text-brand-500" /> Detail Buku
              </h3>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  Judul Buku
                </label>
                <input
                  type="text"
                  name="book_title"
                  value={formData.book_title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-brand-500 text-sm"
                  placeholder="Harry Potter..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  Penulis
                </label>
                <input
                  type="text"
                  name="book_author"
                  value={formData.book_author}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-brand-500 text-sm"
                  placeholder="J.K. Rowling..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  Kategori
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-brand-500 text-sm text-gray-900 dark:text-white appearance-none cursor-pointer"
                >
                  <option value="" className="text-gray-500">
                    Pilih Kategori...
                  </option>
                  {categories.map((c) => (
                    <option
                      key={c.id}
                      value={c.id}
                      className="dark:bg-gray-900"
                    >
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>

            {/* Cover Upload Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800"
            >
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <IoImage className="text-purple-500" /> Cover Buku
              </h3>

              <div
                className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${dragActive ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20" : "border-gray-300 dark:border-gray-700 hover:border-brand-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {formData.cover_url ? (
                  <div className="relative w-full aspect-[2/3] rounded-lg overflow-hidden shadow-md group">
                    <Image
                      src={formData.cover_url}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white font-bold text-sm">
                        Ganti Cover
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-gray-400">
                    <IoCloudUpload className="w-10 h-10 mx-auto mb-2" />
                    <p className="text-xs font-bold">Klik atau drag file</p>
                    <p className="text-[10px] mt-1">JPG, PNG, WEBP (Max 2MB)</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  );
}

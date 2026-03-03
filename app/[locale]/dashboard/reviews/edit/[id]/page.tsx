"use client";

import { useState, useEffect, useRef, use } from "react";
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
  IoImage,
  IoLink,
  IoList,
  IoEye,
  IoCode,
  IoCreate,
} from "react-icons/io5";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { createClient } from "@/lib/supabase/client";

export default function EditReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    category_id: "",
    rating: 0,
    content: "",
    cover_url: "",
  });

  // Fetch Data on Mount
  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      
      // Fetch Categories
      const { data: cats } = await supabase.from("categories").select("id, name");
      if (cats) setCategories(cats);

      // Fetch Review
      const { data: review, error } = await supabase
        .from("book_reviews")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !review) {
        Swal.fire({
          icon: "error",
          title: "Review Tidak Ditemukan",
          text: "Review yang ingin Anda edit tidak dapat ditemukan.",
        });
        router.push("/dashboard/reviews");
        return;
      }

      setFormData({
        title: review.title,
        book_title: review.book_title,
        book_author: review.book_author,
        category_id: review.category_id || "",
        rating: review.rating,
        content: review.content,
        cover_url: review.book_cover_url || "",
      });
      setIsLoading(false);
    }
    fetchData();
  }, [id, router]);

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
    setCoverFile(file);
    const preview = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, cover_url: preview }));
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      let finalCoverUrl = formData.cover_url;

      if (coverFile) {
        const fileName = `${Date.now()}-${coverFile.name.replace(/\s/g, "_")}`;
        const { error: uploadError } = await supabase.storage
          .from("library-covers")
          .upload(fileName, coverFile);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("library-covers").getPublicUrl(fileName);

        finalCoverUrl = publicUrl;
      }

      const { error: updateError } = await supabase
        .from("book_reviews")
        .update({
          title: formData.title,
          book_title: formData.book_title,
          book_author: formData.book_author,
          content: formData.content,
          rating: formData.rating,
          book_cover_url: finalCoverUrl,
          category_id: formData.category_id || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateError) throw updateError;

      Swal.fire({
        icon: "success",
        title: "Berhasil Diperbarui!",
        text: "Review Anda telah berhasil diperbarui.",
        confirmButtonColor: "#4F46E5",
      }).then(() => {
        router.push("/dashboard/reviews");
      });
    } catch (error: any) {
      console.error("Update Error:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal Memperbarui",
        text: error.message || "Terjadi kesalahan saat memperbarui review.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 pb-20">
      <div className="container-custom max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              href="/dashboard/reviews"
              className="flex items-center gap-2 text-gray-500 hover:text-brand-600 transition-colors mb-2"
            >
              <IoArrowBack /> Kembali ke Daftar Review
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Edit Review
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-4 py-2 rounded-lg font-bold border transition-all ${
              previewMode
                ? "bg-brand-50 border-brand-200 text-brand-600 dark:bg-brand-900/30"
                : "bg-white border-gray-200 text-gray-600 dark:bg-gray-800"
            }`}
          >
            {previewMode ? "Mode Edit" : "Preview"}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_350px] gap-8">
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">
                Judul Review
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full text-2xl font-bold bg-transparent outline-none text-gray-900 dark:text-white"
                placeholder="Judul review..."
              />
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex gap-2">
                <button type="button" onClick={() => insertText("**", "**")} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">B</button>
                <button type="button" onClick={() => insertText("*", "*")} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">I</button>
                <button type="button" onClick={() => insertText("# ")} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-sm font-bold">H1</button>
              </div>
              {previewMode ? (
                <div className="p-6 min-h-[500px] prose dark:prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: formData.content.replace(/\n/g, "<br/>") }} />
                </div>
              ) : (
                <textarea
                  ref={textareaRef}
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  className="w-full p-6 min-h-[500px] bg-transparent outline-none text-gray-800 dark:text-gray-200 resize-y"
                  placeholder="Isi review..."
                />
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <h3 className="font-bold mb-4 flex items-center gap-2"><IoStar className="text-yellow-400"/> Rating</h3>
              <div className="flex justify-between">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button" onClick={() => handleRating(s)} className={`text-2xl ${formData.rating >= s ? "text-yellow-400" : "text-gray-300"}`}>
                    <IoStar />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
              <h3 className="font-bold flex items-center gap-2"><IoBook className="text-brand-500"/> Detail Buku</h3>
              <input type="text" name="book_title" value={formData.book_title} onChange={handleChange} className="w-full p-2 bg-gray-50 dark:bg-gray-800 rounded border-none text-sm" placeholder="Judul Buku" />
              <input type="text" name="book_author" value={formData.book_author} onChange={handleChange} className="w-full p-2 bg-gray-50 dark:bg-gray-800 rounded border-none text-sm" placeholder="Penulis" />
              <select name="category_id" value={formData.category_id} onChange={handleChange} className="w-full p-2 bg-gray-50 dark:bg-gray-800 rounded border-none text-sm">
                <option value="">Pilih Kategori...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <h3 className="font-bold mb-4 flex items-center gap-2"><IoImage className="text-purple-500"/> Cover</h3>
              <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 text-center cursor-pointer">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                {formData.cover_url ? (
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden">
                    <Image src={formData.cover_url} alt="Cover" fill className="object-cover" />
                  </div>
                ) : (
                  <IoCloudUpload className="w-10 h-10 mx-auto text-gray-400" />
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

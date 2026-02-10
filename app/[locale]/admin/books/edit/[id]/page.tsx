"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import Swal from "sweetalert2";
import { IoCloudUpload, IoImage, IoSave, IoArrowBack } from "react-icons/io5";

export default function AdminEditBookPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    year: "",
    category_id: "",
    cover_url: "",
  });

  const [newCoverFile, setNewCoverFile] = useState<File | null>(null);

  // Check Admin & Fetch Data
  useEffect(() => {
    async function init() {
      if (!session?.user?.email) return;

      // 1. Check Admin Role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("email", session.user.email)
        .single();

      if (profile?.role !== "admin") {
        router.push("/");
        return;
      }
      setIsAdmin(true);

      // 2. Fetch Categories
      const { data: cats } = await supabase
        .from("categories")
        .select("id, name");
      if (cats) setCategories(cats);

      // 3. Fetch Book Data
      if (params.id) {
        const { data: book, error } = await supabase
          .from("books")
          .select("*")
          .eq("id", params.id)
          .single();

        if (error) {
          console.error("Error fetching book:", error);
          Swal.fire("Error", "Buku tidak ditemukan", "error");
          router.push("/admin/books");
        } else if (book) {
          setFormData({
            title: book.title,
            author: book.author,
            description: book.description || "",
            year: book.year?.toString() || "",
            category_id: book.category_id || "",
            cover_url: book.cover_url || "",
          });
        }
      }
      setLoading(false);
    }

    init();
  }, [session, params.id, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let coverUrl = formData.cover_url;

      // 1. Upload New Cover if selected
      if (newCoverFile) {
        const coverName = `${Date.now()}-${newCoverFile.name.replace(/\s/g, "_")}`;
        const { error: coverError } = await supabase.storage
          .from("library-covers")
          .upload(coverName, newCoverFile);

        if (coverError) throw coverError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("library-covers").getPublicUrl(coverName);

        coverUrl = publicUrl;
      }

      // 2. Update Database
      const { error: dbError } = await supabase
        .from("books")
        .update({
          title: formData.title,
          author: formData.author,
          description: formData.description,
          year: parseInt(formData.year),
          category_id: formData.category_id || null,
          cover_url: coverUrl,
        })
        .eq("id", params.id);

      if (dbError) throw dbError;

      Swal.fire({
        title: "Berhasil!",
        text: "Data buku berhasil diperbarui.",
        icon: "success",
      });

      router.push("/admin/books");
    } catch (error: any) {
      console.error(error);
      Swal.fire("Gagal", error.message || "Gagal menyimpan perubahan", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!isAdmin) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <IoArrowBack className="mr-2" /> Kembali
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Edit Buku
        </h1>
      </div>

      <Card>
        <div className="p-8">
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Judul Buku"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
              <Input
                label="Penulis"
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Kategori
                </label>
                <select
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-brand-500 outline-none transition-all"
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Tahun Terbit"
                type="number"
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Deskripsi Singkat
              </label>
              <textarea
                className="w-full h-32 px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-brand-500 outline-none transition-all resize-none"
                placeholder="Sinopsis buku..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Update Sampul (Opsional)
              </h3>

              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Existing/Preview Cover */}
                <div className="w-32 h-48 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 border border-gray-300 dark:border-gray-600">
                  {newCoverFile ? (
                    <img
                      src={URL.createObjectURL(newCoverFile)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : formData.cover_url ? (
                    <img
                      src={formData.cover_url}
                      alt="Current Cover"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <IoImage size={32} />
                    </div>
                  )}
                </div>

                {/* Upload input */}
                <div className="flex-1 w-full">
                  <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-center cursor-pointer relative h-32 flex flex-col items-center justify-center">
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) =>
                        setNewCoverFile(e.target.files?.[0] || null)
                      }
                    />
                    <IoImage className="mx-auto h-8 w-8 text-indigo-500 mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {newCoverFile
                        ? newCoverFile.name
                        : "Klik untuk ganti sampul"}
                    </p>
                    <p className="text-xs text-gray-500">JPG/PNG Maks 5MB</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSaving}
              >
                Batal
              </Button>
              <Button type="submit" variant="primary" isLoading={isSaving}>
                <IoSave className="mr-2 h-5 w-5" />
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

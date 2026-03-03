"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import Swal from "sweetalert2";
import { IoCloudUpload, IoBook, IoImage, IoLibrary } from "react-icons/io5";

export default function AdminUploadPage() {
  const t = useTranslations("admin.upload");
  const commonT = useTranslations("common");
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    year: new Date().getFullYear().toString(),
    category_id: "",
  });

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);



  // Check Admin Status
  useEffect(() => {
    if (status === "loading") return;

    // Log for debugging
    console.log("Current Session User:", session?.user);
    console.log("Current Role:", session?.user?.role);

    if (session?.user?.role === "admin") {
      setIsAdmin(true);
    } else {
      // Only redirect if NOT currently uploading
      if (!isUploading) {
        console.warn("Not an admin, redirecting to homepage...");
        router.push("/");
      }
    }
    
    async function fetchCategories() {
      const supabase = createClient();
      const { data } = await supabase.from("categories").select("id, name");
      if (data) setCategories(data);
    }

    fetchCategories();
    setIsLoading(false);
  }, [session, status, router, isUploading]);

  const handleUpload = async (e: React.FormEvent) => {
    const supabase = createClient();
    e.preventDefault();
    if (!pdfFile || !formData.title || !formData.author) {
      Swal.fire("Error", "Missing required fields", "error");
      return;
    }

    setIsUploading(true);

    try {
      // 1. Upload Cover (Optional)
      let coverUrl = null;
      if (coverFile) {
        const coverName = `${Date.now()}-${coverFile.name.replace(/\s/g, "_")}`;
        const { data: coverData, error: coverError } = await supabase.storage
          .from("library-covers")
          .upload(coverName, coverFile);

        if (coverError) throw coverError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("library-covers").getPublicUrl(coverName);
        coverUrl = publicUrl;
      }

      // 2. Upload PDF (Required)
      const pdfName = `${Date.now()}-${pdfFile.name.replace(/\s/g, "_")}`;
      const { data: pdfData, error: pdfError } = await supabase.storage
        .from("library-books")
        .upload(pdfName, pdfFile);

      if (pdfError) throw pdfError;

      const {
        data: { publicUrl: pdfUrl },
      } = supabase.storage.from("library-books").getPublicUrl(pdfName);

      // 3. Insert to DB
      const slug =
        formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") +
        "-" +
        Date.now();

      const { error: dbError } = await supabase.from("books").insert({
        title: formData.title,
        author: formData.author,
        description: formData.description,
        year: parseInt(formData.year),
        category_id: formData.category_id || null,
        cover_url: coverUrl,
        pdf_url: pdfUrl,
        slug: slug,
        uploaded_by: session?.user?.id,
      });

      if (dbError) {
        console.error("Database Insertion Error:", dbError);
        throw dbError;
      }

      await Swal.fire(commonT("success"), "", "success");

      router.push("/admin/books");
    } catch (error: any) {
      console.error("Upload process error:", error);
      Swal.fire(
        "Error",
        error.message || "Upload failed",
        "error",
      );
      setIsUploading(false); // Reset if failed
    }
  };

  if (isLoading) return <div className="p-10 text-center">{commonT("loading")}</div>;

  if (!isAdmin && !isUploading) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <IoLibrary className="mx-auto h-12 w-12 text-brand-600 dark:text-brand-400" />
          <h1 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
            {t("title")}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t("subtitle")}
          </p>
        </div>

        <Card>
          <Card.Content className="p-8">
            <form onSubmit={handleUpload} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label={t("form.title")}
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
                <Input
                  label={t("form.author")}
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
                    {t("form.category")}
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-brand-500 outline-none transition-all"
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData({ ...formData, category_id: e.target.value })
                    }
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label={t("form.year")}
                  type="number"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t("form.description")}
                </label>
                <textarea
                  className="w-full h-32 px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-brand-500 outline-none transition-all resize-none"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {t("form.fileUpload")}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* PDF Upload */}
                  <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-center cursor-pointer relative">
                    <input
                      type="file"
                      accept=".pdf"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                    />
                    <IoBook className="mx-auto h-8 w-8 text-brand-500 mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {pdfFile ? pdfFile.name : t("form.pdf")}
                    </p>
                  </div>

                  {/* Cover Upload */}
                  <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-center cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) =>
                        setCoverFile(e.target.files?.[0] || null)
                      }
                    />
                    <IoImage className="mx-auto h-8 w-8 text-indigo-500 mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {coverFile ? coverFile.name : t("form.cover")}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isUploading}
              >
                <IoCloudUpload className="mr-2 h-5 w-5" />
                {t("form.submit")}
              </Button>
            </form>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}

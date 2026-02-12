"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { IoSearch, IoTrash, IoCreate, IoAdd, IoFilter } from "react-icons/io5";
import Swal from "sweetalert2";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminBooksPage() {
  const t = useTranslations("admin.books");
  const commonT = useTranslations("common");
  const router = useRouter();
  const [books, setBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const LIMIT = 10;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [page, search, selectedCategory]);

  const fetchCategories = async () => {
    const supabase = createClient();
    const { data } = await supabase.from("categories").select("id, name").order("name");
    if (data) setCategories(data);
  };

  const fetchBooks = async () => {
    const supabase = createClient();
    setLoading(true);
    try {
      let query = supabase.from("books").select(
        `
          *,
          categories (name)
        `,
        { count: "exact" },
      );

      if (search) {
        query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%`);
      }

      if (selectedCategory) {
        query = query.eq("category_id", selectedCategory);
      }

      const from = (page - 1) * LIMIT;
      const to = from + LIMIT - 1;

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      setBooks(data || []);
      if (count) {
        setTotalPages(Math.ceil(count / LIMIT));
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (book: any) => {
    const supabase = createClient();
    const result = await Swal.fire({
      title: t("deleteConfirm"),
      text: t("deleteWarning", { title: book.title }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: commonT("delete"),
      cancelButtonText: commonT("cancel"),
    });

    if (result.isConfirmed) {
      try {
        if (book.pdf_url) {
          const pdfPath = book.pdf_url.split("/").pop();
          if (pdfPath) {
            await supabase.storage.from("library-books").remove([pdfPath]);
          }
        }
        if (book.cover_url) {
          const coverPath = book.cover_url.split("/").pop();
          if (coverPath) {
            await supabase.storage.from("library-covers").remove([coverPath]);
          }
        }

        const { error } = await supabase.from("books").delete().eq("id", book.id);
        if (error) throw error;

        Swal.fire(commonT("success"), "", "success");
        fetchBooks();
      } catch (error: any) {
        Swal.fire("Error", error.message, "error");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("title")}
        </h1>
        <Link href="/admin/upload">
          <Button>
            <IoAdd className="mr-2 h-5 w-5" />
            {t("add")}
          </Button>
        </Link>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t("search")}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <IoFilter className="text-gray-400" />
            <select
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="">{commonT("filter")}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold">
              <tr>
                <th className="px-6 py-3">{t("table.title")}</th>
                <th className="px-6 py-3">{t("table.author")}</th>
                <th className="px-6 py-3">{t("table.category")}</th>
                <th className="px-6 py-3">{t("table.year")}</th>
                <th className="px-6 py-3 text-right">{t("table.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    {commonT("loading")}
                  </td>
                </tr>
              ) : books.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    No books found.
                  </td>
                </tr>
              ) : (
                books.map((book) => (
                  <tr
                    key={book.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {book.title}
                    </td>
                    <td className="px-6 py-4">{book.author}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-300">
                        {book.categories?.name || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">{book.year}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link href={`/admin/books/edit/${book.id}`}>
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title={commonT("edit")}
                        >
                          <IoCreate className="w-5 h-5" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(book)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title={commonT("delete")}
                      >
                        <IoTrash className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-center gap-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 text-sm font-medium">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
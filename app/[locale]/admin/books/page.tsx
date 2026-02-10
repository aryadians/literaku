"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { IoSearch, IoTrash, IoCreate, IoAdd } from "react-icons/io5";
import Swal from "sweetalert2";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminBooksPage() {
  const router = useRouter();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const LIMIT = 10;

  useEffect(() => {
    fetchBooks();
  }, [page, search]);

  const fetchBooks = async () => {
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

  const handleDelete = async (id: string, title: string) => {
    const result = await Swal.fire({
      title: "Hapus Buku?",
      text: `Anda yakin ingin menghapus "${title}"? Tindakan ini tidak dapat dibatalkan.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        // 1. Delete file from storage (optional, but good practice)
        // We'd need the file path, but usually it's derived from URL or stored.
        // For now, let's just delete the record, dependent on requirements.
        // Actually, let's just delete the DB record. Storage cleanup can be a separate task.

        const { error } = await supabase.from("books").delete().eq("id", id);
        if (error) throw error;

        Swal.fire("Terhapus!", "Buku berhasil dihapus.", "success");
        fetchBooks(); // Refresh list
      } catch (error: any) {
        Swal.fire("Gagal", error.message || "Gagal menghapus buku", "error");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Kelola Buku
        </h1>
        <Link href="/admin/upload">
          <Button>
            <IoAdd className="mr-2 h-5 w-5" />
            Tambah Buku
          </Button>
        </Link>
      </div>

      <Card>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex gap-4">
          <div className="relative flex-1">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari judul atau penulis..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1); // Reset to page 1 on search
              }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold">
              <tr>
                <th className="px-6 py-3">Judul</th>
                <th className="px-6 py-3">Penulis</th>
                <th className="px-6 py-3">Kategori</th>
                <th className="px-6 py-3">Tahun</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    Loading books...
                  </td>
                </tr>
              ) : books.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    Tidak ada buku ditemukan.
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
                          title="Edit"
                        >
                          <IoCreate className="w-5 h-5" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(book.id, book.title)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Hapus"
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

        {/* Pagination */}
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

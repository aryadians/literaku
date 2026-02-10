"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IoSearch, IoTrash, IoStar } from "react-icons/io5";
import Swal from "sweetalert2";
import Link from "next/link";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 10;

  useEffect(() => {
    fetchReviews();
  }, [page, search]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      // Note: We need to make sure foreign keys exist for this join to work seamlessly.
      // If no explicit FK in Supabase UI, we might need to rely on matching columns.
      // Assuming 'book_id' references 'books.id' and 'user_id' references 'profiles.id'.

      let query = supabase.from("book_reviews").select(
        `
          *,
          books (title),
          profiles (full_name, username)
        `,
        { count: "exact" },
      );

      if (search) {
        // Search in review content or join fields (complex)
        // Simple search on content first
        query = query.ilike("comment", `%${search}%`);
      }

      const from = (page - 1) * LIMIT;
      const to = from + LIMIT - 1;

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;

      setReviews(data || []);
      if (count) {
        setTotalPages(Math.ceil(count / LIMIT));
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Hapus Ulasan?",
      text: "Tindakan ini tidak dapat dibatalkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus!",
    });

    if (result.isConfirmed) {
      const { error } = await supabase
        .from("book_reviews")
        .delete()
        .eq("id", id);
      if (error) {
        Swal.fire("Gagal", error.message, "error");
      } else {
        Swal.fire("Berhasil", "Ulasan berhasil dihapus", "success");
        fetchReviews();
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Moderasi Ulasan
      </h1>

      <Card>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative max-w-md">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari isi ulasan..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Buku</th>
                <th className="px-6 py-3">Rating</th>
                <th className="px-6 py-3">Ulasan</th>
                <th className="px-6 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    Loading reviews...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    Tidak ada ulasan ditemukan.
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr
                    key={review.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {review.profiles?.full_name ||
                          review.profiles?.username ||
                          "Unknown"}
                      </div>
                      <div className="text-xs text-gray-500">
                        @{review.profiles?.username || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {review.books?.title || "Unknown Book"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-yellow-400">
                        <IoStar className="w-4 h-4 mr-1" />
                        <span className="text-gray-900 dark:text-white font-medium">
                          {review.rating}
                        </span>
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 max-w-xs truncate"
                      title={review.comment}
                    >
                      {review.comment}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Hapus Ulasan"
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

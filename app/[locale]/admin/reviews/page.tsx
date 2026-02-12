"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IoSearch, IoTrash, IoStar, IoFilter } from "react-icons/io5";
import Swal from "sweetalert2";

export default function AdminReviewsPage() {
  const t = useTranslations("admin");
  const commonT = useTranslations("common");
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 10;

  const supabase = createClient();

  useEffect(() => {
    fetchReviews();
  }, [page, search, ratingFilter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      let query = supabase.from("book_reviews").select(
        `
          *,
          books:book_reference_id (title),
          profiles:user_id (full_name, username)
        `,
        { count: "exact" },
      );

      if (search) {
        query = query.or(`content.ilike.%${search}%,book_title.ilike.%${search}%`);
      }

      if (ratingFilter) {
        query = query.eq("rating", parseInt(ratingFilter));
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
      title: commonT("delete") + "?",
      text: "...",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: commonT("delete"),
    });

    if (result.isConfirmed) {
      const { error } = await supabase
        .from("book_reviews")
        .delete()
        .eq("id", id);
      if (error) {
        Swal.fire("Error", error.message, "error");
      } else {
        Swal.fire(commonT("success"), "", "success");
        fetchReviews();
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {t("manageReviews")}
      </h1>

      <Card>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={commonT("search")}
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
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">{commonT("rating")}</option>
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r} Stars
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white font-semibold">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Book</th>
                <th className="px-6 py-3">Rating</th>
                <th className="px-6 py-3">Review</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    {commonT("loading")}
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    No reviews found.
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
                      {review.books?.title || review.book_title || "Unknown Book"}
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
                      title={review.content}
                    >
                      {review.content}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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

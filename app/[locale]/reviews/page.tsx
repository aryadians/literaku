"use client";

import { useEffect, useState, Suspense } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ReviewsGridSkeleton } from "@/components/ui/ReviewSkeleton";
import { IoStar, IoEye, IoHeart, IoFilter, IoClose } from "react-icons/io5";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Button } from "@/components/ui/Button";
import { IoAdd } from "react-icons/io5";

// Define Review Interface
interface Review {
  id: string;
  title: string;
  slug: string;
  book_title: string;
  book_author: string;
  book_cover_url: string | null;
  excerpt: string;
  rating: number;
  views: number;
  created_at: string;
  categories: {
    name: string;
    slug: string;
  } | null;
  review_likes: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

function ReviewsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search");
  const categoryParam = searchParams.get("category");

  // Construct API URL key for SWR
  let url = "/api/reviews?limit=12";
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (categoryParam) url += `&category=${encodeURIComponent(categoryParam)}`;

  // Use SWR for reviews
  const { data, error, isLoading } = useSWR(url, fetcher);
  const reviews = data?.reviews || [];

  // Categories can also use SWR for caching!
  const { data: categoriesData } = useSWR(
    "/api/categories-simple",
    async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      return data || [];
    },
  );
  const categories = categoriesData || [];

  const updateFilter = (cSlug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cSlug) params.set("category", cSlug);
    else params.delete("category");
    router.push(`/reviews?${params.toString()}`);
  };

  const clearSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    router.push(`/reviews?${params.toString()}`);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 flex items-center justify-center">
        <p className="text-red-500 dark:text-red-400">Gagal memuat review.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
      <div className="container-custom">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
              {categoryParam
                ? `Kategori: ${categories.find((c) => c.slug === categoryParam)?.name || categoryParam}`
                : "Semua Review"}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {reviews.length} review ditemukan
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/reviews/create">
              <Button size="md" className="gap-2 hidden md:inline-flex">
                <IoAdd className="text-xl" /> Tulis Review
              </Button>
              {/* Mobile Icon Button */}
              <Button size="md" className="md:hidden px-3 aspect-square">
                <IoAdd className="text-xl" />
              </Button>
            </Link>

            {/* Filter Dropdown */}
            <div className="relative group">
              <select
                className="appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                onChange={(e) => updateFilter(e.target.value || null)}
                value={categoryParam || ""}
              >
                <option value="">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
              <IoFilter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Search Feedback */}
        {search && (
          <div className="mb-8 flex items-center gap-2 bg-brand-50 dark:bg-brand-900/20 px-4 py-2 rounded-lg text-brand-700 dark:text-brand-300 inline-flex">
            <span>
              Hasil pencarian untuk: <strong>&quot;{search}&quot;</strong>
            </span>
            <button
              onClick={clearSearch}
              className="ml-2 hover:bg-brand-100 dark:hover:bg-brand-800 rounded-full p-1"
            >
              <IoClose />
            </button>
          </div>
        )}

        {/* Grid Content */}
        {isLoading ? (
          <ReviewsGridSkeleton count={8} />
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              Tidak ada hasil yang ditemukan
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Coba kata kunci lain atau ubah filter kategori.
            </p>
            {(search || categoryParam) && (
              <button
                onClick={() => router.push("/reviews")}
                className="px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Reset Filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/reviews/${review.slug}`}
                  className="group h-full flex flex-col"
                >
                  <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                    {/* Cover */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-200">
                      {review.book_cover_url ? (
                        <Image
                          src={review.book_cover_url}
                          alt={review.book_title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Cover
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-white/90 dark:bg-black/80 backdrop-blur-sm rounded-md text-xs font-bold text-gray-800 dark:text-white shadow-sm flex items-center gap-1">
                          <IoStar className="text-yellow-400" /> {review.rating}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1">
                      {review.categories && (
                        <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 mb-2 uppercase tracking-wider">
                          {review.categories.name}
                        </span>
                      )}

                      <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight mb-2 line-clamp-2 group-hover:text-brand-600 transition-colors">
                        {review.book_title}
                      </h3>

                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        {review.book_author}
                      </p>

                      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <IoEye /> {review.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <IoHeart /> {review.review_likes}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <Suspense fallback={<ReviewsGridSkeleton count={8} />}>
      <ReviewsContent />
    </Suspense>
  );
}

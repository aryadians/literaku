"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ReviewsGridSkeleton } from "@/components/ui/ReviewSkeleton";
import { IoStar, IoEye, IoHeart } from "react-icons/io5";
import Link from "next/link";
import Image from "next/image";

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
  profiles: {
    name: string;
    avatar_url: string | null;
  };
  categories: {
    name: string;
    slug: string;
  } | null;
  review_likes: number; // API returns count now
}

import { useSearchParams } from "next/navigation";

export default function ReviewsPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const search = searchParams.get("search");

  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReviews();
  }, [search]); // Re-fetch when search changes

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      let url = "/api/reviews?limit=12";
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Gagal memuat review. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 py-12">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 gradient-text">
            Semua Review Buku
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Jelajahi koleksi review buku terbaik dari komunitas kami
          </p>
        </motion.div>

        {/* Content */}
        {isLoading ? (
          <ReviewsGridSkeleton count={12} />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={fetchReviews}
              className="mt-4 px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              Belum ada review. Jadilah yang pertama membuat review!
            </p>
            <Link
              href="/dashboard/reviews/new"
              className="inline-block mt-4 px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
            >
              Buat Review
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/reviews/${review.slug}`}>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card hover:shadow-glow-md transition-all duration-300 overflow-hidden group h-full flex flex-col">
                    {/* Book Cover */}
                    <div className="relative h-64 bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900 dark:to-brand-950 overflow-hidden">
                      {review.book_cover_url ? (
                        <Image
                          src={review.book_cover_url}
                          alt={review.book_title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-32 h-48 bg-gradient-to-br from-brand-300 to-brand-400 rounded-lg shadow-lg flex items-center justify-center">
                            <span className="text-white text-4xl">📖</span>
                          </div>
                        </div>
                      )}

                      {/* Category Badge */}
                      {review.categories && (
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full text-xs font-semibold text-brand-600 dark:text-brand-400">
                            {review.categories.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                          <IoStar
                            key={i}
                            className={`w-5 h-5 ${
                              i < review.rating
                                ? "text-yellow-400"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          />
                        ))}
                      </div>

                      {/* Book Title */}
                      <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {review.book_title}
                      </h3>

                      {/* Author */}
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        oleh {review.book_author}
                      </p>

                      {/* Excerpt */}
                      <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3 flex-1">
                        {review.excerpt}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <IoEye className="w-4 h-4" />
                            {review.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <IoHeart className="w-4 h-4" />
                            {review.review_likes || 0}
                          </span>
                        </div>
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

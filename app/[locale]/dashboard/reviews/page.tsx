"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { IoAdd, IoStar, IoPencil, IoTrash } from "react-icons/io5";

export default function MyReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch user reviews (simulated for now since we don't have the specific endpoint yet)
    // Ideally create /api/user/reviews
    setIsLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Review Saya
          </h1>
          <Link
            href="/dashboard/reviews/new"
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-semibold"
          >
            <IoAdd className="w-5 h-5" />
            Buat Baru
          </Link>
        </div>

        {reviews.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-12 text-center border border-gray-100 dark:border-gray-800">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              📝
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Belum ada review
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Mulai bagikan pendapatmu tentang buku favorit!
            </p>
            <Link
              href="/dashboard/reviews/new"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-bold"
            >
              Mulai Menulis
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {/* Review List Item */}
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-4"
              >
                {/* Image */}
                <div className="w-full md:w-32 h-48 md:h-24 bg-gray-200 rounded-lg relative overflow-hidden flex-shrink-0">
                  {review.book_cover_url && (
                    <Image
                      src={review.book_cover_url}
                      alt={review.book_title}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-1 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 text-xs font-bold rounded">
                      {review.category?.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {review.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Buku: {review.book_title}
                  </p>
                  <div className="flex items-center gap-1 text-yellow-400 text-sm">
                    <IoStar /> <span>{review.rating}/5</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-row md:flex-col items-center justify-center gap-2 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800 pt-4 md:pt-0 md:pl-4">
                  <button className="p-2 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                    <IoPencil className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <IoTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

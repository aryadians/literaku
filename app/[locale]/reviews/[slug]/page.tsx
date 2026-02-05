"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import ReactMarkdown from "react-markdown";
import {
  IoStar,
  IoCalendar,
  IoPerson,
  IoHeart,
  IoShareSocial,
  IoArrowBack,
  IoEye,
  IoBook,
} from "react-icons/io5";
import { Skeleton } from "@/components/ui/Skeleton";

interface ReviewDetail {
  id: string;
  title: string;
  book_title: string;
  book_author: string;
  book_cover_url: string | null;
  content: string;
  rating: number;
  views: number;
  created_at: string;
  profiles: {
    name: string;
    avatar_url: string | null;
    bio: string | null;
  };
  categories: {
    name: string;
    slug: string;
  } | null;
  review_likes: any[];
}

export default function ReviewDetailPage() {
  const params = useParams();
  const [review, setReview] = useState<ReviewDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (params.slug) {
      fetchReview(params.slug as string);
    }
  }, [params.slug]);

  const fetchReview = async (slug: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/reviews/${slug}`);

      if (!response.ok) {
        throw new Error("Review tidak ditemukan");
      }

      const data = await response.json();
      setReview(data.review);
    } catch (err) {
      console.error("Error fetching review:", err);
      setError("Gagal memuat review.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <ReviewDetailSkeleton />;
  }

  if (error || !review) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          {error || "Review tidak ditemukan"}
        </h1>
        <Link
          href="/reviews"
          className="text-brand-600 hover:underline flex items-center gap-2"
        >
          <IoArrowBack /> Kembali ke Daftar Review
        </Link>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      {/* Hero Header with Blur Background */}
      <div className="relative w-full h-[50vh] min-h-[400px] overflow-hidden">
        {/* Blurred Background Image */}
        <div className="absolute inset-0 bg-gray-900">
          {review.book_cover_url && (
            <Image
              src={review.book_cover_url}
              alt={review.book_title}
              fill
              className="object-cover opacity-30 blur-xl scale-110"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-gray-950 via-transparent to-black/30" />
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-center container-custom pt-20">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8 w-full max-w-5xl">
            {/* Book Cover */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative w-48 h-72 md:w-64 md:h-96 flex-shrink-0 rounded-lg shadow-2xl overflow-hidden border-4 border-white dark:border-gray-800 transform md:translate-y-12"
            >
              {review.book_cover_url ? (
                <Image
                  src={review.book_cover_url}
                  alt={review.book_title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
                  <IoBook className="w-16 h-16 text-brand-500" />
                </div>
              )}
            </motion.div>

            {/* Title & Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center md:text-left text-white pb-8 md:pb-0 flex-1"
            >
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                {review.categories && (
                  <span className="px-3 py-1 bg-brand-500 text-white text-sm font-bold rounded-full shadow-lg">
                    {review.categories.name}
                  </span>
                )}
                <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full text-yellow-400">
                  <IoStar className="w-4 h-4" />
                  <span className="font-bold text-white">
                    {review.rating}/5
                  </span>
                </div>
              </div>

              <h1 className="text-3xl md:text-5xl font-black mb-2 leading-tight drop-shadow-lg">
                {review.title}
              </h1>
              <h2 className="text-xl text-gray-200 font-medium mb-6 drop-shadow-md">
                Review buku &quot;{review.book_title}&quot; karya{" "}
                {review.book_author}
              </h2>

              {/* Reviewer Info */}
              <div className="flex items-center justify-center md:justify-start gap-4">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden relative">
                    {review.profiles.avatar_url ? (
                      <Image
                        src={review.profiles.avatar_url}
                        alt={review.profiles.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <IoPerson className="w-full h-full p-1 text-gray-400" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-300 uppercase tracking-wider font-semibold">
                      Direview oleh
                    </p>
                    <p className="text-sm font-bold text-white">
                      {review.profiles.name}
                    </p>
                  </div>
                </div>

                <div className="text-sm text-gray-300 flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <IoCalendar className="w-4 h-4" />
                    {format(new Date(review.created_at), "d MMM yyyy", {
                      locale: idLocale,
                    })}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom max-w-4xl pt-24 md:pt-20">
        <div className="grid md:grid-cols-[1fr_300px] gap-12">
          {/* Left Column: Review Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-8 md:p-10 mb-8 border border-gray-100 dark:border-gray-800">
              <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-brand-600">
                <ReactMarkdown>{review.content}</ReactMarkdown>
              </div>
            </div>

            {/* Engagement Actions */}
            <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-6">
                <button className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors group">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full group-hover:bg-red-50 dark:group-hover:bg-red-900/20 transition-colors">
                    <IoHeart className="w-6 h-6" />
                  </div>
                  <span className="font-semibold">
                    {review.review_likes?.length || 0} Suka
                  </span>
                </button>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <IoEye className="w-5 h-5" />
                  <span>{review.views} Views</span>
                </div>
              </div>

              <button className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-semibold hover:underline">
                <IoShareSocial className="w-5 h-5" />
                Bagikan
              </button>
            </div>
          </motion.div>

          {/* Right Column: Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-8"
          >
            {/* Author Profile Card */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800 sticky top-24">
              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                Tentang Reviewer
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden relative">
                  {review.profiles.avatar_url ? (
                    <Image
                      src={review.profiles.avatar_url}
                      alt={review.profiles.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <IoPerson className="w-full h-full p-3 text-gray-400" />
                  )}
                </div>
                <div>
                  <Link
                    href={`/profile/${review.profiles.name}`}
                    className="text-lg font-bold text-gray-900 dark:text-white hover:text-brand-600 hover:underline"
                  >
                    {review.profiles.name}
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Bergabung sejak 2024
                  </p>
                </div>
              </div>
              {review.profiles.bio && (
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed">
                  {review.profiles.bio}
                </p>
              )}
              <button className="w-full py-2 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-bold rounded-lg hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors">
                Lihat Profil
              </button>
            </div>
          </motion.aside>
        </div>
      </div>
    </article>
  );
}

function ReviewDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="w-full h-[50vh] bg-gray-200 dark:bg-gray-900 animate-pulse" />
      <div className="container-custom max-w-4xl -mt-32 relative z-10">
        <div className="grid md:grid-cols-[1fr_300px] gap-12">
          <div className="space-y-8">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

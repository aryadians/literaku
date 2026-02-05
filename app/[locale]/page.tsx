"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  IoBookOutline,
  IoStarSharp,
  IoArrowForward,
  IoChatbubbleEllipsesOutline,
} from "react-icons/io5";

export default function HomePage() {
  const [books, setBooks] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      // Parallel Fetching
      const [booksRes, reviewsRes] = await Promise.all([
        supabase
          .from("books")
          .select("*, categories(name)")
          .order("created_at", { ascending: false })
          .limit(4),
        supabase
          .from("book_reviews")
          .select("*, categories(name)")
          .order("created_at", { ascending: false })
          .limit(3),
      ]);

      if (booksRes.data) setBooks(booksRes.data);
      if (reviewsRes.data) setReviews(reviewsRes.data);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  // Animation Variants for Staggered Effects
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100">
      {/* --- HERO SECTION: Minimalist & Balanced --- */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Clean Typography */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-semibold tracking-wide uppercase mb-6">
                <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                Digital Library
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 tracking-tight text-gray-900 dark:text-white">
                Baca. Review. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">
                  Terinspirasi.
                </span>
              </h1>
              <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 leading-relaxed max-w-md">
                Akses koleksi buku digital eksklusif dan bagikan pemikiranmu
                bersama komunitas pembaca Literaku.
              </p>
              <div className="flex gap-4">
                <Link href="/library">
                  <Button
                    size="lg"
                    className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full px-8 hover:opacity-90 transition-opacity"
                  >
                    Mulai Baca
                  </Button>
                </Link>
                <Link href="/reviews">
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full px-8 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  >
                    Explore Review
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right: Modern Bento Grid Layout */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="hidden lg:grid grid-cols-2 gap-4 h-[500px]"
            >
              {/* Card 1: Main Book (Tall) */}
              <motion.div
                variants={itemVariants}
                className="col-span-1 row-span-2 relative rounded-3xl overflow-hidden group bg-gray-100 dark:bg-gray-900"
              >
                {!isLoading && books[0] ? (
                  <Link
                    href={`/read/${books[0].slug}`}
                    className="h-full block"
                  >
                    {books[0].cover_url ? (
                      <Image
                        src={books[0].cover_url}
                        alt="Book"
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <IoBookOutline className="text-4xl text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-white text-xs font-medium uppercase opacity-80 mb-1">
                        New Arrival
                      </p>
                      <h3 className="text-white text-xl font-bold leading-tight">
                        {books[0].title}
                      </h3>
                    </div>
                  </Link>
                ) : (
                  <div className="w-full h-full bg-gray-100 dark:bg-gray-800 animate-pulse" />
                )}
              </motion.div>

              {/* Card 2: Latest Review (Square) */}
              <motion.div
                variants={itemVariants}
                className="col-span-1 bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                {!isLoading && reviews[0] ? (
                  <Link
                    href={`/reviews/${reviews[0].slug}`}
                    className="h-full flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1 text-yellow-500 mb-2">
                        <IoStarSharp className="w-4 h-4" />
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {reviews[0].rating}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug">
                        "{reviews[0].title}"
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-xs font-bold">
                        {reviews[0].profiles?.name?.[0] || "U"}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {reviews[0].profiles?.name}
                      </span>
                    </div>
                  </Link>
                ) : (
                  <div className="w-full h-full bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />
                )}
              </motion.div>

              {/* Card 3: Stats or Second Book */}
              <motion.div
                variants={itemVariants}
                className="col-span-1 bg-brand-50 dark:bg-gray-800 rounded-3xl p-6 flex flex-col justify-center items-center text-center hover:bg-brand-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <Link
                  href="/library"
                  className="w-full h-full flex flex-col items-center justify-center"
                >
                  <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center text-brand-600 mb-3 shadow-sm">
                    <IoBookOutline className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {books?.length || 0}+
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Buku Tersedia
                  </span>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- FEATURED BOOKS (Clean Grid) --- */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Koleksi Pilihan
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Buku digital terbaru yang siap dibaca.
              </p>
            </div>
            <Link
              href="/library"
              className="group flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white hover:text-brand-600 transition-colors"
            >
              Lihat Semua
              <IoArrowForward className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {isLoading
              ? [1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-[2/3] bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"
                  />
                ))
              : books.map((book) => (
                  <motion.div key={book.id} variants={itemVariants}>
                    <Link href={`/read/${book.slug}`} className="group block">
                      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-lg">
                        {book.cover_url ? (
                          <Image
                            src={book.cover_url}
                            alt={book.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <IoBookOutline className="text-4xl" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </div>
                      <div className="mt-4">
                        <h3 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-brand-600 transition-colors">
                          {book.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {book.author}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
          </motion.div>
        </div>
      </section>

      {/* --- LATEST REVIEWS (Minimalist Cards) --- */}
      <section className="py-20 border-t border-gray-100 dark:border-gray-800">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Suara Pembaca
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
              Ulasan jujur dan mendalam dari komunitas Literaku.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {isLoading
              ? [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-64 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"
                  />
                ))
              : reviews.map((review) => (
                  <motion.div key={review.id} variants={itemVariants}>
                    <Link
                      href={`/reviews/${review.slug}`}
                      className="block h-full"
                    >
                      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 hover:border-brand-200 dark:hover:border-brand-900 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold text-sm">
                            {review.profiles?.name?.[0] || "U"}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white leading-none mb-1">
                              {review.profiles?.name || "User"}
                            </p>
                            <p className="text-xs text-gray-500">Reviewer</p>
                          </div>
                          <div className="ml-auto flex items-center gap-1 text-yellow-400 text-xs font-bold bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                            <IoStarSharp /> {review.rating}
                          </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                          {review.title}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed line-clamp-3 mb-6 flex-1">
                          {review.excerpt}
                        </p>

                        <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-400">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                          <span className="text-sm font-semibold text-brand-600 hover:underline flex items-center gap-1">
                            Baca <IoArrowForward size={14} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}

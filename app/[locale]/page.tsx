"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  IoBookOutline,
  IoStarSharp,
  IoEyeOutline,
  IoHeartOutline,
} from "react-icons/io5";

// This will be fetched from API later
const featuredReview = {
  title: "The Midnight Library",
  author: "Matt Haig",
  rating: 5,
  excerpt:
    "Sebuah karya yang menawan tentang penyesalan, pilihan hidup, dan kemungkinan yang tak terbatas...",
  category: "Fiction",
};

const recentReviews = [
  {
    id: 1,
    title: "Sapiens",
    author: "Yuval Noah Harari",
    rating: 5,
    excerpt:
      "Perjalanan menarik menelusuri sejarah umat manusia dari zaman batu hingga era digital.",
    category: "Non-Fiction",
    views: 234,
    likes: 45,
  },
  {
    id: 2,
    title: "Atomic Habits",
    author: "James Clear",
    rating: 5,
    excerpt:
      "Panduan praktis membangun kebiasaan baik dan menghilangkan yang buruk.",
    category: "Self-Help",
    views: 189,
    likes: 38,
  },
  {
    id: 3,
    title: "1984",
    author: "George Orwell",
    rating: 5,
    excerpt: "Distopia klasik yang masih sangat relevan dengan dunia modern.",
    category: "Fiction",
    views: 312,
    likes: 67,
  },
];

export default function HomePage() {
  // Note: In Next.js App Router, we can't use hooks directly in server components
  // This page should be a client component if we want to use useTranslations
  // For now, let's keep the content in Indonesian as default

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 text-white py-24 md:py-40">
        {/* Simple Gradient Overlay - No distracting pattern */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent"></div>

        <div className="container-custom relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left Content - Text */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
              >
                <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-brand-50 text-sm font-semibold mb-4 border border-white/20">
                  ✨ Platform Review Buku #1 di Indonesia
                </span>
              </motion.div>

              <motion.h1
                className="text-5xl md:text-7xl font-black mb-8 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Jejak Literasi,{" "}
                <span
                  className="block mt-2 bg-gradient-to-r from-yellow-300 via-yellow-200 to-orange-200 bg-clip-text text-transparent animate-gradient"
                  style={{ backgroundSize: "200% auto" }}
                >
                  Catatan Bacaan
                </span>
              </motion.h1>

              <motion.p
                className="text-xl md:text-2xl text-brand-50 mb-10 leading-relaxed font-light"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Platform berbagi review dan catatan bacaan untuk para pecinta
                buku.
                <span className="block mt-2 text-brand-100">
                  Temukan rekomendasi, bagikan pengalaman, dan jelajahi dunia
                  literasi bersama.
                </span>
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Link href="/reviews">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="shadow-2xl hover:shadow-accent-500/50 hover:scale-105 transition-all group"
                  >
                    <IoBookOutline className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                    <span className="font-bold">Jelajahi Review</span>
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="bg-white/10 hover:bg-white/25 backdrop-blur-md border-2 border-white/30 hover:border-white/50 font-bold shadow-xl transition-all text-white hover:text-white"
                  >
                    Mulai Menulis
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Content - Featured Review Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="hidden md:block"
            >
              <div className="relative">
                {/* Decorative Glow */}
                <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-3xl blur-2xl"></div>

                <Card className="relative hover:scale-105 transition-all duration-500 shadow-2xl border-2 border-white/20">
                  <div className="p-8 bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-xl">
                    <div className="flex items-start justify-between mb-6">
                      <span className="px-4 py-2 text-sm font-bold bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-full shadow-lg">
                        {featuredReview.category}
                      </span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <IoStarSharp
                            key={i}
                            className={`w-5 h-5 ${
                              i < featuredReview.rating
                                ? "text-yellow-400 drop-shadow-md"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <h3 className="text-3xl font-black mb-3 text-gray-900 leading-tight">
                      {featuredReview.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-5 font-semibold">
                      oleh {featuredReview.author}
                    </p>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {featuredReview.excerpt}
                    </p>
                  </div>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Recent Reviews Section */}
      <section className="py-24 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-black mb-6 text-gray-900 dark:text-white bg-gradient-to-r from-brand-700 to-brand-600 bg-clip-text text-transparent dark:from-brand-300 dark:to-brand-200">
              Review Terbaru
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-light max-w-3xl mx-auto">
              Temukan review buku terbaru dari komunitas kami yang passionate
              tentang literasi
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
              >
                <Card
                  hover
                  className="h-full flex flex-col group overflow-hidden border-2 border-transparent hover:border-brand-200 dark:hover:border-brand-700 transition-all duration-300 bg-white dark:bg-gray-800"
                >
                  <div className="relative overflow-hidden">
                    {/* Book Cover Placeholder with Gradient */}
                    <div className="h-56 bg-gradient-to-br from-brand-400 via-brand-500 to-brand-600 flex items-center justify-center relative group-hover:scale-110 transition-transform duration-500">
                      <div className="absolute inset-0 bg-black/10"></div>
                      <IoBookOutline className="w-20 h-20 text-white opacity-40 relative z-10 group-hover:opacity-60 transition-opacity" />
                    </div>
                    <span className="absolute top-4 right-4 px-4 py-2 text-xs font-bold bg-white/95 backdrop-blur-sm rounded-full shadow-lg text-gray-900">
                      {review.category}
                    </span>
                  </div>

                  <Card.Content className="flex-1 flex flex-col p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <IoStarSharp
                          key={i}
                          className={`w-5 h-5 ${
                            i < review.rating
                              ? "text-yellow-400 drop-shadow-sm"
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                    <h3 className="text-2xl font-black mb-3 text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {review.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-semibold">
                      oleh {review.author}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mb-6 line-clamp-3 flex-1 leading-relaxed">
                      {review.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t-2 border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2 font-medium">
                        <IoEyeOutline className="w-5 h-5" />
                        <span>{review.views}</span>
                      </div>
                      <div className="flex items-center gap-2 font-medium">
                        <IoHeartOutline className="w-5 h-5 text-red-400" />
                        <span>{review.likes}</span>
                      </div>
                    </div>
                  </Card.Content>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Link href="/reviews">
              <Button
                variant="outline"
                size="lg"
                className="shadow-lg hover:shadow-xl border-2 font-bold text-lg px-8 py-4 hover:scale-105 transition-all"
              >
                Lihat Semua Review
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-28 px-4 bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-300 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-400 rounded-full blur-3xl"></div>
        </div>

        <div className="container-custom text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-black mb-8 text-white leading-tight">
              Siap Berbagi Pengalaman
              <br />
              Membacamu?
            </h2>
            <p className="text-xl md:text-2xl text-brand-50 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
              Bergabunglah dengan ribuan pembaca dan penulis review buku.
              <br />
              <span className="font-semibold text-yellow-200">
                Mulai bagikan ceritamu hari ini!
              </span>
            </p>
            <Link href="/auth/register">
              <Button
                variant="secondary"
                size="lg"
                className="shadow-2xl hover:shadow-accent-300/50 hover:scale-110 transition-all text-lg px-10 py-6 font-black"
              >
                <span className="text-xl">Daftar Sekarang - Gratis! 🚀</span>
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

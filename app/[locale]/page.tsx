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
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 text-white py-20 md:py-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content - Text */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.h1
                className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Jejak Literasi,{" "}
                <span className="gradient-text bg-gradient-to-r from-yellow-200 to-orange-200">
                  Catatan Bacaan
                </span>
              </motion.h1>
              <motion.p
                className="text-xl text-brand-50 mb-8 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Platform berbagi review dan catatan bacaan untuk para pecinta
                buku. Temukan rekomendasi, bagikan pengalaman, dan jelajahi
                dunia literasi bersama.
              </motion.p>
              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Link href="/reviews">
                  <Button variant="secondary" size="lg">
                    <IoBookOutline className="w-5 h-5" />
                    Jelajahi Review
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-sm"
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
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="hover:scale-105 transition-transform duration-300">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <span className="px-3 py-1 text-sm font-medium bg-accent-100 text-accent-700 dark:bg-accent-900 dark:text-accent-300 rounded-full">
                      {featuredReview.category}
                    </span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <IoStarSharp
                          key={i}
                          className={`w-4 h-4 ${
                            i < featuredReview.rating
                              ? "text-yellow-400"
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                    {featuredReview.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    oleh {featuredReview.author}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {featuredReview.excerpt}
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Recent Reviews Section */}
      <section className="py-20 px-4">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Review Terbaru
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Temukan review buku terbaru dari komunitas kami
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card hover className="h-full flex flex-col">
                  <div className="relative">
                    {/* Book Cover Placeholder */}
                    <div className="h-48 bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                      <IoBookOutline className="w-16 h-16 text-white opacity-50" />
                    </div>
                    <span className="absolute top-3 right-3 px-3 py-1 text-xs font-medium bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full">
                      {review.category}
                    </span>
                  </div>

                  <Card.Content className="flex-1 flex flex-col">
                    <div className="flex items-center gap-1 mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <IoStarSharp
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? "text-yellow-400"
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                      {review.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      oleh {review.author}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3 flex-1">
                      {review.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-1">
                        <IoEyeOutline className="w-4 h-4" />
                        <span>{review.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <IoHeartOutline className="w-4 h-4" />
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
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link href="/reviews">
              <Button variant="outline" size="lg">
                Lihat Semua Review
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-brand-500 to-brand-600">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6 text-white">
              Siap Berbagi Pengalaman Membacamu?
            </h2>
            <p className="text-xl text-brand-50 mb-8 max-w-2xl mx-auto">
              Bergabunglah dengan komunitas pembaca dan penulis review buku.
              Mulai bagikan ceritamu hari ini!
            </p>
            <Link href="/auth/register">
              <Button variant="secondary" size="lg">
                Daftar Sekarang
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IoStar, IoEye, IoHeart, IoArrowForward } from "react-icons/io5";
import Image from "next/image";

export default function HomePage() {
  const t = useTranslations();

  // Mock data - will be replaced with real data from Supabase
  const featuredReview = {
    id: "1",
    title: "Perjalanan Mencari Makna Hidup",
    bookTitle: "Man's Search for Meaning",
    bookAuthor: "Viktor E. Frankl",
    excerpt:
      "Sebuah buku yang mengubah perspektif saya tentang makna hidup dan penderitaan...",
    rating: 5,
    views: 1234,
    likes: 89,
    coverUrl: null,
  };

  const recentReviews = [
    {
      id: "2",
      title: "Filosofi Kehidupan dalam Cerita Pendek",
      bookTitle: "Kafka di Tepi Pantai",
      bookAuthor: "Haruki Murakami",
      excerpt: "Perpaduan realitas dan fantasi yang memukau...",
      rating: 4.5,
      views: 856,
      likes: 67,
      category: "Fiction",
      coverUrl: null,
    },
    {
      id: "3",
      title: "Memahami Psikologi Keputusan",
      bookTitle: "Thinking, Fast and Slow",
      bookAuthor: "Daniel Kahneman",
      excerpt: "Wawasan mendalam tentang cara kerja pikiran manusia...",
      rating: 5,
      views: 1092,
      likes: 94,
      category: "Psychology",
      coverUrl: null,
    },
    {
      id: "4",
      title: "Sejarah Singkat Umat Manusia",
      bookTitle: "Sapiens",
      bookAuthor: "Yuval Noah Harari",
      excerpt: "Narasi sejarah yang memikat dari perspektif yang unik...",
      rating: 4.5,
      views: 1456,
      likes: 123,
      category: "History",
      coverUrl: null,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-accent-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {t("home.hero.title")}{" "}
                <span className="gradient-text">{t("home.hero.subtitle")}</span>
              </motion.h1>

              <motion.p
                className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {t("home.hero.description")}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap gap-4"
              >
                <Button variant="primary" size="lg">
                  {t("home.hero.cta")}
                  <IoArrowForward />
                </Button>
                <Button variant="outline" size="lg">
                  {t("nav.about")}
                </Button>
              </motion.div>
            </motion.div>

            {/* Right Column - Featured Review Preview */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="hidden lg:block"
            >
              <Card className="overflow-hidden">
                <div className="relative h-64 bg-gradient-brand">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <h3 className="text-2xl font-bold mb-2">
                        {featuredReview.bookTitle}
                      </h3>
                      <p className="text-white/80">
                        {featuredReview.bookAuthor}
                      </p>
                    </div>
                  </div>
                </div>
                <Card.Content>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <IoStar
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <h4 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                    {featuredReview.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    {featuredReview.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <IoEye /> {featuredReview.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <IoHeart /> {featuredReview.likes}
                    </span>
                  </div>
                </Card.Content>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Recent Reviews Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t("home.recent")}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Temukan review buku terbaru dari komunitas kami
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full">
                <div className="relative h-48 bg-gradient-to-br from-brand-400 to-brand-600">
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <div className="text-center text-white">
                      <h4 className="font-bold text-xl mb-1">
                        {review.bookTitle}
                      </h4>
                      <p className="text-white/80 text-sm">
                        {review.bookAuthor}
                      </p>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs">
                    {review.category}
                  </div>
                </div>
                <Card.Content>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(Math.floor(review.rating))].map((_, i) => (
                      <IoStar
                        key={i}
                        className="w-4 h-4 text-yellow-400 fill-current"
                      />
                    ))}
                    {review.rating % 1 !== 0 && (
                      <IoStar className="w-4 h-4 text-yellow-400 fill-current opacity-50" />
                    )}
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white line-clamp-2">
                    {review.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                    {review.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <IoEye className="w-4 h-4" /> {review.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <IoHeart className="w-4 h-4" /> {review.likes}
                    </span>
                  </div>
                </Card.Content>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button variant="outline" size="lg">
            {t("nav.reviews")}
            <IoArrowForward />
          </Button>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-brand text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">
              Mulai Bagikan Catatan Bacaan Anda
            </h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Bergabunglah dengan komunitas pecinta buku dan berbagi pengalaman
              membaca Anda
            </p>
            <Button variant="secondary" size="lg">
              {t("nav.register")}
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { motion } from "framer-motion";
import { IoBook, IoArrowForward } from "react-icons/io5";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  book_reviews: { count: number }[]; // Count of reviews
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("categories")
        .select("*, book_reviews(count)") // Fetch count of reviews in this category
        .order("name");

      if (!error && data) {
        setCategories(data as any);
      }
      setIsLoading(false);
    }
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-20 px-4">
      <div className="container-custom max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            Jelajahi Kategori
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Temukan buku favorit Anda berdasarkan genre dan topik yang Anda
            sukai.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? [1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-40 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"
                />
              ))
            : categories.map((Category, index) => (
                <motion.div
                  key={Category.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link href={`/reviews?category=${Category.slug}`}>
                    <div className="group h-full bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800 hover:border-brand-500/50 hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-300 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 dark:bg-brand-900/20 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />

                      <div className="relative z-10">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mb-6 text-brand-600 dark:text-brand-400 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                          <IoBook className="w-6 h-6" />
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-brand-600 transition-colors">
                          {Category.name}
                        </h3>

                        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm line-clamp-2">
                          {Category.description ||
                            "Koleksi buku terbaik dalam kategori ini."}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-gray-600 dark:text-gray-300">
                            {Category.book_reviews?.[0]?.count || 0} Review
                          </span>
                          <span className="text-brand-600 dark:text-brand-400 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                            <IoArrowForward className="w-5 h-5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
        </div>
      </div>
    </div>
  );
}

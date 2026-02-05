"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalReviews: 0,
    totalViews: 0,
    totalLikes: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      if (session?.user?.email) {
        const supabase = createClient();
        // Get User ID from Auth (Safety check, or query by email if profile linked)
        // RLS usually relies on auth.uid() which is available if session is valid
        // But to query table "book_reviews" by "user_id", we need the ID.
        // Since we are client side, we can get user.
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data } = await supabase
            .from("book_reviews")
            .select("views, rating, review_likes") // Assuming review_likes is here or we count from table
            // Wait, earlier schema Check: existing reviews listing used "review_likes" number.
            .eq("user_id", user.id);

          if (data) {
            const totalReviews = data.length;
            const totalViews = data.reduce(
              (acc, curr) => acc + (curr.views || 0),
              0,
            );
            // For likes, if it's a number column:
            const totalLikes = data.reduce(
              (acc, curr) => acc + (curr.review_likes || 0),
              0,
            );

            setStats({ totalReviews, totalViews, totalLikes });
          }
        }
      }
    }
    if (status === "authenticated") fetchStats();
  }, [session, status]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 py-12">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-8 mb-8">
            <div className="flex items-center gap-6">
              {session.user?.image && (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="w-20 h-20 rounded-full"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Selamat Datang, {session.user?.name || "User"}!
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {session.user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6">
            <motion.a
              href="/dashboard/reviews/new"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 hover:shadow-glow-md transition-all group"
            >
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                Buat Review Baru
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Bagikan pendapat Anda tentang buku favorit
              </p>
            </motion.a>

            <motion.a
              href="/dashboard/reviews"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 hover:shadow-glow-md transition-all group"
            >
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                Review Saya
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Kelola semua review yang sudah Anda buat
              </p>
            </motion.a>

            <motion.a
              href="/dashboard/profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-6 hover:shadow-glow-md transition-all group"
            >
              <div className="text-4xl mb-4">⚙️</div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                Profil Saya
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Edit profil dan pengaturan akun
              </p>
            </motion.a>
          </div>

          {/* Stats with Real Data */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-8 mt-8"
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              Statistik Anda
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="text-3xl font-bold text-brand-600 dark:text-brand-400 mb-2">
                  {stats.totalReviews}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Review
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="text-3xl font-bold text-accent-600 dark:text-accent-400 mb-2">
                  {stats.totalViews}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Views
                </div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {stats.totalLikes}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Likes
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

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
  const [readHistory, setReadHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (session?.user?.email) {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // 1. Fetch Review Stats
          const { data: reviewsData } = await supabase
            .from("book_reviews")
            .select("views, review_likes(count)")
            .eq("user_id", user.id);

          if (reviewsData) {
            const totalReviews = reviewsData.length;
            const totalViews = reviewsData.reduce(
              (acc, curr) => acc + (curr.views || 0),
              0,
            );
            const totalLikes = reviewsData.reduce(
              (acc, curr) => acc + (curr.review_likes?.[0]?.count || 0),
              0,
            );

            setStats({ totalReviews, totalViews, totalLikes });
          }

          // 2. Fetch Reading History
          setLoadingHistory(true);
          const { data: historyData } = await supabase
            .from("read_history")
            .select(`
              last_read_at,
              books (
                id,
                title,
                slug,
                cover_url,
                author
              )
            `)
            .eq("user_id", user.id)
            .order("last_read_at", { ascending: false })
            .limit(3);
          
          setReadHistory(historyData || []);
          setLoadingHistory(false);
        }
      }
    }
    if (status === "authenticated") fetchData();
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

          {/* Reading Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-8 mt-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Aktivitas Membaca Terakhir
              </h2>
              <a href="/library" className="text-sm font-semibold text-brand-600 hover:underline">
                Buka Perpustakaan
              </a>
            </div>

            {loadingHistory ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-20 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : readHistory.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 dark:bg-gray-900/50 rounded-xl border-2 border-dashed border-gray-100 dark:border-gray-800">
                <p className="text-gray-500 dark:text-gray-400 mb-4">Belum ada aktivitas membaca baru-baru ini.</p>
                <a href="/library">
                  <button className="px-6 py-2 bg-brand-600 text-white rounded-full text-sm font-bold">Mulai Membaca</button>
                </a>
              </div>
            ) : (
              <div className="grid gap-4">
                {readHistory.map((item: any) => (
                  <a
                    key={item.books.id}
                    href={`/read/${item.books.slug}`}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700 group"
                  >
                    <div className="w-12 h-16 relative rounded overflow-hidden flex-shrink-0 shadow-sm">
                      {item.books.cover_url ? (
                        <img src={item.books.cover_url} alt={item.books.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                          📖
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-brand-600 transition-colors">
                        {item.books.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {item.books.author}
                      </p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-gray-400">Terakhir dibaca</p>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        {new Date(item.last_read_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </motion.div>

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

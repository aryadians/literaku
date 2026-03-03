"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { ALL_BADGES } from "@/lib/badges";
import { Button } from "@/components/ui/Button";
import { useMemo } from "react";
import Link from "next/link";
import { IoBook, IoChatbubbles, IoHeart, IoRocket, IoFlame, IoBookmark, IoEye, IoTime, IoTrophy } from "react-icons/io5";
import Swal from "sweetalert2";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalReviews: 0,
    totalViews: 0,
    totalLikes: 0,
    booksRead: 0,
    commentsMade: 0,
    categoriesCount: 0
  });
  const [readHistory, setReadHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  // Challenge State
  const [challenge, setChallenge] = useState<{target: number, completed: number, year: number} | null>(null);
  const [loadingChallenge, setLoadingChallenge] = useState(true);

  // Level & XP Logic
  const xp = (stats.totalReviews * 20) + (stats.booksRead * 10) + (stats.totalLikes * 5);
  const level = Math.floor(xp / 100) + 1;
  const progress = (xp % 100);

  // Calculate Badges for Preview
  const earnedBadgesCount = useMemo(() => {
    return ALL_BADGES.filter(b => b.criteria({
      booksRead: stats.booksRead,
      reviewsCount: stats.totalReviews,
      likesReceived: stats.totalLikes,
      commentsMade: stats.commentsMade,
      categoriesCount: stats.categoriesCount
    })).length;
  }, [stats]);

  useEffect(() => {
    async function fetchData() {
      if (session?.user?.id) {
        const supabase = createClient();
        
        // 1. Fetch Review Stats
        const { data: reviewsData } = await supabase
          .from("book_reviews")
          .select("id, views, category_id")
          .eq("user_id", session.user.id);

        if (reviewsData) {
          const revIds = reviewsData.map(r => r.id);
          let likesCount = 0;
          if (revIds.length > 0) {
            const { count } = await supabase
              .from("review_likes")
              .select("*", { count: "exact", head: true })
              .in("review_id", revIds);
            likesCount = count || 0;
          }

          const { count: commCount } = await supabase
            .from("review_comments")
            .select("*", { count: "exact", head: true })
            .eq("user_id", session.user.id);

          const { count: historyCount } = await supabase
            .from("reading_status")
            .select("*", { count: "exact", head: true })
            .eq("user_id", session.user.id)
            .eq("status", "finished");

          setStats({
            totalReviews: reviewsData.length,
            totalViews: reviewsData.reduce((acc, curr) => acc + (curr.views || 0), 0),
            totalLikes: likesCount,
            booksRead: historyCount || 0,
            commentsMade: commCount || 0,
            categoriesCount: new Set(reviewsData.map(r => r.category_id)).size
          });
        }

        // 2. Fetch Reading History
        const { data: historyData } = await supabase
          .from("read_history")
          .select(`last_read_at, books (id, title, slug, cover_url, author)`)
          .eq("user_id", session.user.id)
          .order("last_read_at", { ascending: false })
          .limit(3);
        
        setReadHistory(historyData || []);
        setLoadingHistory(false);

        // 3. Fetch Challenge
        try {
          const res = await fetch('/api/stats/challenges');
          if (res.ok) {
            const data = await res.json();
            setChallenge(data);
          }
        } catch (e) { console.error(e); }
        setLoadingChallenge(false);
      }
    }
    if (status === "authenticated") fetchData();
  }, [session, status]);

  const handleSetChallenge = async () => {
    const { value: target } = await Swal.fire({
      title: 'Target Membaca Tahunan',
      input: 'number',
      inputLabel: `Berapa buku yang ingin kamu baca di tahun ${new Date().getFullYear()}?`,
      inputValue: challenge?.target || 12,
      showCancelButton: true,
      confirmButtonColor: '#4F46E5',
      inputValidator: (value) => {
        if (!value || parseInt(value) < 1) {
          return 'Masukkan angka minimal 1'
        }
      }
    });

    if (target) {
      try {
        const res = await fetch('/api/stats/challenges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target: parseInt(target) })
        });
        if (res.ok) {
          const data = await res.json();
          setChallenge(prev => prev ? {...prev, target: data.target_books} : null);
          Swal.fire('Berhasil!', 'Target membaca kamu telah diperbarui.', 'success');
        }
      } catch (e) {
        Swal.fire('Gagal', 'Terjadi kesalahan saat menyimpan target.', 'error');
      }
    }
  };

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
          {/* Modern Header */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden mb-10 border border-gray-100 dark:border-gray-700">
            <div className="bg-gradient-to-r from-brand-600 to-orange-500 p-8 text-white relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <IoRocket className="w-32 h-32 rotate-12" />
              </div>
              <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                <div className="relative">
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="w-24 h-24 rounded-2xl border-4 border-white/30 shadow-lg object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-white/20 flex items-center justify-center text-4xl border-4 border-white/30 shadow-lg">
                      👋
                    </div>
                  )}
                  <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-gray-900 text-[10px] font-black px-2 py-1 rounded-lg shadow-md border-2 border-white">
                    LVL {level}
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <h1 className="text-3xl md:text-4xl font-black mb-1">
                    Halo, {session.user?.name?.split(' ')[0] || "User"}!
                  </h1>
                  <p className="text-white/80 font-medium mb-4">{session.user?.email}</p>
                  
                  {/* XP Bar */}
                  <div className="w-full md:w-80 space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/90">
                      <span>Progres Level</span>
                      <span>{xp} / {level * 100} XP</span>
                    </div>
                    <div className="h-3 bg-black/20 rounded-full overflow-hidden border border-white/10">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Achievement Preview Bar */}
            <div className="bg-gray-50 dark:bg-gray-900/50 px-8 py-4 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Koleksi Lencana:</span>
                <div className="flex -space-x-2">
                  {[...Array(Math.min(earnedBadgesCount, 5))].map((_, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-brand-50 shadow-sm flex items-center justify-center text-sm">
                      ✨
                    </div>
                  ))}
                  {earnedBadgesCount > 5 && (
                    <div className="w-8 h-8 rounded-full bg-brand-500 text-white border-2 border-white shadow-sm flex items-center justify-center text-[10px] font-black">
                      +{earnedBadgesCount - 5}
                    </div>
                  )}
                </div>
              </div>
              <Link href="/profile" className="text-xs font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest hover:underline">
                Lihat Semua Lencana →
              </Link>
            </div>
          </div>

          {/* Main Layout Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Reading Activity & Challenges */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* READING CHALLENGE WIDGET */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-card p-8 border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <IoTrophy className="w-24 h-24 text-brand-600" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                      <IoTrophy className="text-yellow-500" /> Reading Challenge {new Date().getFullYear()}
                    </h2>
                    <button 
                      onClick={handleSetChallenge}
                      className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-brand-50 hover:text-brand-600 transition-colors"
                    >
                      {challenge?.target ? "Ubah Target" : "Set Target"}
                    </button>
                  </div>

                  {loadingChallenge ? (
                    <div className="h-20 bg-gray-50 dark:bg-gray-900 rounded-2xl animate-pulse" />
                  ) : challenge?.target ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <span className="text-4xl font-black text-brand-600">{challenge.completed}</span>
                          <span className="text-gray-400 font-bold text-lg"> / {challenge.target} buku</span>
                        </div>
                        <span className="text-xs font-bold text-gray-500 uppercase">
                          {Math.round((challenge.completed / challenge.target) * 100)}% Selesai
                        </span>
                      </div>
                      <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden border border-gray-200 dark:border-gray-600">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((challenge.completed / challenge.target) * 100, 100)}%` }}
                          className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 shadow-glow-sm"
                        />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                        {challenge.completed >= challenge.target 
                          ? "Luar biasa! Kamu telah mencapai target tahun ini! 🏆" 
                          : `Ayo semangat! Kamu butuh ${challenge.target - challenge.completed} buku lagi untuk mencapai target.`}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500 mb-4">Belum ada target membaca tahun ini.</p>
                      <Button onClick={handleSetChallenge} size="sm" className="rounded-full">Mulai Tantangan Baru</Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-card p-8 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <IoBookmark className="text-brand-500" /> Sedang Dibaca
                  </h2>
                  <Link href="/library" className="text-xs font-black text-brand-600 hover:underline uppercase tracking-widest">
                    Lihat Semua
                  </Link>
                </div>

                {loadingHistory ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-24 bg-gray-50 dark:bg-gray-900 rounded-2xl animate-pulse" />
                    ))}
                  </div>
                ) : readHistory.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400 mb-6 font-medium">Kamu belum mulai membaca buku apa pun.</p>
                    <Link href="/library">
                      <Button className="rounded-full px-8 shadow-glow-sm">Jelajahi Perpustakaan</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {readHistory.map((item: any) => (
                      <Link
                        key={item.books.id}
                        href={`/read/${item.books.slug}`}
                        className="flex items-center gap-5 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700 group"
                      >
                        <div className="w-16 h-20 relative rounded-xl overflow-hidden flex-shrink-0 shadow-md transform group-hover:rotate-2 transition-transform">
                          {item.books.cover_url ? (
                            <img src={item.books.cover_url} alt={item.books.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-2xl">
                              📖
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-gray-900 dark:text-white truncate text-lg group-hover:text-brand-600 transition-colors mb-1">
                            {item.books.title}
                          </h4>
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 truncate">
                            {item.books.author}
                          </p>
                          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            <span className="flex items-center gap-1"><IoTime /> {new Date(item.last_read_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="hidden sm:block">
                          <Button variant="ghost" size="sm" className="rounded-full">Lanjut Baca</Button>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Stats Summary */}
            <div className="space-y-8">
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-card p-8 border border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-black mb-8 text-gray-900 dark:text-white uppercase tracking-tighter">Ringkasan Statistik</h2>
                <div className="space-y-6">
                  {[
                    { label: "Review Dibuat", value: stats.totalReviews, icon: <IoChatbubbles />, color: "text-blue-500 bg-blue-50" },
                    { label: "Total Views", value: stats.totalViews, icon: <IoEye />, color: "text-accent-500 bg-accent-50" },
                    { label: "Total Likes", value: stats.totalLikes, icon: <IoHeart />, color: "text-red-500 bg-red-50" },
                    { label: "Buku Selesai", value: stats.booksRead, icon: <IoBook />, color: "text-green-500 bg-green-50" },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${stat.color} dark:bg-gray-700`}>
                          {stat.icon}
                        </div>
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{stat.label}</span>
                      </div>
                      <span className="text-xl font-black text-gray-900 dark:text-white">{stat.value}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-700">
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 p-6 rounded-2xl border border-yellow-100 dark:border-yellow-900/20 text-center">
                    <div className="text-3xl mb-2"><IoFlame className="inline text-orange-500" /></div>
                    <div className="text-xs font-black uppercase tracking-widest text-orange-700 dark:text-orange-400 mb-1">XP Hari Ini</div>
                    <div className="text-2xl font-black text-gray-900 dark:text-white">+{(stats.totalReviews * 5) % 100} XP</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

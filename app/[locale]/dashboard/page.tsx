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
import { 
  IoBook, 
  IoChatbubbles, 
  IoHeart, 
  IoRocket, 
  IoFlame, 
  IoBookmark, 
  IoEye, 
  IoTime, 
  IoTrophy, 
  IoChevronForward,
  IoBrush,
  IoSettingsOutline,
  IoSparkles
} from "react-icons/io5";
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
          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Target diperbarui', showConfirmButton: false, timer: 2000 });
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 pt-28">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto"
        >
          {/* Header Profile Section */}
          <div className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-xl overflow-hidden mb-10 border border-gray-100 dark:border-gray-800">
            <div className="bg-gradient-to-r from-brand-600 to-indigo-600 p-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <IoRocket className="w-48 h-48 rotate-12" />
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-[2.5rem] bg-white/20 backdrop-blur-md flex items-center justify-center text-5xl border-4 border-white shadow-2xl overflow-hidden">
                    {session.user?.image ? (
                      <img src={session.user.image} alt="User" className="w-full h-full object-cover" />
                    ) : "👋"}
                  </div>
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-2 -right-2 bg-yellow-400 text-gray-900 text-[10px] font-black px-3 py-1.5 rounded-xl shadow-lg border-2 border-white"
                  >
                    LEVEL {level}
                  </motion.div>
                </div>
                
                <div className="text-center md:text-left flex-1">
                  <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tighter uppercase italic">
                    Halo, {session.user?.name?.split(' ')[0] || "User"}!
                  </h1>
                  <p className="text-white/70 font-bold mb-6 tracking-widest uppercase text-xs">{session.user?.email}</p>
                  
                  {/* Progress Bar Premium */}
                  <div className="w-full max-w-md space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Pengalaman Literasi</span>
                      <span className="text-[10px] font-black text-white bg-white/20 px-2 py-0.5 rounded-full">{xp} / {level * 100} XP</span>
                    </div>
                    <div className="h-4 bg-black/20 rounded-full p-1 border border-white/10 shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] relative overflow-hidden"
                      >
                        <motion.div 
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Stats & Badges Bar */}
            <div className="bg-gray-50 dark:bg-gray-800/50 px-10 py-6 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <IoSparkles className="text-brand-500" /> Pencapaian:
                </span>
                <div className="flex -space-x-2">
                  {[...Array(Math.min(earnedBadgesCount, 6))].map((_, i) => (
                    <div key={i} className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border-2 border-brand-50 dark:border-gray-700 shadow-sm flex items-center justify-center text-lg hover:-translate-y-1 transition-transform cursor-help" title="Lencana didapat">
                      ✨
                    </div>
                  ))}
                  {earnedBadgesCount > 6 && (
                    <div className="w-10 h-10 rounded-xl bg-brand-600 text-white border-2 border-white shadow-lg flex items-center justify-center text-xs font-black">
                      +{earnedBadgesCount - 6}
                    </div>
                  )}
                </div>
              </div>
              <Link href={`/profile/${session.user.username || session.user.id}`} className="text-[10px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest hover:underline flex items-center gap-2">
                Lihat Profil Publik <IoChevronForward />
              </Link>
            </div>
          </div>

          {/* Quick Actions Grid - Refined */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[
              { label: "Tulis Review", icon: <IoChatbubbles />, href: "/reviews/create", color: "text-orange-600 bg-orange-50", delay: 0.1 },
              { label: "Kelola Buku", icon: <IoBook />, href: "/dashboard/reviews", color: "text-blue-600 bg-blue-50", delay: 0.2 },
              { label: "Buka Kanvas", icon: <IoBrush />, href: "/canvas", color: "text-purple-600 bg-purple-50", delay: 0.3 },
              { label: "Pengaturan", icon: <IoSettingsOutline />, href: "/dashboard/profile", color: "text-gray-600 bg-gray-100", delay: 0.4 },
            ].map((action, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: action.delay }}
              >
                <Link
                  href={action.href}
                  className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center group transition-all hover:border-brand-500 hover:-translate-y-2 hover:shadow-brand-500/10"
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 ${action.color} dark:bg-gray-800 group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                  <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-[0.2em]">{action.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Main Layout Grid */}
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Left Column (Activities & Challenges) */}
            <div className="lg:col-span-2 space-y-10">
              
              {/* READING CHALLENGE WIDGET - Refined */}
              <div className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-xl p-10 border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                  <IoTrophy className="w-32 h-32 text-brand-600" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center text-yellow-500">
                        <IoTrophy />
                      </div>
                      Reading Challenge {new Date().getFullYear()}
                    </h2>
                    <button 
                      onClick={handleSetChallenge}
                      className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-brand-600 hover:text-white transition-all active:scale-95 shadow-sm"
                    >
                      {challenge?.target ? "Ubah Target" : "Set Target"}
                    </button>
                  </div>

                  {loadingChallenge ? (
                    <div className="h-32 bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] animate-pulse" />
                  ) : challenge?.target ? (
                    <div className="space-y-8">
                      <div className="flex justify-between items-end">
                        <div className="flex items-baseline gap-2">
                          <span className="text-6xl font-black text-brand-600 tracking-tighter">{challenge.completed}</span>
                          <span className="text-gray-400 font-black text-xl uppercase tracking-widest">/ {challenge.target} BUKU</span>
                        </div>
                        <div className="text-right">
                          <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Penyelesaian</span>
                          <span className="text-2xl font-black text-gray-900 dark:text-white">
                            {Math.round((challenge.completed / challenge.target) * 100)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1.5 border border-gray-200 dark:border-gray-700 shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((challenge.completed / challenge.target) * 100, 100)}%` }}
                          transition={{ duration: 1.5, ease: "anticipate" }}
                          className="h-full bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 rounded-full shadow-glow-sm"
                        />
                      </div>
                      
                      <div className="bg-brand-50 dark:bg-brand-900/10 p-6 rounded-[2rem] border border-brand-100 dark:border-brand-900/30">
                        <p className="text-sm text-brand-700 dark:text-brand-300 font-bold leading-relaxed italic">
                          {challenge.completed >= challenge.target 
                            ? "Luar biasa! Kamu telah mencapai target tahun ini! Literasi adalah kunci peradaban. 👑" 
                            : `Ayo semangat! Kamu butuh ${challenge.target - challenge.completed} buku lagi untuk mencapai targetmu.`}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
                      <p className="text-gray-500 dark:text-gray-400 mb-8 font-bold uppercase tracking-widest text-xs">Belum ada target membaca tahun ini</p>
                      <Button onClick={handleSetChallenge} size="lg" className="rounded-2xl px-8 font-black uppercase tracking-widest text-xs shadow-xl active:scale-95">Mulai Tantangan Baru</Button>
                    </div>
                  )}
                </div>
              </div>

              {/* RECENTLY READ - Refined */}
              <div className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-xl p-10 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600">
                      <IoBookmark />
                    </div>
                    Sedang Dibaca
                  </h2>
                  <Link href="/library" className="text-[10px] font-black text-brand-600 hover:underline uppercase tracking-widest bg-brand-50 dark:bg-brand-900/20 px-4 py-2 rounded-xl transition-all">
                    Lihat Semua
                  </Link>
                </div>

                {loadingHistory ? (
                  <div className="space-y-6">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-32 bg-gray-50 dark:bg-gray-800 animate-pulse rounded-[2rem]" />
                    ))}
                  </div>
                ) : readHistory.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400 mb-8 font-bold uppercase tracking-widest text-xs">Kamu belum mulai membaca buku apa pun</p>
                    <Link href="/library">
                      <Button className="rounded-2xl px-10 h-14 font-black uppercase tracking-widest text-xs shadow-xl">Jelajahi Perpustakaan</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {readHistory.map((item: any, i: number) => (
                      <motion.div
                        key={item.books.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Link
                          href={`/read/${item.books.slug}`}
                          className="flex items-center gap-6 p-6 rounded-[2.5rem] bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all border border-gray-100 dark:border-gray-800 hover:border-brand-200 group relative overflow-hidden"
                        >
                          <div className="w-20 h-28 relative rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl transition-transform duration-500 group-hover:scale-105 group-hover:rotate-2 border-2 border-white dark:border-gray-700">
                            {item.books.cover_url ? (
                              <img src={item.books.cover_url} alt={item.books.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-3xl">📖</div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[8px] font-black text-brand-600 bg-brand-50 dark:bg-brand-900/30 px-2 py-0.5 rounded-full uppercase tracking-widest">Terakhir dibaca</span>
                              <div className="h-px flex-1 bg-gray-100 dark:bg-gray-800" />
                            </div>
                            <h4 className="font-black text-gray-900 dark:text-white truncate text-xl uppercase tracking-tighter group-hover:text-brand-600 transition-colors mb-1">
                              {item.books.title}
                            </h4>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                              {item.books.author}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                              <IoTime className="text-brand-500" /> {new Date(item.last_read_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          </div>
                          
                          <div className="hidden sm:block">
                            <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-lg shadow-brand-500/30 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                              <IoChevronForward size={24} />
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (Stats Summary) */}
            <div className="space-y-10">
              <div className="bg-white dark:bg-gray-900 rounded-[3.5rem] shadow-2xl p-10 border border-gray-100 dark:border-gray-800 sticky top-28">
                <h2 className="text-xl font-black mb-10 text-gray-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-3">
                  <div className="w-2 h-8 bg-brand-600 rounded-full" />
                  Statistik
                </h2>
                
                <div className="space-y-8">
                  {[
                    { label: "Review Dibuat", value: stats.totalReviews, icon: <IoChatbubbles />, color: "text-blue-600 bg-blue-50" },
                    { label: "Total Views", value: stats.totalViews, icon: <IoEye />, color: "text-purple-600 bg-purple-50" },
                    { label: "Total Likes", value: stats.totalLikes, icon: <IoHeart />, color: "text-red-600 bg-red-50" },
                    { label: "Buku Selesai", value: stats.booksRead, icon: <IoBook />, color: "text-green-600 bg-green-50" },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center justify-between group cursor-default">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${stat.color} dark:bg-gray-800 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 shadow-sm`}>
                          {stat.icon}
                        </div>
                        <span className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{stat.label}</span>
                      </div>
                      <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">{stat.value}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-12 pt-10 border-t border-gray-50 dark:border-gray-800">
                  <div className="bg-gradient-to-br from-orange-500 to-red-600 p-8 rounded-[2.5rem] text-center text-white shadow-xl relative overflow-hidden group">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"
                    />
                    <div className="text-4xl mb-3 relative z-10"><IoFlame className="inline animate-bounce" /></div>
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 text-white/80 relative z-10">XP Hari Ini</div>
                    <div className="text-3xl font-black relative z-10 tracking-tighter">+{(stats.totalReviews * 5) % 100} XP</div>
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

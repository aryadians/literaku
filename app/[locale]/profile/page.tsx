"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  IoBook, 
  IoPerson, 
  IoCalendar, 
  IoHeart, 
  IoGlobeOutline, 
  IoTime,
  IoExtensionPuzzle,
  IoChevronForward,
  IoSettingsOutline,
  IoSparkles,
  IoFlame
} from "react-icons/io5";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import { ALL_BADGES } from "@/lib/badges";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

interface Review {
  id: string;
  title: string;
  slug: string;
  book_title: string;
  book_cover_url: string | null;
  rating: number;
  created_at: string;
  excerpt: string;
  categories: {
    name: string;
  };
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({ 
    booksRead: 0, 
    reviewsCount: 0, 
    likesReceived: 0, 
    commentsMade: 0, 
    categoriesCount: 0,
    followersCount: 0,
    followingCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Level & XP Logic
  const xp = (stats.reviewsCount * 20) + (stats.booksRead * 10) + (stats.likesReceived * 5);
  const level = Math.floor(xp / 100) + 1;
  const progress = (xp % 100);

  // Badge Calculation
  const earnedBadges = useMemo(() => {
    return ALL_BADGES.map(badge => ({
      ...badge,
      earned: badge.criteria(stats)
    }));
  }, [stats]);

  useEffect(() => {
    async function fetchData() {
      if (session?.user?.id) {
        const supabase = createClient();
        
        // 1. Fetch Profile Extras
        const { data: profile } = await supabase
          .from("profiles")
          .select("followers_count, following_count")
          .eq("id", session.user.id)
          .single();

        // 2. Fetch Reviews
        const { data: reviewsData } = await supabase
          .from("book_reviews")
          .select("*, categories(name)")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        // 3. Calculate Stats
        const { count: booksCount } = await supabase
          .from("reading_status")
          .select("*", { count: "exact", head: true })
          .eq("user_id", session.user.id)
          .eq("status", "finished");

        const { data: likesData } = await supabase
          .from("review_likes")
          .select("id")
          .in("review_id", (reviewsData || []).map(r => r.id));

        setReviews(reviewsData || []);
        setStats({
          booksRead: booksCount || 0,
          reviewsCount: reviewsData?.length || 0,
          likesReceived: likesData?.length || 0,
          commentsMade: 0, // Simplified
          categoriesCount: new Set(reviewsData?.map(r => r.category_id)).size,
          followersCount: profile?.followers_count || 0,
          followingCount: profile?.following_count || 0
        });
        setIsLoading(false);
      }
    }
    if (status === "authenticated") fetchData();
  }, [session, status]);

  if (status === "loading" || isLoading) return <ProfileSkeleton />;
  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20 pt-20">
      {/* Header Profile - Premium Gradient */}
      <div className="relative h-80 bg-brand-600">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-gray-50 dark:to-gray-950" />
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        
        <div className="container-custom relative h-full flex flex-col justify-end">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8 mb-[-80px]">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-2 bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl border-4 border-white dark:border-gray-800"
            >
              <div className="relative w-36 h-32 md:w-48 md:h-44 rounded-[2.5rem] overflow-hidden bg-gray-100 dark:bg-gray-800">
                {session.user?.image ? (
                  <Image src={session.user.image} alt="User" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-500 text-6xl font-black">
                    {session.user?.name?.[0].toUpperCase()}
                  </div>
                )}
              </div>
            </motion.div>
            
            <div className="flex-1 text-center md:text-left pb-12 w-full">
              <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6">
                <div>
                  <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-3 tracking-tighter uppercase italic drop-shadow-sm">
                    {session.user?.name}
                  </h1>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <span className="text-brand-600 dark:text-brand-400 font-black bg-white dark:bg-gray-900 px-4 py-1.5 rounded-xl text-xs border border-brand-100 dark:border-gray-800 shadow-sm uppercase tracking-widest">
                      @{session.user?.username || "pembaca"}
                    </span>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-xl font-black text-gray-900 dark:text-white">{stats.followersCount}</p>
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Pengikut</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-black text-gray-900 dark:text-white">{stats.followingCount}</p>
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Mengikuti</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Link href="/dashboard/profile">
                  <Button variant="ghost" className="rounded-2xl px-6 font-black uppercase tracking-widest text-xs border border-gray-200 dark:border-gray-800 hover:bg-white dark:hover:bg-gray-900 transition-all shadow-sm">
                    <IoSettingsOutline className="mr-2" /> Edit Profil
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom pt-36">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-10">
            {/* Gamification Card */}
            <Card className="p-10 border-none bg-white dark:bg-gray-900 shadow-2xl rounded-[3rem] relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-500/5 rounded-full blur-3xl" />
              
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-8 flex items-center gap-3">
                <IoSparkles className="text-brand-500" /> Progres Literasi
              </h3>
              
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-1">Level Anda</span>
                    <span className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic">{level}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-brand-600 uppercase tracking-widest block mb-1">{xp} XP</span>
                    <span className="text-xs font-bold text-gray-400">Total Poin</span>
                  </div>
                </div>
                
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded-full p-1 border border-gray-50 dark:border-gray-700 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${progress}%` }} 
                    className="h-full bg-gradient-to-r from-brand-600 to-indigo-600 rounded-full shadow-glow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-12">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-[2rem] text-center border border-transparent hover:border-brand-100 transition-all group">
                  <p className="text-3xl font-black text-gray-900 dark:text-white group-hover:scale-110 transition-transform">{stats.reviewsCount}</p>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Review</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-[2rem] text-center border border-transparent hover:border-brand-100 transition-all group">
                  <p className="text-3xl font-black text-gray-900 dark:text-white group-hover:scale-110 transition-transform">{stats.likesReceived}</p>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Likes</p>
                </div>
              </div>
            </Card>

            {/* Badges Collection */}
            <Card className="p-10 border-none bg-white dark:bg-gray-900 shadow-2xl rounded-[3rem]">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-3">
                  <IoExtensionPuzzle className="text-brand-500" /> Koleksi Lencana
                </h3>
                <span className="text-[10px] font-black text-brand-600 bg-brand-50 dark:bg-brand-900/30 px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                  {earnedBadges.filter(b => b.earned).length} / {ALL_BADGES.length}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {earnedBadges.map((badge) => (
                  <motion.div 
                    key={badge.id} 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`aspect-square rounded-2xl flex items-center justify-center text-2xl transition-all duration-500 ${
                      badge.earned 
                        ? "bg-brand-50 dark:bg-brand-900/30 text-brand-600 shadow-glow-sm border border-brand-100 dark:border-brand-800" 
                        : "bg-gray-50 dark:bg-gray-800/50 text-gray-300 dark:text-gray-700 opacity-30 grayscale"
                    }`}
                    title={`${badge.label}: ${badge.desc}`}
                  >
                    {badge.icon}
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-8 space-y-10">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 shadow-sm font-bold">
                  <IoBook />
                </div>
                Review Saya
              </h2>
              <div className="px-5 py-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                {reviews.length} KARYA
              </div>
            </div>

            {reviews.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-8">
                {reviews.map((review, i) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link href={`/reviews/${review.slug}`} className="group block h-full">
                      <Card className="h-full border-none bg-white dark:bg-gray-900 shadow-xl hover:shadow-3xl transition-all duration-500 rounded-[3rem] overflow-hidden flex flex-col group-hover:-translate-y-2 border-2 border-transparent hover:border-brand-100">
                        <div className="relative h-56 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                          {review.book_cover_url ? (
                            <Image
                              src={review.book_cover_url}
                              alt={review.book_title}
                              fill
                              className="object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <IoBook size={64} className="opacity-20" />
                            </div>
                          )}
                          <div className="absolute top-6 left-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg border border-white/50 dark:border-gray-800">
                            {review.categories?.name}
                          </div>
                          <div className="absolute bottom-6 right-6 bg-yellow-400 text-gray-900 px-3 py-1.5 rounded-xl text-xs font-black shadow-2xl flex items-center gap-1.5">
                            <IoHeart /> {review.rating}/5
                          </div>
                        </div>
                        
                        <div className="p-8 flex-1 flex flex-col">
                          <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 line-clamp-2 leading-tight uppercase tracking-tighter group-hover:text-brand-600 transition-colors">
                            {review.title}
                          </h3>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-6">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                            Buku: {review.book_title}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 mb-8 leading-relaxed font-medium">
                            {review.excerpt}
                          </p>
                          
                          <div className="mt-auto pt-6 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                              <IoTime className="text-brand-500/50" /> {new Date(review.created_at).toLocaleDateString('id-ID')}
                            </div>
                            <span className="text-[10px] font-black text-brand-600 group-hover:gap-3 transition-all flex items-center gap-2 uppercase tracking-widest">
                              Detail <IoChevronForward />
                            </span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-white dark:bg-gray-900 rounded-[4rem] border-2 border-dashed border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center">
                <div className="w-32 h-32 bg-gray-50 dark:bg-gray-800 rounded-[3rem] flex items-center justify-center mb-10 text-6xl shadow-inner animate-pulse">
                  📚
                </div>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter uppercase italic">
                  Belum Ada Review
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-xs mb-10 font-medium leading-relaxed">
                  Bagikan pemikiranmu tentang buku pertama yang kamu baca!
                </p>
                <Link href="/reviews/create">
                  <Button size="lg" className="rounded-[2rem] px-10 font-black uppercase tracking-widest text-xs shadow-2xl">
                    Tulis Review Sekarang
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="h-80 bg-gray-200 dark:bg-gray-800 animate-pulse" />
      <div className="container-custom pt-32 space-y-12">
        <div className="flex flex-col md:flex-row gap-8 items-end">
          <div className="w-48 h-44 rounded-[3rem] bg-gray-300 dark:bg-gray-700 animate-pulse border-8 border-gray-50 dark:border-gray-950" />
          <div className="flex-1 space-y-4 pb-12">
            <div className="h-12 w-64 bg-gray-300 dark:bg-gray-700 animate-pulse rounded-2xl" />
            <div className="h-6 w-32 bg-gray-300 dark:bg-gray-700 animate-pulse rounded-xl" />
          </div>
        </div>
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4 h-[600px] bg-white dark:bg-gray-900 rounded-[3rem] animate-pulse shadow-xl" />
          <div className="lg:col-span-8 h-[600px] bg-white dark:bg-gray-900 rounded-[3rem] animate-pulse shadow-xl" />
        </div>
      </div>
    </div>
  );
}

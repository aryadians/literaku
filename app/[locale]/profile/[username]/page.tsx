"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { IoBook, IoPerson, IoCalendar, IoStatsChart, IoHeart, IoGlobeOutline, IoChatbubblesOutline, IoRocketOutline, IoTime } from "react-icons/io5";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import { ALL_BADGES } from "@/lib/badges";

interface Profile {
  id: string;
  name: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  created_at: string;
}

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

export default function PublicProfilePage() {
  const params = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({ booksRead: 0, reviewsCount: 0, likesReceived: 0, commentsMade: 0, categoriesCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const xp = (stats.reviewsCount * 20) + (stats.booksRead * 10) + (stats.likesReceived * 5);
  const level = Math.floor(xp / 100) + 1;
  const progress = (xp % 100);

  // Optimized Badge Calculation
  const earnedBadges = useMemo(() => {
    return ALL_BADGES.map(badge => ({
      ...badge,
      earned: badge.criteria(stats)
    }));
  }, [stats]);

  useEffect(() => {
    if (params.username) {
      fetchProfileData(params.username as string);
    }
  }, [params.username]);

  const fetchProfileData = async (username: string) => {
    try {
      setIsLoading(true);
      setError("");
      
      // Remove @ if present
      const cleanUsername = username.startsWith('%40') ? username.substring(3) : 
                            username.startsWith('@') ? username.substring(1) : username;

      const response = await fetch(`/api/profiles/${cleanUsername}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("User tidak ditemukan");
        }
        throw new Error("Terjadi kesalahan saat mengambil data");
      }

      const data = await response.json();
      setProfile(data.profile);
      setReviews(data.reviews);
      setStats(data.stats);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal memuat profil pengguna.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-4 bg-gray-50 dark:bg-gray-950">
        <Card className="max-w-md w-full p-10 rounded-[2rem] shadow-xl border-none">
          <div className="text-6xl mb-6">🔍</div>
          <h1 className="text-2xl font-black mb-2 text-gray-900 dark:text-white">
            {error === "User tidak ditemukan" ? "Profil Tidak Ditemukan" : "Terjadi Kesalahan"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">
            {error === "User tidak ditemukan" 
              ? `Pengguna "${params.username}" tidak terdaftar di sistem kami.` 
              : error}
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 transition-all shadow-glow-sm active:scale-95"
          >
            Kembali ke Beranda
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      {/* Dynamic Header with Gradient Overlay */}
      <div className="relative h-80 bg-brand-600 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-gray-50 dark:to-gray-950 z-10" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>
        
        <div className="container-custom relative z-20 h-full flex flex-col justify-end pb-0">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-[-64px]">
            {/* Avatar with Ring */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-32 h-32 md:w-44 md:h-44 flex-shrink-0 group"
            >
              <div className="w-full h-full rounded-[2.5rem] overflow-hidden border-8 border-white dark:border-gray-950 shadow-2xl bg-white dark:bg-gray-800 transition-transform duration-500 group-hover:rotate-3">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-brand-50 dark:bg-brand-900/20 text-brand-500 text-5xl">
                    {profile.name[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-gray-900 text-[10px] font-black px-3 py-1.5 rounded-xl shadow-lg border-2 border-white dark:border-gray-950">
                LVL {level}
              </div>
            </motion.div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left pb-4 md:pb-12">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                  {profile.name}
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <span className="text-brand-600 dark:text-brand-400 font-bold bg-brand-50 dark:bg-brand-900/30 px-3 py-1 rounded-lg text-sm">
                    @{profile.username}
                  </span>
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest">
                    <IoCalendar className="text-brand-500" />
                    Bergabung {new Date(profile.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom pt-24 mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Side: Stats & About */}
          <div className="lg:col-span-4 space-y-8">
            {/* About & XP Card */}
            <Card className="p-8 border-none bg-white dark:bg-gray-900 shadow-xl rounded-[2rem] overflow-hidden relative">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-50 dark:bg-brand-900/20 rounded-full blur-3xl" />
              
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-2">
                <IoPerson className="text-brand-500" /> Tentang Penulis
              </h3>
              
              {profile.bio ? (
                <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed italic">
                  &quot;{profile.bio}&quot;
                </p>
              ) : (
                <p className="text-gray-400 dark:text-gray-500 mb-8 italic text-sm">
                  Penulis ini belum membagikan ceritanya.
                </p>
              )}

              {profile.website && (
                <a 
                  href={profile.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-brand-600 dark:text-brand-400 hover:underline mb-8 font-bold text-sm"
                >
                  <IoGlobeOutline size={18} /> {new URL(profile.website).hostname}
                </a>
              )}

              <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex justify-between text-[10px] font-black uppercase text-gray-400">
                  <span>Progres Level</span>
                  <span>{xp} / {level * 100} XP</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${progress}%` }} 
                    className="h-full bg-gradient-to-r from-brand-500 to-accent-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl text-center">
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.reviewsCount}</p>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Review</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl text-center">
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.likesReceived}</p>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Likes</p>
                </div>
              </div>
            </Card>

            {/* Badges Preview */}
            <Card className="p-8 border-none bg-white dark:bg-gray-900 shadow-xl rounded-[2rem]">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 flex items-center gap-2">
                <IoRocketOutline className="text-brand-500" /> Pencapaian
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {earnedBadges.map((badge) => (
                  <div 
                    key={badge.id} 
                    className={`aspect-square rounded-xl flex items-center justify-center text-xl transition-all duration-300 ${
                      badge.earned 
                        ? "bg-brand-50 dark:bg-brand-900/30 text-brand-600 shadow-sm border border-brand-100 dark:border-brand-800" 
                        : "bg-gray-50 dark:bg-gray-800/50 text-gray-300 dark:text-gray-700 border border-transparent opacity-50 grayscale"
                    }`}
                    title={`${badge.label}: ${badge.desc}`}
                  >
                    {badge.icon}
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-gray-400 mt-6 text-center italic font-medium">
                Koleksi lencana mencerminkan kontribusi penulis.
              </p>
            </Card>
          </div>

          {/* Right Side: Reviews Content */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600">
                  <IoBook />
                </div>
                Daftar Review
              </h2>
              <span className="text-sm font-bold text-gray-400">{reviews.length} Karya</span>
            </div>

            {reviews.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-6">
                {reviews.map((review, i) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link href={`/reviews/${review.slug}`} className="group block h-full">
                      <Card className="h-full border-none bg-white dark:bg-gray-900 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-[2rem] overflow-hidden flex flex-col group-hover:-translate-y-2">
                        <div className="relative h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                          {review.book_cover_url ? (
                            <Image
                              src={review.book_cover_url}
                              alt={review.book_title}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <IoBook size={48} />
                            </div>
                          )}
                          <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                            {review.categories?.name}
                          </div>
                          <div className="absolute bottom-4 right-4 bg-yellow-400 text-gray-900 px-2 py-1 rounded-lg text-xs font-black shadow-lg flex items-center gap-1">
                            <IoHeart /> {review.rating}/5
                          </div>
                        </div>
                        
                        <div className="p-6 flex-1 flex flex-col">
                          <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2 line-clamp-2 leading-snug group-hover:text-brand-600 transition-colors">
                            {review.title}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 font-bold truncate">
                            Buku: {review.book_title}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 mb-6 leading-relaxed">
                            {review.excerpt}
                          </p>
                          
                          <div className="mt-auto pt-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                              <IoTime /> {new Date(review.created_at).toLocaleDateString('id-ID')}
                            </div>
                            <span className="text-xs font-black text-brand-600 group-hover:translate-x-1 transition-transform">
                              BACA SELENGKAPNYA →
                            </span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-[2rem] border-2 border-dashed border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">
                  📚
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                  Belum Ada Review
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto font-medium">
                  {profile.name} sedang menyiapkan beberapa review menarik untuk Anda.
                </p>
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
      <div className="container-custom -mt-20">
        <div className="flex flex-col md:flex-row gap-8 mb-20">
          <div className="w-44 h-44 rounded-[2.5rem] bg-gray-300 dark:bg-gray-700 animate-pulse border-8 border-gray-50 dark:border-gray-950 shadow-xl" />
          <div className="pt-24 space-y-4">
            <div className="h-10 w-64 bg-gray-300 dark:bg-gray-700 animate-pulse rounded-xl" />
            <div className="h-6 w-32 bg-gray-300 dark:bg-gray-700 animate-pulse rounded-lg" />
          </div>
        </div>
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 h-96 bg-gray-200 dark:bg-gray-800 rounded-[2rem] animate-pulse" />
          <div className="lg:col-span-8 h-96 bg-gray-200 dark:bg-gray-800 rounded-[2rem] animate-pulse" />
        </div>
      </div>
    </div>
  );
}

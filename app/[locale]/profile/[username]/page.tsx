"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { IoBook, IoPerson, IoCalendar, IoStatsChart } from "react-icons/io5";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (params.username) {
      fetchProfileData(params.username as string);
    }
  }, [params.username]);

  const fetchProfileData = async (username: string) => {
    try {
      setIsLoading(true);

      // Note: We need to create this API endpoint
      // For now we'll simulate fetching or use a direct Supabase client if we were server component
      // But since we are client component, let's assume an API exists or fetch directly via supabase-js client if available
      // For this demo, I'll hit a new API endpoint we will create next: /api/profiles/[username]
      const response = await fetch(`/api/profiles/${username}`);

      if (!response.ok) {
        throw new Error("User tidak ditemukan");
      }

      const data = await response.json();
      setProfile(data.profile);
      setReviews(data.reviews);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat profil pengguna.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-4">
        <div>
          <h1 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
            404 - User Tidak Ditemukan
          </h1>
          <p className="text-gray-500 mb-6">
            Pengguna yang Anda cari tidak ada atau mungkin sudah dihapus.
          </p>
          <Link
            href="/"
            className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container-custom py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0"
            >
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl bg-gray-200">
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-brand-100 text-brand-500">
                    <IoPerson className="w-16 h-16" />
                  </div>
                )}
              </div>
            </motion.div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-1"
                >
                  {profile.name}
                </motion.h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  @{profile.username || "user"}
                </p>
              </div>

              {profile.bio && (
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto md:mx-0 leading-relaxed">
                  {profile.bio}
                </p>
              )}

              <div className="flex items-center justify-center md:justify-start gap-6 pt-2">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <IoBook className="text-brand-500" />
                  <span className="font-bold">{reviews.length}</span> Review
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <IoCalendar className="text-brand-500" />
                  <span>
                    Bergabung {new Date(profile.created_at).getFullYear()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="container-custom py-12">
        <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white flex items-center gap-2">
          <IoBook className="text-brand-600" />
          Review oleh {profile.name}
        </h2>

        {reviews.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/reviews/${review.slug}`} className="block h-full">
                  <Card
                    hover
                    className="h-full flex flex-col hover:-translate-y-1 transition-transform duration-300"
                  >
                    <div className="relative h-48 bg-gray-200 dark:bg-gray-800 overflow-hidden">
                      {review.book_cover_url ? (
                        <Image
                          src={review.book_cover_url}
                          alt={review.book_title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-brand-50 dark:bg-brand-900/10">
                          <IoBook className="w-12 h-12 text-brand-200" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                        {review.categories?.name}
                      </div>
                    </div>
                    <Card.Content className="flex-1 p-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {review.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium">
                        Buku: {review.book_title}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
                        {review.excerpt}
                      </p>
                      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1 text-yellow-500 font-bold">
                          ★ {review.rating}/5
                        </span>
                      </div>
                    </Card.Content>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <IoStatsChart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Belum ada review
            </h3>
            <p className="text-gray-500">
              User ini belum mempublikasikan review buku apapun.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 p-12">
        <div className="container-custom flex gap-8">
          <Skeleton className="w-32 h-32 rounded-full" />
          <div className="space-y-4 flex-1">
            <Skeleton className="w-64 h-10" />
            <Skeleton className="w-32 h-4" />
            <Skeleton className="w-full h-20 max-w-xl" />
          </div>
        </div>
      </div>
      <div className="container-custom py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

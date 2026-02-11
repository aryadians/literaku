"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { IoArrowForward, IoBookOutline, IoStarSharp, IoLibrary, IoRocketOutline, IoPeopleOutline } from "react-icons/io5";
import useSWR from "swr";

interface Book {
  id: string;
  title: string;
  slug: string;
  author: string;
  cover_url: string | null;
}

interface Review {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  rating: number;
  created_at: string;
  profiles?: {
    name: string | null;
  };
  categories?: {
    name: string;
  };
}

export default function HomePage() {
  const t = useTranslations("home");

  // Fetch Latest Books
  const { data: booksData } = useSWR("/api/books/latest", async (url) => {
    const res = await fetch(url);
    return res.json();
  });
  const books: Book[] = booksData || [];

  // Fetch Latest Reviews
  const { data: reviewsData } = useSWR("/api/reviews/latest", async (url) => {
    const res = await fetch(url);
    return res.json();
  });
  const reviews: Review[] = reviewsData || [];

  // Fetch Stats Counts
  const { data: statsData } = useSWR("/api/stats/counts", async (url) => {
    const res = await fetch(url);
    return res.json();
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 overflow-hidden">
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl z-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-500/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="container-custom relative z-10 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 text-sm font-semibold mb-8 animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
              {t("hero.badge")}
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.1]">
              {t("hero.title")} <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">
                {t("hero.titleAccent")}
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t("hero.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/library">
                <Button size="lg" className="rounded-full px-10 h-14 text-lg shadow-xl shadow-brand-500/20 hover:shadow-2xl hover:shadow-brand-500/30 transition-all">
                  {t("hero.ctaStart")}
                </Button>
              </Link>
              <Link href="/reviews">
                <Button variant="outline" size="lg" className="rounded-full px-10 h-14 text-lg border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900">
                  {t("hero.ctaExplore")}
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Hero Stats (Synchronized with database) */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-gray-100 dark:border-gray-800 pt-10"
          >
            {[
              { label: "Buku Tersedia", value: statsData?.books ? `${statsData.books}+` : "Loading...", icon: IoLibrary },
              { label: "Pengguna Aktif", value: statsData?.users ? `${statsData.users}+` : "Loading...", icon: IoPeopleOutline },
              { label: "Review Jujur", value: statsData?.reviews ? `${statsData.reviews}+` : "Loading...", icon: IoStarSharp },
              { label: "Kategori", value: statsData?.categories ? `${statsData.categories}+` : "Loading...", icon: IoBookOutline },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="flex justify-center mb-2 text-brand-500 text-2xl">
                  <stat.icon />
                </div>
                <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-gray-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- FEATURED SECTION (Bento Grid Style) --- */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/30">
        <div className="container-custom">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-black mb-4">{t("featured.title")}</h2>
              <p className="text-gray-500 max-w-md">{t("featured.subtitle")}</p>
            </div>
            <Link href="/library" className="hidden md:flex items-center gap-2 font-bold text-brand-600 hover:gap-3 transition-all">
              {t("featured.viewAll")} <IoArrowForward />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 h-auto lg:h-[600px]">
            {/* Main Featured Book (Large) */}
            <div className="md:col-span-2 lg:col-span-2 md:row-span-2 relative group rounded-3xl overflow-hidden shadow-2xl">
              {books[0] ? (
                <Link href={`/read/${books[0].slug}`} className="block w-full h-full bg-gray-900">
                  <Image
                    src={books[0].cover_url || "/placeholder-book.jpg"}
                    alt={books[0].title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-10 flex flex-col justify-end">
                    <span className="inline-block px-3 py-1 bg-brand-500 text-white text-xs font-bold rounded-lg mb-4 w-fit">
                      REKOMENDASI MINGGU INI
                    </span>
                    <h3 className="text-3xl md:text-5xl font-black text-white mb-2 leading-tight">
                      {books[0].title}
                    </h3>
                    <p className="text-white/80 font-medium text-lg">{books[0].author}</p>
                  </div>
                </Link>
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
              )}
            </div>

            {/* Secondary Books */}
            {books.slice(1, 3).map((book) => (
              <Link key={book.id} href={`/read/${book.slug}`} className="relative group rounded-3xl overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-800">
                <div className="absolute inset-0">
                  <Image
                    src={book.cover_url || "/placeholder-book.jpg"}
                    alt={book.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                </div>
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <h4 className="text-xl font-bold text-white mb-1 line-clamp-2">{book.title}</h4>
                  <p className="text-white/70 text-sm">{book.author}</p>
                </div>
              </Link>
            ))}

            {/* Promo Card */}
            <div className="bg-brand-600 rounded-3xl p-8 flex flex-col justify-center text-white text-center shadow-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
              <div className="relative z-10">
                <IoRocketOutline className="text-6xl mx-auto mb-4" />
                <h3 className="text-2xl font-black mb-2">Gabung Komunitas</h3>
                <p className="text-white/80 text-sm mb-6">Mulai perjalanan literasi Anda bersama ribuan pembaca lainnya.</p>
                <Link href="/auth/register">
                  <Button variant="secondary" className="w-full rounded-xl font-bold">Daftar Gratis</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- LATEST REVIEWS --- */}
      <section className="py-20 border-t border-gray-100 dark:border-gray-800">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">{t("reviews.title")}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">{t("reviews.subtitle")}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.slice(0, 3).map((review, i: number) => (
              <motion.div 
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/reviews/${review.slug}`} className="block h-full group">
                  <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col hover:-translate-y-1">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl font-bold text-gray-600 dark:text-gray-300">
                        {review.profiles?.name?.[0] || "U"}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white leading-tight">{review.profiles?.name || "User"}</h4>
                        <span className="text-xs text-gray-500">Reviewer</span>
                      </div>
                      <div className="ml-auto flex gap-1 text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <IoStarSharp key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-200 dark:text-gray-700"} />
                        ))}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-3 group-hover:text-brand-600 transition-colors line-clamp-2">
                      {review.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-6 line-clamp-3 flex-1">
                      {review.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-6 border-t border-gray-50 dark:border-gray-800">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                      <span className="text-sm font-bold text-brand-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                        Baca Review <IoArrowForward />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CALL TO ACTION --- */}
      <section className="py-20">
        <div className="container-custom">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-brand-900 dark:to-gray-900 rounded-[3rem] p-10 md:p-20 text-center text-white relative overflow-hidden">
            {/* Decorative Circles */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-500/20 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-black mb-6">Siap Memulai Petualangan Literasi?</h2>
              <p className="text-lg text-gray-300 mb-10 leading-relaxed">
                Bergabunglah dengan komunitas pembaca kami, temukan buku favorit baru Anda, dan bagikan pemikiran Anda dengan dunia.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/register">
                  <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 rounded-full px-10 h-14 font-bold">
                    Daftar Sekarang
                  </Button>
                </Link>
                <Link href="/library">
                  <Button variant="outline" size="lg" className="border-gray-700 text-white hover:bg-gray-800 rounded-full px-10 h-14 font-bold">
                    Jelajahi Perpustakaan
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

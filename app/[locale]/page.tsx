"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { 
  IoArrowForward, 
  IoBookOutline, 
  IoStarSharp, 
  IoLibrary, 
  IoRocketOutline, 
  IoPeopleOutline,
  IoSparklesSharp,
  IoTrendingUpOutline,
  IoShieldCheckmarkOutline,
  IoPerson,
  IoChatbubbles,
  IoTimeOutline
} from "react-icons/io5";
import useSWR from "swr";
import { useRef } from "react";

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
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

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
    <div className="min-h-screen bg-white dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 overflow-hidden" ref={containerRef}>
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-56 lg:pb-40 overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl z-0 pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-500/20 rounded-full blur-[120px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [0, -90, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/20 rounded-full blur-[120px]" 
          />
        </div>

        <div className="container-custom relative z-10 text-center max-w-5xl mx-auto">
          <motion.div style={{ y: y1, opacity }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-md border border-brand-100 dark:border-white/10 text-sm font-black text-brand-600 dark:text-brand-400 mb-10 shadow-glow-sm"
            >
              <IoSparklesSharp className="animate-pulse" />
              <span className="uppercase tracking-[0.2em]">{t("hero.badge")}</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tight mb-10 leading-[0.9] lg:leading-[0.85]"
            >
              {t("hero.title")} <br className="hidden lg:block" />
              <span className="relative inline-block mt-4">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-purple-600 to-indigo-600">
                  {t("hero.titleAccent")}
                </span>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1, duration: 1 }}
                  className="absolute bottom-4 left-0 h-4 bg-brand-500/10 -z-0"
                />
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 mb-14 max-w-2xl mx-auto leading-relaxed font-medium"
            >
              {t("hero.description")}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <Link href="/library">
                <Button size="lg" className="rounded-2xl px-12 h-16 text-lg font-black uppercase tracking-widest shadow-2xl shadow-brand-500/40 hover:scale-105 active:scale-95 transition-all">
                  {t("hero.ctaStart")}
                </Button>
              </Link>
              <Link href="/reviews">
                <Button variant="ghost" size="lg" className="rounded-2xl px-12 h-16 text-lg font-black uppercase tracking-widest border-2 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all">
                  {t("hero.ctaExplore")}
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Floating Feature Cards */}
          <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              { title: "Koleksi Terkurasi", desc: "Ribuan buku berkualitas dari berbagai genre.", icon: <IoLibrary />, color: "text-brand-500 bg-brand-50" },
              { title: "Review Terpercaya", desc: "Dapatkan perspektif asli dari pembaca lain.", icon: <IoStarSharp />, color: "text-purple-500 bg-purple-50" },
              { title: "Progres Terpantau", desc: "Catat setiap halaman yang kamu baca.", icon: <IoTrendingUpOutline />, color: "text-indigo-500 bg-indigo-50" },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="p-8 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl hover:shadow-2xl transition-all group"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 ${f.color} dark:bg-gray-800 group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-black mb-2 text-gray-900 dark:text-white uppercase tracking-tighter">{f.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURED SECTION --- */}
      <section className="py-32 bg-gray-50 dark:bg-gray-900/50">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-xl text-center md:text-left">
              <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter uppercase">{t("featured.title")}</h2>
              <p className="text-xl text-gray-500 dark:text-gray-400 font-medium">{t("featured.subtitle")}</p>
            </div>
            <Link href="/library">
              <Button variant="ghost" className="rounded-full font-black uppercase tracking-widest gap-3 hover:gap-5 transition-all text-brand-600">
                {t("featured.viewAll")} <IoArrowForward />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-auto">
            {/* Main Featured */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="lg:col-span-7 relative group rounded-[3rem] overflow-hidden shadow-2xl h-[500px] lg:h-[600px] border-8 border-white dark:border-gray-800"
            >
              {books[0] ? (
                <Link href={`/read/${books[0].slug}`} className="block w-full h-full bg-gray-900">
                  <Image
                    src={books[0].cover_url || "/placeholder-book.jpg"}
                    alt={books[0].title}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-50"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent p-12 flex flex-col justify-end">
                    <div className="flex items-center gap-2 mb-6">
                      <span className="px-4 py-1.5 bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-glow-sm">
                        Hot Recommendation
                      </span>
                    </div>
                    <h3 className="text-4xl md:text-6xl font-black text-white mb-4 leading-[0.9] tracking-tighter">
                      {books[0].title}
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                        <IoPerson />
                      </div>
                      <p className="text-white/80 font-bold text-xl">{books[0].author}</p>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
              )}
            </motion.div>

            {/* Side Grid */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-8">
              {books.slice(1, 3).map((book, i) => (
                <motion.div
                  key={book.id}
                  whileHover={{ x: 10 }}
                  className="relative group rounded-[2.5rem] overflow-hidden shadow-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 h-[280px]"
                >
                  <Link href={`/read/${book.slug}`} className="flex h-full">
                    <div className="w-1/3 relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <Image
                        src={book.cover_url || "/placeholder-book.jpg"}
                        alt={book.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                    <div className="w-2/3 p-8 flex flex-col justify-center">
                      <div className="flex gap-1 text-yellow-400 mb-4">
                        {[...Array(5)].map((_, i) => <IoStarSharp key={i} size={14} />)}
                      </div>
                      <h4 className="text-2xl font-black text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight uppercase tracking-tighter">{book.title}</h4>
                      <p className="text-gray-500 dark:text-gray-400 font-bold text-sm uppercase tracking-widest">{book.author}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="py-24 bg-brand-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { label: "Buku Tersedia", value: statsData?.books || "0", icon: IoLibrary },
              { label: "Pengguna Aktif", value: statsData?.users || "0", icon: IoPeopleOutline },
              { label: "Ulasan Pembaca", value: statsData?.reviews || "0", icon: IoStarSharp },
              { label: "Genre Beragam", value: statsData?.categories || "0", icon: IoBookOutline },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md mb-6 text-3xl">
                  <stat.icon />
                </div>
                <div className="text-5xl md:text-6xl font-black mb-2 tracking-tighter">
                  {stat.value}+
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- LATEST REVIEWS --- */}
      <section className="py-32">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tighter"
            >
              {t("reviews.title")}
            </motion.h2>
            <p className="text-xl text-gray-500 dark:text-gray-400 font-medium">{t("reviews.subtitle")}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {reviews.slice(0, 3).map((review, i: number) => (
              <motion.div 
                key={review.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/reviews/${review.slug}`} className="block h-full group">
                  <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl hover:shadow-2xl transition-all duration-500 h-full flex flex-col relative overflow-hidden group-hover:-translate-y-2">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <IoChatbubbles className="text-8xl" />
                    </div>
                    
                    <div className="flex items-center gap-4 mb-10 relative z-10">
                      <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-2xl font-black text-brand-600">
                        {review.profiles?.name?.[0] || "U"}
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">{review.profiles?.name || "User"}</h4>
                        <div className="flex gap-0.5 text-yellow-400 mt-1">
                          {[...Array(5)].map((_, idx) => (
                            <IoStarSharp key={idx} size={12} className={idx < review.rating ? "text-yellow-400" : "text-gray-200 dark:text-gray-700"} />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-black mb-4 group-hover:text-brand-600 transition-colors line-clamp-2 leading-tight uppercase tracking-tighter">
                      {review.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-10 line-clamp-4 flex-1 text-lg font-medium">
                      {review.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-8 border-t border-gray-50 dark:border-gray-800 mt-auto">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                        <IoTimeOutline size={16} /> {new Date(review.created_at).toLocaleDateString()}
                      </div>
                      <span className="text-xs font-black text-brand-600 flex items-center gap-2 uppercase tracking-widest group-hover:gap-4 transition-all">
                        Baca <IoArrowForward />
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
      <section className="py-20 mb-20">
        <div className="container-custom">
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="bg-gray-900 dark:bg-brand-950 rounded-[4rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-3xl shadow-brand-500/20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-600/20 via-transparent to-purple-600/20" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <IoRocketOutline className="text-7xl mx-auto mb-10 text-brand-400 animate-bounce" />
              <h2 className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tighter uppercase italic">Siap Memulai Petualangan?</h2>
              <p className="text-xl md:text-2xl text-gray-300 mb-14 leading-relaxed font-medium">
                Bergabunglah dengan komunitas pembaca kami, temukan buku favorit baru Anda, dan bagikan pemikiran Anda dengan dunia.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/auth/register">
                  <Button size="lg" className="bg-white text-gray-900 hover:bg-brand-50 rounded-2xl px-14 h-16 font-black uppercase tracking-widest shadow-xl">
                    Daftar Sekarang
                  </Button>
                </Link>
                <Link href="/library">
                  <Button variant="outline" size="lg" className="border-2 border-white/20 text-white hover:bg-white/10 rounded-2xl px-14 h-16 font-black uppercase tracking-widest backdrop-blur-md">
                    Jelajahi Library
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

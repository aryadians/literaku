"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { id as idLocale, enUS as enLocale } from "date-fns/locale";
import ReactMarkdown from "react-markdown";
import {
  IoStar,
  IoCalendar,
  IoPerson,
  IoHeart,
  IoShareSocial,
  IoArrowBack,
  IoEye,
  IoBook,
  IoChatbubble,
  IoSend,
  IoLockClosed,
  IoChevronForward,
  IoSparkles
} from "react-icons/io5";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

interface ReviewDetail {
  id: string;
  title: string;
  book_title: string;
  book_author: string;
  book_cover_url: string | null;
  content: string;
  rating: number;
  views: number;
  created_at: string;
  profiles: {
    name: string;
    avatar_url: string | null;
    bio: string | null;
    username?: string;
  };
  categories: {
    name: string;
    slug: string;
  } | null;
  review_likes: any[];
  review_comments?: {
    id: string;
    content: string;
    created_at: string;
    profiles: {
      name: string;
      avatar_url: string | null;
    };
  }[];
}

export default function ReviewDetailPage() {
  const t = useTranslations("reviewDetail");
  const tc = useTranslations("common");
  const params = useParams();
  const locale = useParams().locale as string;
  const currentLocale = locale === "id" ? idLocale : enLocale;
  const { data: session } = useSession();
  const router = useRouter();
  const [review, setReview] = useState<ReviewDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    if (params.slug) fetchReview(params.slug as string);
  }, [params.slug]);

  useEffect(() => {
    if (review) {
      setLikeCount(review.review_likes?.length || 0);
      if (session?.user?.id) {
        setIsLiked(review.review_likes?.some((l) => (l.user_id || l.id) === session.user.id));
      }
    }
  }, [review, session]);

  const handleShare = async () => {
    const url = window.location.href;
    const title = review?.title || "Literaku Review";

    await Swal.fire({
      title: t("share.title"),
      html: `
        <div class="flex flex-col gap-3">
          <a href="https://wa.me/?text=${encodeURIComponent(title + " " + url)}" target="_blank" class="flex items-center gap-3 p-4 rounded-2xl bg-[#25D366]/10 text-[#25D366] font-black uppercase tracking-widest text-xs hover:bg-[#25D366]/20 transition-all">
            WhatsApp
          </a>
          <button id="copyLinkBtn" class="flex items-center justify-center gap-3 p-4 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-black uppercase tracking-widest text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
             ${t("share.copyLink")}
          </button>
        </div>
      `,
      showConfirmButton: false,
      showCloseButton: true,
      didOpen: () => {
        document.getElementById("copyLinkBtn")?.addEventListener("click", () => {
          navigator.clipboard.writeText(url);
          Swal.fire({ icon: "success", title: t("share.success"), timer: 1500, showConfirmButton: false });
        });
      },
    });
  };

  const handleLike = async () => {
    if (!session) {
      Swal.fire({
        icon: "info",
        title: t("auth.title"),
        text: t("auth.likeText"),
        showCancelButton: true,
        confirmButtonText: t("auth.login"),
        confirmButtonColor: "#4F46E5"
      }).then((res) => { if (res.isConfirmed) router.push("/auth/login"); });
      return;
    }

    const prevLiked = isLiked;
    setIsLiked(!prevLiked);
    setLikeCount(prev => prevLiked ? prev - 1 : prev + 1);

    try {
      await fetch(`/api/reviews/${params.slug}/like`, { method: "POST" });
    } catch (e) {
      setIsLiked(prevLiked);
      setLikeCount(prev => prevLiked ? prev + 1 : prev - 1);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || !session) return;
    try {
      const res = await fetch(`/api/reviews/${params.slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentText }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setReview(prev => prev ? { ...prev, review_comments: [newComment, ...(prev.review_comments || [])] } : null);
        setCommentText("");
        Swal.fire({ toast: true, position: 'top-end', icon: "success", title: "Komentar terkirim", showConfirmButton: false, timer: 2000 });
      }
    } catch (e) { console.error(e); }
  };

  const fetchReview = async (slug: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/reviews/${slug}`);
      if (!res.ok) throw new Error("Review not found");
      const data = await res.json();
      setReview(data.review);
    } catch (e) { setError(tc("errorFetching")); }
    finally { setIsLoading(false); }
  };

  if (isLoading) return <ReviewDetailSkeleton />;
  if (error || !review) return <ReviewError error={error} />;

  return (
    <article className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-32">
      {/* Premium Hero Header */}
      <div className="relative w-full min-h-[60vh] flex items-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          {review.book_cover_url && (
            <Image src={review.book_cover_url} alt="" fill className="object-cover opacity-20 blur-3xl scale-110" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900/80 to-gray-50 dark:to-gray-950" />
        </div>

        <div className="container-custom relative z-10 py-20">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-12 max-w-6xl mx-auto">
            {/* Book Cover 3D */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative w-56 h-80 md:w-72 md:h-[450px] flex-shrink-0 rounded-[2.5rem] shadow-3xl overflow-hidden border-8 border-white dark:border-gray-800 transform md:translate-y-20 bg-gray-800"
            >
              {review.book_cover_url ? (
                <Image src={review.book_cover_url} alt={review.book_title} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600"><IoBook size={80} /></div>
              )}
            </motion.div>

            {/* Info Section */}
            <div className="flex-1 text-center md:text-left">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-8">
                  {review.categories && (
                    <span className="px-5 py-1.5 bg-brand-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-glow-sm">
                      {review.categories.name}
                    </span>
                  )}
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-yellow-400 border border-white/10">
                    <IoStar className="animate-pulse" />
                    <span className="font-black text-white text-xs">{review.rating} / 5</span>
                  </div>
                </div>

                <h1 className="text-4xl md:text-7xl font-black text-white mb-4 leading-[0.9] tracking-tighter uppercase italic drop-shadow-2xl">
                  {review.title}
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 font-bold mb-10 tracking-tight">
                  Ulasan buku <span className="text-brand-400">"{review.book_title}"</span> oleh {review.book_author}
                </p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                  <Link href={`/profile/${review.profiles.username || review.profiles.name}`} className="flex items-center gap-4 bg-white dark:bg-gray-900 p-2 pr-6 rounded-[2rem] shadow-xl group transition-all hover:scale-105 active:scale-95 border border-white/10">
                    <div className="w-12 h-12 rounded-[1.5rem] overflow-hidden relative border-2 border-brand-50 shadow-sm">
                      {review.profiles.avatar_url ? (
                        <Image src={review.profiles.avatar_url} alt={review.profiles.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-brand-50 flex items-center justify-center text-brand-600 font-black">{review.profiles.name[0]}</div>
                      )}
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Penulis Review</p>
                      <p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-brand-600 transition-colors">{review.profiles.name}</p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2 text-gray-400 text-xs font-black uppercase tracking-widest">
                    <IoCalendar className="text-brand-500" />
                    {format(new Date(review.created_at), "d MMM yyyy", { locale: currentLocale })}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="container-custom max-w-6xl mt-40">
        <div className="grid lg:grid-cols-[1fr_350px] gap-16">
          {/* Review Article */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl p-10 md:p-16 mb-12 border border-gray-100 dark:border-gray-800 relative">
              <div className="absolute -top-6 left-12 w-12 h-12 bg-brand-600 text-white flex items-center justify-center text-2xl rounded-2xl shadow-glow-sm">
                <IoBook />
              </div>
              
              <div className={`prose prose-xl dark:prose-invert max-w-none font-serif leading-loose ${!session ? "max-h-[600px] overflow-hidden" : ""}`}>
                <ReactMarkdown>{session ? review.content : review.content.split("\n").slice(0, 12).join("\n")}</ReactMarkdown>
              </div>

              {!session && (
                <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-white dark:from-gray-900 via-white/95 dark:via-gray-900/95 to-transparent flex flex-col items-center justify-end pb-20 z-10 px-8">
                  <div className="text-center p-10 bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl backdrop-blur-md max-w-md">
                    <IoLockClosed size={48} className="text-brand-500 mx-auto mb-6 animate-bounce" />
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tighter italic">Lanjutkan Membaca</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">Buat akun gratis atau masuk untuk membaca ulasan lengkap dan berinteraksi dengan komunitas.</p>
                    <div className="flex flex-col gap-3">
                      <Button onClick={() => router.push("/auth/login")} className="w-full rounded-2xl h-14 font-black uppercase tracking-widest shadow-lg">Login Literaku</Button>
                      <Link href="/auth/register" className="text-xs font-black text-brand-600 uppercase tracking-widest hover:underline mt-2">Daftar Sekarang</Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Engagement Panel */}
            <div className="flex flex-wrap items-center justify-between gap-6 p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-8">
                <button onClick={handleLike} className={`flex items-center gap-3 transition-all group ${isLiked ? "text-red-500" : "text-gray-400"}`}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all ${isLiked ? "bg-red-50 dark:bg-red-900/20" : "bg-gray-100 dark:bg-gray-800 group-hover:bg-red-50"}`}>
                    <IoHeart className={isLiked ? "fill-current" : ""} />
                  </div>
                  <div>
                    <p className="text-xl font-black text-gray-900 dark:text-white leading-none mb-1">{likeCount}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest">Suka</p>
                  </div>
                </button>
                <div className="flex items-center gap-3 text-gray-400">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl">
                    <IoEye />
                  </div>
                  <div>
                    <p className="text-xl font-black text-gray-900 dark:text-white leading-none mb-1">{review.views}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest">Dilihat</p>
                  </div>
                </div>
              </div>
              <button onClick={handleShare} className="flex items-center gap-3 px-8 py-4 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-600 hover:text-white transition-all shadow-sm">
                <IoShareSocial size={20} /> Bagikan
              </button>
            </div>
          </motion.div>

          {/* Sidebar */}
          <aside className="space-y-10">
            <div className="sticky top-28 space-y-10">
              {/* About Reviewer Card */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-800 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><IoPerson size={100} /></div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-8 flex items-center gap-2">
                  <IoSparkles className="text-brand-500" /> Profil Reviewer
                </h3>
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-20 h-20 rounded-[1.5rem] bg-gray-100 dark:bg-gray-800 relative overflow-hidden border-2 border-brand-50">
                    {review.profiles.avatar_url ? (
                      <Image src={review.profiles.avatar_url} alt={review.profiles.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brand-500 font-black text-2xl">{review.profiles.name[0]}</div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter italic text-xl leading-tight mb-1">{review.profiles.name}</h4>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kritikus Handal</p>
                  </div>
                </div>
                {review.profiles.bio && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8 italic">"{review.profiles.bio}"</p>
                )}
                <Link href={`/profile/${review.profiles.username || review.profiles.name}`} className="block">
                  <button className="w-full py-4 bg-gray-900 dark:bg-gray-800 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-brand-600 transition-all shadow-lg active:scale-95">Lihat Profil Lengkap</button>
                </Link>
              </div>
              
              {/* Promotion / Ads */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                <h4 className="text-2xl font-black mb-4 uppercase tracking-tighter italic leading-none relative z-10">Buku Ini <br/>Tersedia Sekarang!</h4>
                <p className="text-white/70 text-xs font-bold mb-8 leading-relaxed relative z-10">Baca gratis di Literaku Library dan buat catatanmu sendiri.</p>
                <Link href="/library" className="relative z-10">
                  <Button variant="secondary" className="w-full rounded-xl font-black uppercase tracking-widest text-[10px] h-12 shadow-2xl">Buka Library</Button>
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* Full Width Comments Section - Premium */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-24 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-[3.5rem] p-10 md:p-16 shadow-2xl border border-gray-100 dark:border-gray-800">
            <h3 className="text-3xl font-black mb-12 flex items-center gap-5 text-gray-900 dark:text-white uppercase tracking-tighter italic">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 shadow-sm"><IoChatbubble /></div>
              Diskusi Komunitas
              <span className="text-sm font-black text-gray-400 ml-auto bg-gray-50 dark:bg-gray-800 px-4 py-1.5 rounded-xl uppercase tracking-widest">{(review?.review_comments?.length || 0)} PESAN</span>
            </h3>

            <div className="space-y-10 mb-16">
              {review?.review_comments && review.review_comments.length > 0 ? (
                review.review_comments.map((comment: any, i: number) => (
                  <motion.div key={comment.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex gap-6 group">
                    <div className="flex-shrink-0 w-16 h-16 rounded-[1.5rem] bg-gray-100 dark:bg-gray-800 relative overflow-hidden border-4 border-white dark:border-gray-700 shadow-xl group-hover:scale-110 transition-transform">
                      {comment.profiles.avatar_url ? (
                        <Image src={comment.profiles.avatar_url} alt="" fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-brand-500 font-black text-xl">{comment.profiles.name[0]}</div>
                      )}
                    </div>
                    <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 p-8 rounded-[2.5rem] relative group-hover:bg-white dark:group-hover:bg-gray-800 transition-all border border-transparent group-hover:border-gray-100">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                        <span className="font-black text-gray-900 dark:text-white text-lg uppercase tracking-tight italic">{comment.profiles.name}</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{format(new Date(comment.created_at), "d MMMM yyyy", { locale: currentLocale })}</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg font-medium">{comment.content}</p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/30 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
                  <p className="text-gray-400 font-black uppercase tracking-[0.2em] text-xs">Jadilah yang pertama memberikan ulasan!</p>
                </div>
              )}
            </div>

            {/* Comment Form - Refined */}
            <div className="pt-12 border-t border-gray-100 dark:border-gray-800">
              {session ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-3 h-10 bg-brand-600 rounded-full" />
                    <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">Tulis Komentar</h4>
                  </div>
                  <div className="relative group">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Apa pendapatmu tentang review ini?"
                      className="w-full p-8 rounded-[2.5rem] border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 focus:bg-white dark:focus:bg-gray-900 focus:ring-8 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all resize-none min-h-[180px] shadow-inner text-gray-900 dark:text-white text-lg font-medium"
                    />
                    <div className="absolute bottom-6 right-8 text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-0 group-focus-within:opacity-100 transition-opacity">Markdown didukung</div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <button onClick={handleCommentSubmit} disabled={!commentText.trim()} className="flex items-center gap-3 px-12 py-5 bg-brand-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-brand-700 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-brand-500/40 disabled:opacity-50 disabled:hover:scale-100">
                      <IoSend size={20} /> Kirim Pesan
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-900 rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-600/30 to-purple-600/30" />
                  <div className="relative z-10 max-w-md mx-auto">
                    <IoLockClosed size={48} className="mx-auto mb-6 text-brand-400" />
                    <h4 className="text-2xl font-black mb-4 uppercase tracking-tighter italic">Diskusi Terkunci</h4>
                    <p className="text-white/70 mb-10 font-bold text-sm leading-relaxed">Masuk ke Literaku untuk ikut serta dalam diskusi literasi dengan pembaca lainnya.</p>
                    <Button onClick={() => router.push("/auth/login")} className="w-full rounded-2xl h-14 font-black uppercase tracking-widest text-xs shadow-xl">Masuk Sekarang</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </article>
  );
}

function ReviewError({ error }: { error: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8 bg-gray-50 dark:bg-gray-950">
      <Card className="max-w-md w-full p-12 rounded-[3rem] shadow-3xl border-none">
        <div className="text-7xl mb-8">🔭</div>
        <h1 className="text-3xl font-black mb-4 text-gray-900 dark:text-white uppercase tracking-tighter italic">{error || "Review Tidak Ditemukan"}</h1>
        <p className="text-gray-500 mb-10 font-medium leading-relaxed">Sepertinya ulasan yang kamu cari telah dipindahkan atau sudah tidak tersedia di perpustakaan kami.</p>
        <Link href="/reviews">
          <Button className="w-full rounded-2xl h-14 font-black uppercase tracking-widest text-xs shadow-glow-sm">Lihat Review Lainnya</Button>
        </Link>
      </Card>
    </div>
  );
}

function ReviewDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="w-full h-[60vh] bg-gray-200 dark:bg-gray-900 animate-pulse" />
      <div className="container-custom max-w-6xl -mt-40 relative z-10">
        <div className="grid lg:grid-cols-[1fr_350px] gap-16">
          <div className="space-y-12">
            <div className="h-[600px] bg-white dark:bg-gray-900 rounded-[3rem] animate-pulse shadow-xl" />
            <div className="h-32 bg-white dark:bg-gray-900 rounded-3xl animate-pulse shadow-xl" />
          </div>
          <div className="space-y-10">
            <div className="h-96 bg-white dark:bg-gray-900 rounded-3xl animate-pulse shadow-xl" />
            <div className="h-64 bg-brand-600 rounded-3xl animate-pulse shadow-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

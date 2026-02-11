"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
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
} from "react-icons/io5";
import { Skeleton } from "@/components/ui/Skeleton";
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
  local_comments?: any[]; // For instant UI update
}

export default function ReviewDetailPage() {
  const t = useTranslations("reviewDetail");
  const tc = useTranslations("common");
  const params = useParams();
  const locale = useParams().locale as string;
  const currentLocale = locale === "id" ? idLocale : enLocale;
  const { data: session } = useSession(); // Auth check
  const router = useRouter(); // For redirecting to login
  const [review, setReview] = useState<ReviewDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [commentText, setCommentText] = useState(""); // Form state
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    if (params.slug) {
      fetchReview(params.slug as string);
    }
  }, [params.slug]);

  useEffect(() => {
    if (review) {
      setLikeCount(review.review_likes?.length || 0);
      // Check if user liked (requires user ID)
      if (session?.user?.id) {
        const hasLiked = review.review_likes?.some(
          (l) => (l.user_id || l.id) === session.user.id
        );
        setIsLiked(!!hasLiked);
      }
    }
  }, [review, session]);

  // Subscribe to Realtime Comments
  useEffect(() => {
    if (!review?.id) return;

    // Use the client-side Supabase client
    import("@/lib/supabase/client").then(({ createClient }) => {
      const supabase = createClient();
      const channel = supabase
        .channel(`comments-${review.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "comments",
            filter: `review_id=eq.${review.id}`,
          },
          async (payload) => {
            // Fetch the full comment with profile data
            const { data: newComment, error } = await supabase
              .from("comments")
              .select(
                `
                  id,
                  content,
                  created_at,
                  profiles (
                    name,
                    avatar_url
                  )
                `,
              )
              .eq("id", payload.new.id)
              .single();

            if (!error && newComment) {
              // Fetch full comment with profile to satisfy type
              const { data: fullComment } = await supabase
                .from("comments")
                .select("*, profiles(name, avatar_url)")
                .eq("id", newComment.id)
                .single();

              if (fullComment) {
                setReview((prev) => {
                  if (!prev) return null;
                  // Prevent duplicate if we just added it manually via form
                  if (
                    prev.review_comments?.some((c) => c.id === fullComment.id)
                  ) {
                    return prev;
                  }
                  return {
                    ...prev,
                    review_comments: [
                      fullComment,
                      ...(prev.review_comments || []),
                    ],
                  };
                });
              }
            }
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    });
  }, [review?.id]);

  const handleShare = async () => {
    const url = window.location.href;
    const title = review?.title || "Literaku Review";

    const { value: result } = await Swal.fire({
      title: t("share.title"),
      html: `
        <div class="flex flex-col gap-3">
          <a href="https://wa.me/?text=${encodeURIComponent(title + " " + url)}" target="_blank" class="flex items-center gap-3 p-3 rounded-lg bg-[#25D366]/10 text-[#25D366] font-bold hover:bg-[#25D366]/20 transition">
            <i class="fab fa-whatsapp text-xl"></i> WhatsApp
          </a>
          <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}" target="_blank" class="flex items-center gap-3 p-3 rounded-lg bg-[#1877F2]/10 text-[#1877F2] font-bold hover:bg-[#1877F2]/20 transition">
            <i class="fab fa-facebook text-xl"></i> Facebook
          </a>
          <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}" target="_blank" class="flex items-center gap-3 p-3 rounded-lg bg-black/5 text-black dark:text-white dark:bg-white/10 font-bold hover:bg-black/10 transition">
             X (Twitter)
          </a>
          <button id="copyLinkBtn" class="flex items-center gap-3 p-3 rounded-lg bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition text-left">
             ${t("share.copyLink")}
          </button>
        </div>
      `,
      showConfirmButton: false,
      showCloseButton: true,
      didOpen: () => {
        const btn = document.getElementById("copyLinkBtn");
        if (btn) {
          btn.addEventListener("click", () => {
            navigator.clipboard.writeText(url);
            Swal.fire({
              icon: "success",
              title: t("share.success"),
              timer: 1500,
              showConfirmButton: false,
            });
          });
        }
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
        cancelButtonText: t("auth.cancel"),
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/auth/login");
        }
      });
      return;
    }

    // Optimistic Update
    const prevIsLiked = isLiked;
    setIsLiked(!prevIsLiked);
    setLikeCount(prev => prevIsLiked ? prev - 1 : prev + 1);

    try {
      const response = await fetch(`/api/reviews/${params.slug}/like`, {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to like");
    } catch (error) {
      console.error("Error liking review:", error);
      // Revert on error
      setIsLiked(prevIsLiked);
      setLikeCount(prev => prevIsLiked ? prev + 1 : prev - 1);
    }
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;

    if (!session) {
      router.push("/auth/login");
      return;
    }

    try {
      const response = await fetch(`/api/reviews/${params.slug}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: commentText }),
      });

      if (!response.ok) {
        throw new Error("Gagal mengirim komentar");
      }

      const newComment = await response.json();

      setReview((prev) =>
        prev
          ? {
              ...prev,
              // Add to local_comments or review_comments depending on how you structure
              // Here we add to review_comments directly since it comes from DB
              review_comments: [newComment, ...(prev.review_comments || [])],
            }
          : null,
      );

      setCommentText("");

      Swal.fire({
        icon: "success",
        title: tc("success"), // Use common success
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan saat mengirim komentar.",
      });
    }
  };

  const fetchReview = async (slug: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/reviews/${slug}`);

      if (!response.ok) {
        throw new Error("Review tidak ditemukan");
      }

      const data = await response.json();
      setReview(data.review);
    } catch (err) {
      console.error("Error fetching review:", err);
      setError(tc("errorFetching"));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <ReviewDetailSkeleton />;
  }

  if (error || !review) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
          {error || "Review tidak ditemukan"}
        </h1>
        <Link
          href="/reviews"
          className="text-brand-600 hover:underline flex items-center gap-2"
        >
          <IoArrowBack /> {t("hero.backToList")}
        </Link>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      {/* Hero Header with Blur Background */}
      <div className="relative w-full min-h-[50vh] h-auto overflow-hidden pb-12 md:pb-0 bg-gray-900">
        {/* Blurred Background Image */}
        <div className="absolute inset-0 z-0">
          {review.book_cover_url && (
            <Image
              src={review.book_cover_url}
              alt={review.book_title}
              fill
              className="object-cover opacity-30 blur-xl scale-110"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-gray-950 via-transparent to-black/30" />
        </div>

        {/* Content Overlay - Now Relative */}
        <div className="relative z-10 flex items-center justify-center container-custom pt-24 pb-12 min-h-[50vh]">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8 w-full max-w-5xl">
            {/* Book Cover */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative w-48 h-72 md:w-64 md:h-96 flex-shrink-0 rounded-lg shadow-2xl overflow-hidden border-4 border-white dark:border-gray-800 transform md:translate-y-12"
            >
              {review.book_cover_url ? (
                <Image
                  src={review.book_cover_url}
                  alt={review.book_title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
                  <IoBook className="w-16 h-16 text-brand-500" />
                </div>
              )}
            </motion.div>

            {/* Title & Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center md:text-left text-white pb-8 md:pb-0 flex-1"
            >
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                {review.categories && (
                  <span className="px-3 py-1 bg-brand-500 text-white text-sm font-bold rounded-full shadow-lg">
                    {review.categories.name}
                  </span>
                )}
                <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full text-yellow-400">
                  <IoStar className="w-4 h-4" />
                  <span className="font-bold text-white">
                    {review.rating}/5
                  </span>
                </div>
              </div>

              <h1 className="text-3xl md:text-5xl font-black mb-2 leading-tight drop-shadow-lg">
                {review.title}
              </h1>
              <h2 className="text-xl text-gray-200 font-medium mb-6 drop-shadow-md">
                {t("hero.subtitle", {
                  title: review.book_title,
                  author: review.book_author,
                })}
              </h2>

              {/* Reviewer Info */}
              <div className="flex items-center justify-center md:justify-start gap-4">
                <div className="flex items-center gap-3 bg-white/90 dark:bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-gray-200 dark:border-white/20 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden relative border border-gray-100 dark:border-transparent">
                    {review.profiles.avatar_url ? (
                      <Image
                        src={review.profiles.avatar_url}
                        alt={review.profiles.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <IoPerson className="w-full h-full p-1 text-gray-400" />
                    )}
                  </div>
                  <div className="flex flex-col items-start justify-center">
                    <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-300 uppercase tracking-wider font-semibold">
                      {t("hero.reviewedBy")}
                    </p>
                    <p className="text-sm md:text-base font-bold text-gray-900 dark:text-white drop-shadow-none dark:drop-shadow-md">
                      {review.profiles?.name || "Anonymous"}
                    </p>
                  </div>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-4 bg-white/60 dark:bg-transparent px-3 py-1 rounded-full md:bg-transparent md:px-0">
                  <span className="flex items-center gap-1 font-medium">
                    <IoCalendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    {format(new Date(review.created_at), "d MMM yyyy", {
                      locale: currentLocale,
                    })}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom max-w-4xl pt-24 md:pt-20">
        <div className="grid md:grid-cols-[1fr_300px] gap-12">
          {/* Left Column: Review Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-8 md:p-10 mb-8 border border-gray-100 dark:border-gray-800 relative overflow-hidden">
              <div
                className={`prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-brand-600 ${
                  !session ? "max-h-[500px] overflow-hidden" : ""
                }`}
              >
                <ReactMarkdown>
                  {session
                    ? review.content
                    : review.content.split("\n").slice(0, 10).join("\n")}
                </ReactMarkdown>
              </div>

              {/* Login Wall UI */}
              {!session && (
                <div className="absolute inset-x-0 bottom-0 h-[300px] bg-gradient-to-t from-white dark:from-gray-900 via-white/90 dark:via-gray-900/90 to-transparent flex flex-col items-center justify-end pb-10 z-10">
                  <div className="text-center p-6 max-w-md">
                    <IoLockClosed className="w-12 h-12 text-brand-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {t("loginWall.title")}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      {t("loginWall.description")}
                    </p>
                    <button
                      onClick={() => router.push("/auth/login")}
                      className="px-8 py-3 bg-brand-600 text-white rounded-full font-bold text-lg hover:bg-brand-700 transition-all shadow-lg hover:shadow-brand-500/30 hover:-translate-y-1"
                    >
                      {t("loginWall.cta")}
                    </button>
                    <p className="mt-4 text-sm text-gray-500">
                      {t("loginWall.noAccount")}{" "}
                      <Link
                        href="/auth/register"
                        className="text-brand-600 hover:underline font-medium"
                      >
                        {t("loginWall.register")}
                      </Link>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Engagement Actions (Only show/enable if logged in or show limited) */}
            <div className="flex items-center justify-between p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-6">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 transition-colors group ${
                    isLiked ? "text-red-500" : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  <motion.div
                    whileTap={{ scale: 0.8 }}
                    animate={isLiked ? { scale: [1, 1.4, 1] } : {}}
                    className={`p-2 rounded-full transition-colors ${
                      isLiked
                        ? "bg-red-50 dark:bg-red-900/20"
                        : "bg-gray-100 dark:bg-gray-800 group-hover:bg-red-50 dark:group-hover:bg-red-900/20"
                    }`}
                  >
                    <IoHeart
                      className={`w-6 h-6 ${isLiked ? "fill-current" : ""}`}
                    />
                  </motion.div>
                  <span className="font-bold">
                    {likeCount} {t("engagement.likes")}
                  </span>
                </button>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <IoEye className="w-5 h-5" />
                  <span>
                    {review.views} {t("engagement.views")}
                  </span>
                </div>
              </div>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-semibold hover:underline"
              >
                <IoShareSocial className="w-5 h-5" />
                {t("engagement.share")}
              </button>
            </div>
          </motion.div>

          {/* Right Column: Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-8"
          >
            {/* Author Profile Card */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800 sticky top-24">
              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                {t("sidebar.aboutReviewer")}
              </h3>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden relative">
                  {review.profiles.avatar_url ? (
                    <Image
                      src={review.profiles.avatar_url}
                      alt={review.profiles.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <IoPerson className="w-full h-full p-3 text-gray-400" />
                  )}
                </div>
                <div>
                  <Link
                    href={`/profile/${review.profiles.name}`}
                    className="text-lg font-bold text-gray-900 dark:text-white hover:text-brand-600 hover:underline"
                  >
                    {review.profiles.name}
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t("sidebar.joined")} 2024
                  </p>
                </div>
              </div>
              {review.profiles.bio && (
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed">
                  {review.profiles.bio}
                </p>
              )}
              <button className="w-full py-2 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-bold rounded-lg hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors">
                {t("sidebar.viewProfile")}
              </button>
            </div>
          </motion.aside>
        </div>

        {/* Full Width Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-8 md:p-12 border border-gray-100 dark:border-gray-800">
            <h3 className="text-3xl font-bold mb-10 flex items-center gap-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-6">
              <IoChatbubble className="text-brand-500" />
              {t("comments.title")}{" "}
              <span className="text-lg font-normal text-gray-500">
                (
                {(review?.review_comments?.length || 0) +
                  (review?.local_comments?.length || 0)}
                )
              </span>
            </h3>

            <div className="space-y-8 mb-12">
              {/* Combine Mock comments + Local Comments */}
              {[
                ...(review?.review_comments || []),
                ...(review?.local_comments || []),
              ].length > 0 ? (
                [
                  ...(review?.review_comments || []),
                  ...(review?.local_comments || []),
                ].map((comment: any) => (
                  <div
                    key={comment.id}
                    className="flex gap-6 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800"
                  >
                    <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gray-200 overflow-hidden relative border-2 border-white dark:border-gray-700 shadow-sm">
                      {comment.profiles.avatar_url ? (
                        <Image
                          src={comment.profiles.avatar_url}
                          alt={comment.profiles.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <IoPerson className="w-full h-full p-3 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                        <span className="font-bold text-gray-900 dark:text-white text-lg">
                          {comment.profiles.name}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full font-medium">
                          {format(new Date(comment.created_at), "d MMMM yyyy", {
                            locale: currentLocale,
                          })}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                  <p className="text-gray-500 italic text-lg">
                    {t("comments.empty")}
                  </p>
                </div>
              )}
            </div>

            {/* Comment Form */}
            <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
              {session ? (
                <div className="flex gap-6 items-start">
                  <div className="hidden md:block w-14 h-14 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex-shrink-0 shadow-lg" />
                  <div className="flex-1 space-y-4">
                    <label className="font-bold text-xl text-gray-800 dark:text-white block">
                      {t("comments.form.title")}
                    </label>
                    <div className="relative">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={t("comments.form.placeholder")}
                        className="w-full p-5 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-950 focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all resize-none min-h-[150px] shadow-inner text-gray-900 dark:text-white text-lg placeholder:text-gray-400"
                      />
                      <div className="absolute bottom-4 right-4 text-xs text-gray-400 pointer-events-none">
                        {t("comments.form.markdown")}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={handleCommentSubmit}
                        disabled={!commentText.trim()}
                        className="flex items-center gap-2 px-8 py-3 bg-brand-600 text-white rounded-xl font-bold text-lg hover:bg-brand-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-brand-500/30 disabled:opacity-70 disabled:hover:scale-100"
                      >
                        <IoSend className="w-5 h-5" />{" "}
                        {t("comments.form.submit")}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl p-10 text-center shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 to-purple-500" />
                  <IoLockClosed className="w-12 h-12 mx-auto mb-4 text-gray-400 group-hover:text-white transition-colors" />
                  <h4 className="text-2xl font-bold mb-3">
                    {t("comments.guest.title")}
                  </h4>
                  <p className="text-gray-300 mb-8 max-w-lg mx-auto text-lg">
                    {t("comments.guest.description")}
                  </p>
                  <button
                    onClick={() => router.push("/login")}
                    className="px-8 py-3 bg-white text-gray-900 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
                  >
                    {t("comments.guest.cta")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </article>
  );
}

function ReviewDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="w-full h-[50vh] bg-gray-200 dark:bg-gray-900 animate-pulse" />
      <div className="container-custom max-w-4xl -mt-32 relative z-10">
        <div className="grid md:grid-cols-[1fr_300px] gap-12">
          <div className="space-y-8">
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-96 w-full rounded-2xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

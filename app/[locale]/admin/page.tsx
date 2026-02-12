"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";
import {
  IoBook,
  IoPeople,
  IoChatbubbles,
  IoEye,
  IoHeart,
  IoCloudUpload,
  IoLibrary,
  IoTime,
} from "react-icons/io5";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default function AdminDashboard() {
  const t = useTranslations("admin");
  const [stats, setStats] = useState({
    books: 0,
    users: 0,
    reviews: 0,
    categories: 0,
  });
  const [recentBooks, setRecentBooks] = useState<any[]>([]);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      try {
        const [
          { count: booksCount },
          { count: usersCount },
          { count: reviewsCount },
          { count: categoriesCount },
          { data: latestBooks },
          { data: latestReviews },
        ] = await Promise.all([
          supabase.from("books").select("*", { count: "exact", head: true }),
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase
            .from("book_reviews")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("categories")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("books")
            .select("id, title, author, created_at")
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("book_reviews")
            .select("id, title, rating, created_at, profiles(full_name)")
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

        setStats({
          books: booksCount || 0,
          users: usersCount || 0,
          reviews: reviewsCount || 0,
          categories: categoriesCount || 0,
        });
        setRecentBooks(latestBooks || []);
        setRecentReviews(latestReviews || []);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const statCards = [
    {
      title: t("totalBooks"),
      value: stats.books,
      icon: IoLibrary,
      color: "bg-blue-500",
      href: "/admin/books",
    },
    {
      title: t("totalUsers"),
      value: stats.users,
      icon: IoPeople,
      color: "bg-green-500",
      href: "/admin/users",
    },
    {
      title: t("totalReviews"),
      value: stats.reviews,
      icon: IoChatbubbles,
      color: "bg-purple-500",
      href: "/admin/reviews",
    },
    {
      title: t("totalCategories"),
      value: stats.categories,
      icon: IoBook,
      color: "bg-orange-500",
      href: "/admin/categories",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {t("overview")}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Link
            href={stat.href}
            key={index}
            className="block transition-transform transform hover:-translate-y-1"
          >
            <Card className="overflow-hidden border-none shadow-md">
              <div className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    {stat.title}
                  </p>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </h3>
                </div>
                <div
                  className={`p-3 rounded-full ${stat.color} bg-opacity-10 dark:bg-opacity-20`}
                >
                  <stat.icon
                    className={`w-8 h-8 ${stat.color.replace("bg-", "text-")}`}
                  />
                </div>
              </div>
              <div className={`h-1 w-full ${stat.color}`}></div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Books */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <IoLibrary className="text-blue-500" /> {t("recentBooks")}
            </h2>
            <Link
              href="/admin/books"
              className="text-sm text-brand-600 hover:underline"
            >
              Lihat Semua
            </Link>
          </div>
          <div className="space-y-4">
            {recentBooks.map((book) => (
              <div
                key={book.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {book.title}
                  </p>
                  <p className="text-xs text-gray-500">{book.author}</p>
                </div>
                <div className="text-right text-xs text-gray-400 flex items-center gap-1">
                  <IoTime /> {new Date(book.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Reviews */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <IoChatbubbles className="text-purple-500" /> {t("recentReviews")}
            </h2>
            <Link
              href="/admin/reviews"
              className="text-sm text-brand-600 hover:underline"
            >
              Lihat Semua
            </Link>
          </div>
          <div className="space-y-4">
            {recentReviews.map((review) => (
              <div
                key={review.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {review.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    oleh {review.profiles?.full_name || "User"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex text-yellow-400 text-xs">
                    {[...Array(review.rating)].map((_, i) => (
                      <IoHeart key={i} />
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {t("quickActions")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Link href="/admin/upload">
              <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-center transition-colors h-full">
                <IoCloudUpload className="w-8 h-8 mx-auto text-brand-500 mb-2" />
                <span className="text-xs font-medium">{t("uploadBook")}</span>
              </div>
            </Link>
            <Link href="/admin/books">
              <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-center transition-colors h-full">
                <IoLibrary className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <span className="text-xs font-medium">{t("manageBooks")}</span>
              </div>
            </Link>
            <Link href="/admin/users">
              <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-center transition-colors h-full">
                <IoPeople className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <span className="text-xs font-medium">{t("manageUsers")}</span>
              </div>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

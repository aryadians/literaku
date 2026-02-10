"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { IoLibrary, IoPeople, IoChatbubbles, IoBook } from "react-icons/io5";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    books: 0,
    users: 0,
    reviews: 0,
    categories: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [
          { count: booksCount },
          { count: usersCount },
          { count: reviewsCount },
          { count: categoriesCount },
        ] = await Promise.all([
          supabase.from("books").select("*", { count: "exact", head: true }),
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase
            .from("book_reviews")
            .select("*", { count: "exact", head: true }),
          supabase
            .from("categories")
            .select("*", { count: "exact", head: true }),
        ]);

        setStats({
          books: booksCount || 0,
          users: usersCount || 0,
          reviews: reviewsCount || 0,
          categories: categoriesCount || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Buku",
      value: stats.books,
      icon: IoLibrary,
      color: "bg-blue-500",
      href: "/admin/books",
    },
    {
      title: "Pengguna",
      value: stats.users,
      icon: IoPeople,
      color: "bg-green-500",
      href: "/admin/users",
    },
    {
      title: "Ulasan",
      value: stats.reviews,
      icon: IoChatbubbles,
      color: "bg-purple-500",
      href: "/admin/reviews",
    },
    {
      title: "Kategori",
      value: stats.categories,
      icon: IoBook, // Or any other icon
      color: "bg-orange-500",
      href: "/admin/upload", // Maybe link to category management if it existed
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Dashboard Overview
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Recent Activity or Quick Actions could go here */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/admin/upload">
              <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-center transition-colors">
                <IoCloudUpload className="w-8 h-8 mx-auto text-brand-500 mb-2" />
                <span className="text-sm font-medium">Upload Buku</span>
              </div>
            </Link>
            {/* Add more quick actions if needed */}
          </div>
        </Card>
      </div>
    </div>
  );
}

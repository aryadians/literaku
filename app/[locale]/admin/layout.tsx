"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { createClient } from "@/lib/supabase/client";
import {
  IoLibrary,
  IoPeople,
  IoChatbubbles,
  IoCloudUpload,
  IoStatsChart,
  IoLogOut,
  IoMenu,
  IoClose,
} from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Check Admin Status
  useEffect(() => {
    async function checkRole() {
      const supabase = createClient();
      if (status === "loading") return;

      if (!session?.user) {
        router.push("/");
        return;
      }

      // 1. Check if session has role (if customized)
      // 2. Fetch from DB
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("email", session.user.email)
        .single();

      if (profile?.role === "admin") {
        setIsAdmin(true);
      } else {
        router.push("/");
      }
      setIsLoading(false);
    }

    checkRole();
  }, [session, status, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const menuItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: IoStatsChart,
    },
    {
      name: "Books",
      href: "/admin/books",
      icon: IoLibrary,
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: IoPeople,
    },
    {
      name: "Reviews",
      href: "/admin/reviews",
      icon: IoChatbubbles,
    },
    {
      name: "Upload",
      href: "/admin/upload",
      icon: IoCloudUpload,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black z-20 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isSidebarOpen ? 0 : -280 }} // Toggle for mobile, maybe persistent for desktop?
        // Actually, let's make it responsive:
        // Desktop: Always visible (or togglable if we want), Mobile: Hidden by default
        // For simplicity: Mobile toggle, Desktop always visible.
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-xl text-brand-600 dark:text-brand-400"
            >
              <IoLibrary className="w-6 h-6" />
              <span>
                Literaku
                <span className="text-xs ml-1 px-1.5 py-0.5 rounded bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  Admin
                </span>
              </span>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <IoClose size={24} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-medium"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="h-8 w-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold">
                {session?.user?.name?.[0] || "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {session?.user?.name || "Admin"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {session?.user?.email}
                </p>
              </div>
            </div>
            <div className="mt-2 flex justify-between items-center px-4">
              <DarkModeToggle />
              <button
                onClick={() => router.push("/")}
                className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1"
              >
                <IoLogOut /> Exit
              </button>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md"
          >
            <IoMenu size={24} />
          </button>
          <span className="font-semibold text-gray-900 dark:text-white">
            Admin Dashboard
          </span>
          <div className="w-8"></div> {/* Spacer */}
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

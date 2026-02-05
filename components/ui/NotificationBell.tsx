"use client";

import { useState, useEffect, useRef } from "react";
import { IoNotifications, IoNotificationsOutline } from "react-icons/io5";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

interface Notification {
  id: string;
  type: string;
  message: string;
  reference_slug: string;
  is_read: boolean;
  created_at: string;
  actor_id: string;
}

export function NotificationBell() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Fetch & Subscribe
  useEffect(() => {
    if (!session?.user) return;

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", session.user.id) // Assuming session.user.id matches DB uuid
        .order("created_at", { ascending: false })
        .limit(10);

      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.is_read).length);
      }
    };

    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel("notifications-box")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${session.user.id}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => prev + 1);

          // Play subtle sound
          const audio = new Audio("/notification.mp3"); // Ensure this file exists or remove
          audio.play().catch(() => {});
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  // Mark as read when opening
  const handleToggle = async () => {
    setIsOpen(!isOpen);

    if (!isOpen && unreadCount > 0) {
      // Optimistic update
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

      // Async update DB
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", session?.user.id)
        .eq("is_read", false);
    }
  };

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
      >
        {unreadCount > 0 ? (
          <IoNotifications className="w-6 h-6 text-brand-500" />
        ) : (
          <IoNotificationsOutline className="w-6 h-6" />
        )}

        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <h3 className="font-bold text-gray-900 dark:text-white">
                Notifikasi
              </h3>
              <span className="text-xs text-gray-500">Terbaru</span>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="text-sm">Belum ada notifikasi.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <Link
                    key={notif.id}
                    href={`/reviews/${notif.reference_slug}`}
                    onClick={() => setIsOpen(false)}
                    className={`block p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                      !notif.is_read
                        ? "bg-brand-50/30 dark:bg-brand-900/10"
                        : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0 text-brand-600 dark:text-brand-400">
                        <IoNotifications className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(notif.created_at), {
                            addSuffix: true,
                            locale: idLocale,
                          })}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            <div className="p-2 border-t border-gray-100 dark:border-gray-800 text-center">
              <button className="text-xs font-bold text-brand-600 hover:text-brand-700 w-full py-2">
                Lihat Semua
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

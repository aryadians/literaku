"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import { NotificationBell } from "@/components/ui/NotificationBell";
import {
  IoMenu,
  IoClose,
  IoPerson,
  IoLogOut,
  IoGrid,
  IoCreate,
  IoBrush,
  IoChevronDown,
  IoSearch,
} from "react-icons/io5";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/library", label: t("nav.library") },
    { href: "/reviews", label: t("nav.reviews") },
    { href: "/categories", label: t("nav.categories") },
    { href: "/canvas", label: t("nav.canvas") },
    { href: "/about", label: t("nav.about") },
  ];

  const isActive = (href: string) => {
    if (href === "/")
      return pathname === "/" || pathname === "/id" || pathname === "/en";
    return pathname.includes(href);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b",
        scrolled 
          ? "bg-white/80 dark:bg-gray-950/80 backdrop-blur-2xl border-gray-200 dark:border-gray-800 shadow-glow-sm py-2" 
          : "bg-transparent border-transparent py-4"
      )}
    >
      <nav className="container-custom">
        <div className="flex items-center justify-between gap-4 h-14 sm:h-16 relative">
          {/* Left: Logo */}
          <Link
            href="/"
            prefetch={true}
            className="flex items-center gap-3 group shrink-0 relative z-10"
          >
            <motion.div
              className="relative w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-all overflow-hidden"
              whileHover={{ rotate: [0, -10, 10, 0], scale: 1.05 }}
            >
              <Image
                src="/icon.svg"
                alt="Literaku"
                fill
                className="object-contain p-2 brightness-0 invert"
              />
            </motion.div>
            <div className="flex flex-col justify-center">
              <span className="text-xl font-black tracking-tighter text-gray-900 dark:text-white leading-none">
                {t("common.appName")}
              </span>
              <span className="text-[7px] font-black uppercase tracking-[0.25em] text-brand-500 mt-1 opacity-80 group-hover:translate-x-0.5 transition-transform">
                Perpustakaan Digital
              </span>
            </div>
          </Link>

          {/* Center: Desktop Navigation - Properly responsive and centered */}
          <div className="hidden lg:flex items-center justify-center flex-1 pointer-events-none">
            <div className="flex items-center gap-1 bg-gray-100/80 dark:bg-white/5 p-1 rounded-2xl border border-gray-200/50 dark:border-white/5 backdrop-blur-md pointer-events-auto">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={true}
                    className={cn(
                      "px-3 xl:px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl relative whitespace-nowrap",
                      active
                        ? "text-white bg-brand-600 shadow-md shadow-brand-500/20"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Section: Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 relative z-10">
            {/* Search Pill - Only visible on XL */}
            <div className="hidden xl:block">
              <div className="relative group flex items-center h-10">
                <IoSearch className="absolute left-3.5 text-gray-400 w-4 h-4 z-10 group-focus-within:text-brand-500 transition-colors" />
                <input
                  type="text"
                  placeholder={t("common.searchPlaceholder")}
                  className="w-32 focus:w-48 transition-all duration-500 pl-10 pr-4 h-full text-xs font-bold bg-gray-100 dark:bg-gray-800 border-none rounded-xl outline-none focus:ring-2 ring-brand-500/20 dark:text-white"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const target = e.target as HTMLInputElement;
                      if (target.value.trim()) {
                        router.push(`/reviews?search=${encodeURIComponent(target.value)}`);
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Language/Theme Icons */}
            <div className="flex items-center bg-gray-100/80 dark:bg-white/5 p-1 rounded-xl h-10 border border-gray-200/50 dark:border-white/5">
              <LanguageSwitcher />
              <div className="w-px h-4 bg-gray-300 dark:bg-gray-700 mx-0.5" />
              <DarkModeToggle />
            </div>

            {session && <NotificationBell />}

            {/* User Menu */}
            <div className="hidden md:flex items-center h-10">
              {session ? (
                <div className="relative h-full">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={cn(
                      "flex items-center gap-2 h-full pl-1.5 pr-2.5 rounded-xl transition-all border",
                      isUserMenuOpen 
                        ? "bg-white dark:bg-gray-900 border-brand-500 shadow-glow-sm" 
                        : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-brand-500/50"
                    )}
                  >
                    <div className="w-7 h-7 rounded-lg bg-brand-50 overflow-hidden relative border border-brand-100 shrink-0">
                      {session.user?.image ? (
                        <Image src={session.user.image} alt="User" fill className="object-cover" />
                      ) : (
                        <IoPerson className="w-full h-full p-1.5 text-brand-500" />
                      )}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-700 dark:text-gray-200 truncate max-w-[80px]">
                      {session.user?.name?.split(' ')[0]}
                    </span>
                    <IoChevronDown className={cn("w-3 h-3 transition-transform text-gray-400", isUserMenuOpen && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-3 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-3xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50 p-2"
                      >
                        <div className="p-4 bg-brand-50 dark:bg-brand-900/20 rounded-xl mb-2">
                          <p className="text-sm font-black text-gray-900 dark:text-white truncate">{session.user?.name}</p>
                          <p className="text-[9px] font-black text-brand-600 uppercase tracking-[0.2em] mt-1">
                            {session.user?.role || "Pembaca"}
                          </p>
                        </div>
                        <div className="space-y-0.5">
                          {[
                            { href: "/profile", icon: IoPerson, label: t("nav.profile") },
                            { href: "/dashboard", icon: IoGrid, label: t("nav.dashboard") },
                            { href: "/reviews/create", icon: IoCreate, label: t("nav.writeReview") },
                            { href: "/canvas", icon: IoBrush, label: t("nav.canvas") },
                          ].map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                              <item.icon size={16} className="text-brand-500" /> {item.label}
                            </Link>
                          ))}
                          <div className="h-px bg-gray-100 dark:bg-gray-800 my-1 mx-2" />
                          <button
                            onClick={() => signOut()}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <IoLogOut size={16} /> {t("nav.logout")}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2 h-full">
                  <Link href="/auth/login" className="h-full">
                    <Button variant="ghost" className="h-full rounded-xl px-4 text-[10px] font-black uppercase tracking-widest">Login</Button>
                  </Link>
                  <Link href="/auth/register" className="h-full">
                    <Button variant="primary" className="h-full rounded-xl px-4 text-[10px] font-black uppercase tracking-widest shadow-glow-sm">Daftar</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 h-10 w-10 flex items-center justify-center transition-all active:scale-90"
            >
              {isMenuOpen ? <IoClose size={22} /> : <IoMenu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Content */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="lg:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl mt-4 border border-gray-100 dark:border-gray-800 shadow-3xl overflow-hidden"
            >
              <div className="p-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "block px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all",
                      isActive(link.href)
                        ? "bg-brand-600 text-white shadow-lg shadow-brand-500/20"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                {!session && (
                  <div className="grid grid-cols-2 gap-3 pt-6 border-t border-gray-100 dark:border-gray-800 mt-4 px-2 pb-2">
                    <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full rounded-2xl py-4 text-[10px] font-black uppercase tracking-widest">Login</Button>
                    </Link>
                    <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="primary" className="w-full rounded-2xl py-4 text-[10px] font-black uppercase tracking-widest shadow-glow-sm">Daftar</Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}

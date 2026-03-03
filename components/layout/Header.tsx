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
  IoSparkles,
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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        scrolled 
          ? "bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-gray-200 dark:border-gray-800 shadow-glow-sm py-2" 
          : "bg-transparent border-transparent py-4"
      )}
    >
      <nav className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            prefetch={true}
            className="flex items-center gap-3 group relative"
          >
            <motion.div
              className="relative w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-all"
              whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
            >
              <Image
                src="/icon.svg"
                alt="Literaku"
                fill
                className="object-contain p-1.5 brightness-0 invert"
              />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-gray-900 dark:text-white group-hover:text-brand-600 transition-colors">
                {t("common.appName")}
              </span>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-500 -mt-1 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">
                Platform Literasi
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 bg-gray-100/50 dark:bg-white/5 p-1 rounded-2xl border border-gray-200/50 dark:border-white/5 backdrop-blur-md">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                  className={cn(
                    "px-4 py-2 text-xs font-black uppercase tracking-widest transition-all rounded-xl relative",
                    active
                      ? "text-white bg-brand-600 shadow-md shadow-brand-500/20"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-800"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search - Desktop Refined */}
            <div className="hidden xl:relative xl:group xl:block">
              <input
                type="text"
                placeholder={t("common.searchPlaceholder")}
                className="w-40 focus:w-64 transition-all duration-500 pl-10 pr-4 py-2 text-xs font-bold bg-gray-100 dark:bg-gray-800 border-none rounded-xl outline-none focus:ring-2 ring-brand-500/20 dark:text-white"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const target = e.target as HTMLInputElement;
                    if (target.value.trim()) {
                      router.push(`/reviews?search=${encodeURIComponent(target.value)}`);
                    }
                  }
                }}
              />
              <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            <div className="flex items-center bg-gray-100/50 dark:bg-white/5 p-1 rounded-xl gap-1">
              <LanguageSwitcher />
              <DarkModeToggle />
            </div>

            {session && <NotificationBell />}

            {/* User Menu */}
            <div className="hidden md:block relative">
              {session ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 hover:border-brand-500 transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-brand-50 overflow-hidden relative border border-brand-100">
                      {session.user?.image ? (
                        <Image src={session.user.image} alt="User" fill className="object-cover" />
                      ) : (
                        <IoPerson className="w-full h-full p-1.5 text-brand-500" />
                      )}
                    </div>
                    <IoChevronDown className={cn("w-3 h-3 transition-transform text-gray-400 mr-1", isUserMenuOpen && "rotate-180")} />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-3 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50 p-2"
                      >
                        <div className="p-4 bg-brand-50 dark:bg-brand-900/20 rounded-xl mb-2">
                          <p className="text-sm font-black text-gray-900 dark:text-white truncate">{session.user?.name}</p>
                          <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest">
                            {session.user?.role || "Pembaca"}
                          </p>
                        </div>
                        
                        <div className="space-y-1">
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
                <div className="flex items-center gap-2">
                  <Link href="/auth/login">
                    <Button variant="ghost" size="sm" className="rounded-xl font-bold">Login</Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button variant="primary" size="sm" className="rounded-xl font-bold shadow-glow-sm">Daftar</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
            >
              {isMenuOpen ? <IoClose size={24} /> : <IoMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Refined */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white dark:bg-gray-900 rounded-2xl mt-2 border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden"
            >
              <div className="p-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "block px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-colors",
                      isActive(link.href)
                        ? "bg-brand-600 text-white"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                
                {!session && (
                  <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-100 dark:border-gray-800 mt-4">
                    <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full rounded-xl">Login</Button>
                    </Link>
                    <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="primary" size="sm" className="w-full rounded-xl">Daftar</Button>
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

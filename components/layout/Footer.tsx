"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  IoBook,
  IoLogoGithub,
  IoLogoTwitter,
  IoLogoInstagram,
  IoHeart,
  IoSparkles,
} from "react-icons/io5";
import { motion } from "framer-motion";

export function Footer() {
  const t = useTranslations();
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/library", label: t("nav.library") },
    { href: "/reviews", label: t("nav.reviews") },
    { href: "/categories", label: t("nav.categories") },
    { href: "/about", label: t("nav.about") },
  ];

  const socialLinks = [
    { icon: IoLogoGithub, href: "#", label: "GitHub" },
    { icon: IoLogoTwitter, href: "#", label: "Twitter" },
    { icon: IoLogoInstagram, href: "#", label: "Instagram" },
  ];

  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900 mt-32 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-20" />
      
      <div className="container-custom py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8">
          {/* Brand Column */}
          <div className="md:col-span-5">
            <Link href="/" className="flex items-center gap-3 mb-8 group">
              <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:rotate-12 transition-transform duration-500">
                <IoBook className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-black tracking-tighter text-gray-900 dark:text-white uppercase italic">
                {t("common.appName")}
              </span>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-10 max-w-sm leading-relaxed">
              {t("footer.tagline")} <br />
              <span className="text-brand-600 dark:text-brand-400 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 mt-4">
                <IoSparkles /> Jejak Literasi, Catatan Bacaan
              </span>
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    whileHover={{ y: -5, scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-brand-600 hover:text-white dark:hover:bg-brand-600 transition-all shadow-sm"
                    aria-label={social.label}
                  >
                    <Icon size={22} />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.2em] mb-10">
              {t("footer.quickLinks")}
            </h3>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-all font-bold text-sm flex items-center gap-2 group"
                  >
                    <div className="w-1 h-1 rounded-full bg-brand-500 opacity-0 group-hover:opacity-100 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / Contact */}
          <div className="md:col-span-4">
            <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.2em] mb-10">
              Berlangganan Newsletter
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-6">
              Dapatkan rekomendasi buku terbaik langsung di email Anda.
            </p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email Anda" 
                className="flex-1 px-5 py-3.5 rounded-2xl bg-gray-100 dark:bg-gray-900 border-none focus:ring-2 ring-brand-500/20 outline-none text-sm font-bold dark:text-white"
              />
              <button className="px-6 py-3.5 bg-gray-900 dark:bg-brand-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-lg">
                Ikuti
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-10 border-t border-gray-100 dark:border-gray-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            © {currentYear} {t("common.appName")} Studio. {t("footer.allRightsReserved")}.
          </p>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
            Dibuat dengan <IoHeart className="text-red-500 animate-pulse" /> untuk Komunitas Literasi
          </div>
        </div>
      </div>
    </footer>
  );
}

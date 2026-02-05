"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  IoBook,
  IoLogoGithub,
  IoLogoTwitter,
  IoLogoInstagram,
} from "react-icons/io5";

export function Footer() {
  const t = useTranslations();
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { href: "/", label: t("nav.home") },
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
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <IoBook className="w-8 h-8 text-brand-500" />
              <span className="text-xl font-bold gradient-text">
                {t("common.appName")}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {t("footer.tagline")}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              © {currentYear} {t("common.appName")}.{" "}
              {t("footer.allRightsReserved")}.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t("footer.quickLinks")}
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t("footer.followUs")}
            </h3>
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-brand-500 hover:text-white dark:hover:bg-brand-500 transition-all duration-300"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

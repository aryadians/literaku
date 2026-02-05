import createMiddleware from "next-intl/middleware";
// Middleware for handling i18n routing
import { locales, defaultLocale } from "./i18n";

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
});

export const config = {
  // Match all pathnames except for:
  // - API routes
  // - _next (Next.js internals)
  // - Static files
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

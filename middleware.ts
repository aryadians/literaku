import createMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";

const locales = ["id", "en"];
const defaultLocale = "id";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
});

export default function middleware(request: NextRequest) {
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for:
  // - API routes
  // - _next (Next.js internals)
  // - Static files
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};

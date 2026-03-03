import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Using require for next-pwa as it doesn't always export types perfectly for ESM
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const withNextIntl = createNextIntlPlugin("./i18n.ts");

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["next-intl"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "m.media-amazon.com", // For Mock Data
      },
      {
        protocol: "https",
        hostname: "placehold.co", // For placeholders
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default withPWA(withNextIntl(nextConfig));

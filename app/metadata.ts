import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Literaku - Jejak Literasi, Catatan Bacaan",
  description:
    "Platform berbagi review dan catatan bacaan untuk para pecinta buku. Temukan rekomendasi, bagikan pengalaman, dan jelajahi dunia literasi bersama.",
  keywords: [
    "review buku",
    "literasi",
    "book review",
    "catatan bacaan",
    "rekomendasi buku",
    "komunitas baca",
  ],
  authors: [{ name: "Literaku Team" }],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/logo.png", sizes: "512x512", type: "image/png" },
  },
  openGraph: {
    title: "Literaku - Jejak Literasi, Catatan Bacaan",
    description:
      "Platform berbagi review dan catatan bacaan untuk para pecinta buku",
    type: "website",
    locale: "id_ID",
    siteName: "Literaku",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Literaku Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Literaku - Jejak Literasi, Catatan Bacaan",
    description:
      "Platform berbagi review dan catatan bacaan untuk para pecinta buku",
    images: ["/logo.png"],
  },
};

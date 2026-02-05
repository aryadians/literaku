import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { inter, merriweather } from "@/lib/fonts";
import "../globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { notFound } from "next/navigation";
import { locales } from "@/i18n";
import { TopLoadingBar } from "@/components/ui/TopLoadingBar";

export const metadata: Metadata = {
  title: "Literaku - Jejak Literasi, Catatan Bacaan",
  description:
    "Platform berbagi review dan catatan bacaan untuk para pecinta buku",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${merriweather.variable} scroll-smooth`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-gradient-warm dark:bg-gray-950">
        <ThemeProvider>
          <AuthProvider>
            <NextIntlClientProvider messages={messages} locale={locale}>
              <TopLoadingBar />
              <Header />
              <main className="min-h-[calc(100vh-4rem)]">{children}</main>
              <Footer />
            </NextIntlClientProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

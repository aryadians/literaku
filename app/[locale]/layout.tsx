import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { inter, merriweather } from "@/lib/fonts";
import "../globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { notFound } from "next/navigation";
import { locales } from "@/i18n";

export const metadata: Metadata = {
  title: "Literaku - Jejak Literasi, Catatan Bacaan",
  description:
    "Platform berbagi review dan catatan bacaan untuk para pecinta buku",
};

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${merriweather.variable}`}
    >
      <body className="min-h-screen bg-gradient-warm dark:bg-gray-950">
        <AuthProvider>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <Header />
            <main className="min-h-[calc(100vh-4rem)]">{children}</main>
            <Footer />
          </NextIntlClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

import { getRequestConfig } from "next-intl/server";

// Locale configuration for next-intl
export const locales = ["id", "en"] as const;
export const defaultLocale = "id";
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !locales.includes(locale as any)) {
    locale = defaultLocale;
  }

  return {
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});

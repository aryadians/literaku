import { getRequestConfig } from "next-intl/server";
import { defaultLocale, locales } from "../i18n";

export default getRequestConfig(async ({ locale }) => {
  // Fallback to default locale if undefined
  const validLocale =
    locale && locales.includes(locale as any) ? locale : defaultLocale;

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default,
  };
});

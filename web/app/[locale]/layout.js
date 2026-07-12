import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/lib/i18n/routing";
import PublicHeader from "@/components/PublicHeader";
import Footer from "@/components/Footer";
import { getSiteSettings, getHotlines } from "@/lib/queries/public";
import { buildPageMetadata, dealerTitle, resolveOgImageUrl } from "@/lib/seo";
import FloatingContact from "@/components/FloatingContact";
import "@/styles/globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/** @param {{ params: Promise<{ locale: string }> }} props */
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const settings = await getSiteSettings();
  const ogImageUrl = await resolveOgImageUrl(locale, settings?.seoDefaults, null);
  const meta = buildPageMetadata(locale, "/", null, settings?.seoDefaults, ogImageUrl);
  const dealer = dealerTitle(settings?.dealerName, locale);
  return {
    ...meta,
    title: meta.title === "Car Retail" ? dealer : meta.title,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    ...(settings?.faviconMedia?.publicUrl
      ? { icons: { icon: settings.faviconMedia.publicUrl } }
      : {}),
  };
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;

  if (!routing.locales.includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const [messages, settings, hotlines] = await Promise.all([
    getMessages(),
    getSiteSettings(),
    getHotlines(),
  ]);

  const primaryPhone = hotlines[0]?.phone ?? "";
  const testDriveRoute = settings?.ctaTestDrive?.routeKey ?? "/book-test-drive";

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <PublicHeader locale={locale} />
          <main>{children}</main>
          <Footer locale={locale} />
          <FloatingContact
            locale={locale}
            primaryPhone={primaryPhone}
            testDriveRoute={testDriveRoute}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

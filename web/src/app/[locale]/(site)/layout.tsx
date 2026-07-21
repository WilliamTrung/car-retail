import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SlugAlternatesProvider } from "@/components/ui/SlugAlternates";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { FloatingContactCluster } from "@/components/layout/FloatingContactCluster";
import { MobileActionBar } from "@/components/layout/MobileActionBar";
import { routing } from "@/lib/i18n/routing";
import {
  getHotlines,
  getMenuItems,
  getShowrooms,
  getSiteSettings,
} from "@/lib/queries/public";
import {
  toSiteChromeVM,
  resolveLocalized,
  type Locale,
} from "@/lib/view-models";
import { buildPageMetadata, dealerTitle, resolveOgImageUrl } from "@/lib/seo";
import { getSiteUrl } from "@/lib/seo";
import "@/styles/globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-sans",
});

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const settings = await getSiteSettings();
  const ogImageUrl = await resolveOgImageUrl(locale, settings?.seoDefaults, null);
  const meta = buildPageMetadata(locale, "/", null, settings?.seoDefaults, ogImageUrl);
  const dealer = dealerTitle(settings?.dealerName, locale);
  return {
    ...meta,
    title: meta.title === "Car Retail" ? dealer : meta.title,
    metadataBase: new URL(getSiteUrl()),
    ...(settings?.faviconMedia?.publicUrl
      ? { icons: { icon: settings.faviconMedia.publicUrl } }
      : {}),
  };
}

function chromeDescription(
  settings: Awaited<ReturnType<typeof getSiteSettings>>,
  locale: Locale,
): string {
  if (!settings) return "";
  const story = settings.brandStory?.[locale]?.body;
  if (story) return story;
  return resolveLocalized(settings.disclaimers, locale);
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale: localeParam } = await params;
  if (!hasLocale(routing.locales, localeParam)) {
    notFound();
  }
  const locale = localeParam as Locale;

  setRequestLocale(locale);
  const [messages, settings, hotlines, showrooms, headerMenu, footerMenu] =
    await Promise.all([
      getMessages(),
      getSiteSettings(),
      getHotlines(),
      getShowrooms(),
      getMenuItems("HEADER"),
      getMenuItems("FOOTER"),
    ]);

  const primaryShowroom = showrooms[0];
  const hqAddress = primaryShowroom
    ? resolveLocalized(primaryShowroom.address, locale)
    : "";
  const workingHours = primaryShowroom
    ? resolveLocalized(primaryShowroom.hours, locale)
    : "";

  const chrome = toSiteChromeVM(
    settings,
    hotlines,
    showrooms,
    { header: headerMenu, footer: footerMenu },
    locale,
    { hqAddress, workingHours },
  );
  const description = chromeDescription(settings, locale);

  return (
    <html lang={locale} className={beVietnamPro.variable}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <SlugAlternatesProvider>
            <SiteHeader chrome={chrome} />
            <main>{children}</main>
          </SlugAlternatesProvider>
          <SiteFooter chrome={chrome} description={description} />
          <FloatingContactCluster
            hotline={chrome.hotline}
            zaloUrl={chrome.zaloUrl}
          />
          <MobileActionBar
            hotline={chrome.hotline}
            zaloUrl={chrome.zaloUrl}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

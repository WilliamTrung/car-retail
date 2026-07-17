import type { Metadata } from "next";
import { pickLocale } from "@/lib/attributes";
import { getEnv } from "@/server/config/env";
import type { LocalizedText, SeoMeta } from "@/server/db/zod";
import { mediaService } from "@/server/modules/media";

type SeoLocaleMeta = {
  title?: string;
  description?: string;
  ogImageMediaId?: string;
};

type PageSeoMeta = {
  vi?: SeoLocaleMeta;
  en?: SeoLocaleMeta;
} | null;

export function getSiteUrl(): string {
  try {
    return getEnv().NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  } catch {
    return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
      /\/$/,
      "",
    );
  }
}

export function localePath(locale: string, pathname: string): string {
  const base = getSiteUrl();
  const viMap: Record<string, string> = {
    "/": "/vi",
    "/book-test-drive": "/vi/dang-ky-lai-thu",
    "/deposit": "/vi/dat-coc",
    "/news": "/vi/tin-tuc",
    "/about": "/vi/ve-chung-toi",
    "/contact": "/vi/lien-he",
    "/policies": "/vi/chinh-sach",
    "/support": "/vi/ho-tro",
    "/showrooms": "/vi/showroom",
  };
  const enMap: Record<string, string> = {
    "/": "/en",
    "/book-test-drive": "/en/book-test-drive",
    "/deposit": "/en/deposit",
    "/news": "/en/news",
    "/about": "/en/about",
    "/contact": "/en/contact",
    "/policies": "/en/policies",
    "/support": "/en/support",
    "/showrooms": "/en/showrooms",
  };

  if (pathname.startsWith("/models/")) {
    const slug = pathname.replace("/models/", "");
    return `${base}/${locale}/models/${slug}`;
  }
  if (pathname.startsWith("/news/")) {
    const slug = pathname.replace("/news/", "");
    return locale === "vi"
      ? `${base}/vi/tin-tuc/${slug}`
      : `${base}/en/news/${slug}`;
  }

  const map = locale === "vi" ? viMap : enMap;
  return `${base}${map[pathname] ?? `/${locale}${pathname}`}`;
}

export function buildPageMetadata(
  locale: string,
  pathname: string,
  meta: PageSeoMeta | SeoMeta | null | undefined,
  seoDefaults: PageSeoMeta | SeoMeta | null | undefined,
  ogImageUrl: string | null | undefined,
): Metadata {
  const defaults =
    (seoDefaults as PageSeoMeta)?.[locale as "vi" | "en"] ??
    (seoDefaults as PageSeoMeta)?.vi ??
    {};
  const page =
    (meta as PageSeoMeta)?.[locale as "vi" | "en"] ??
    (meta as PageSeoMeta)?.vi ??
    {};
  const title = page.title || defaults.title || "Car Retail";
  const description = page.description || defaults.description || "";
  const url = localePath(locale, pathname);

  const og = {
    title,
    description,
    url,
    locale: locale === "vi" ? "vi_VN" : "en_US",
    type: "website" as const,
    ...(ogImageUrl ? { images: [{ url: ogImageUrl }] } : {}),
  };

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        vi: localePath("vi", pathname),
        en: localePath("en", pathname),
        "x-default": localePath("vi", pathname),
      },
    },
    openGraph: og,
    ...(ogImageUrl
      ? {
          twitter: {
            card: "summary_large_image" as const,
            title,
            description,
            images: [ogImageUrl],
          },
        }
      : {}),
  };
}

export async function resolveMediaUrl(
  mediaId: string | null | undefined,
): Promise<string | null> {
  return mediaService.getPublicUrl(mediaId);
}

export async function resolveOgImageUrl(
  locale: string,
  seoDefaults: PageSeoMeta | SeoMeta | null | undefined,
  pageMeta: PageSeoMeta | SeoMeta | null | undefined,
): Promise<string | null> {
  const page = (pageMeta as PageSeoMeta)?.[locale as "vi" | "en"] ??
    (pageMeta as PageSeoMeta)?.vi;
  const defaults =
    (seoDefaults as PageSeoMeta)?.[locale as "vi" | "en"] ??
    (seoDefaults as PageSeoMeta)?.vi;
  const mediaId = page?.ogImageMediaId ?? defaults?.ogImageMediaId;
  return resolveMediaUrl(mediaId);
}

export function dealerTitle(
  dealerName: LocalizedText | null | undefined,
  locale: string,
): string {
  return pickLocale(dealerName, locale) || "Car Retail";
}

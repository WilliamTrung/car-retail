import { pickLocale } from "@/lib/attributes";
import prisma from "@/lib/prisma";

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

/** @param {string | null | undefined} mediaId */
export async function resolveMediaUrl(mediaId) {
  if (!mediaId) return null;
  const asset = await prisma.mediaAsset.findUnique({
    where: { id: mediaId },
    select: { publicUrl: true },
  });
  return asset?.publicUrl ?? null;
}

/** @param {string} locale @param {string} pathname - internal pathname e.g. /news */
export function localePath(locale, pathname) {
  const base = getSiteUrl();
  const viMap = {
    "/": "/vi",
    "/book-test-drive": "/vi/dang-ky-lai-thu",
    "/deposit": "/vi/dat-coc",
    "/news": "/vi/tin-tuc",
    "/about": "/vi/ve-chung-toi",
    "/contact": "/vi/lien-he",
    "/policies": "/vi/chinh-sach",
    "/support": "/vi/ho-tro",
  };
  const enMap = {
    "/": "/en",
    "/book-test-drive": "/en/book-test-drive",
    "/deposit": "/en/deposit",
    "/news": "/en/news",
    "/about": "/en/about",
    "/contact": "/en/contact",
    "/policies": "/en/policies",
    "/support": "/en/support",
  };
  if (pathname.startsWith("/models/")) {
    const slug = pathname.replace("/models/", "");
    return `${base}/${locale}/models/${slug}`;
  }
  if (pathname.startsWith("/news/")) {
    const slug = pathname.replace("/news/", "");
    return locale === "vi" ? `${base}/vi/tin-tuc/${slug}` : `${base}/en/news/${slug}`;
  }
  const map = locale === "vi" ? viMap : enMap;
  return `${base}${map[pathname] || `/${locale}${pathname}`}`;
}

/**
 * @param {string} locale
 * @param {string} pathname
 * @param {{ vi?: { title?: string, description?: string, ogImageMediaId?: string }, en?: { title?: string, description?: string, ogImageMediaId?: string } } | null | undefined} meta
 * @param {{ vi?: { title?: string, description?: string, ogImageMediaId?: string }, en?: { title?: string, description?: string, ogImageMediaId?: string } } | null | undefined} seoDefaults
 * @param {string | null | undefined} ogImageUrl
 */
export function buildPageMetadata(locale, pathname, meta, seoDefaults, ogImageUrl) {
  const defaults = seoDefaults?.[locale] ?? seoDefaults?.vi ?? {};
  const page = meta?.[locale] ?? meta?.vi ?? {};
  const title = page.title || defaults.title || "Car Retail";
  const description = page.description || defaults.description || "";
  const url = localePath(locale, pathname);

  const og = {
    title,
    description,
    url,
    locale: locale === "vi" ? "vi_VN" : "en_US",
    type: "website",
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
      ? { twitter: { card: "summary_large_image", title, description, images: [ogImageUrl] } }
      : {}),
  };
}

/** @param {string} locale @param {object | null | undefined} seoDefaults @param {object | null | undefined} pageMeta */
export async function resolveOgImageUrl(locale, seoDefaults, pageMeta) {
  const page = pageMeta?.[locale] ?? pageMeta?.vi;
  const defaults = seoDefaults?.[locale] ?? seoDefaults?.vi;
  const mediaId = page?.ogImageMediaId || defaults?.ogImageMediaId;
  return resolveMediaUrl(mediaId);
}

/** @param {{ vi?: string, en?: string } | null | undefined} dealerName @param {string} locale */
export function dealerTitle(dealerName, locale) {
  return pickLocale(dealerName, locale) || "Car Retail";
}

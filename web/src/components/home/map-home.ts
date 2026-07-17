import type { LocalizeHref } from "@/lib/i18n/localize-href";
import type { Locale } from "@/lib/view-models/common";
import { resolveLocalized } from "@/lib/view-models/common";
import type {
  HeroSlideVM,
  NewsTeaserVM,
  PromoVM,
} from "@/lib/view-models/home";
import { formatHotlineDisplay, toTelHref } from "@/lib/view-models/mappers";

type Localizedish = { vi: string; en: string } | string | null | undefined;

type HeroSlideSource = {
  id: string;
  title?: Localizedish;
  subtitle?: Localizedish;
  promoChip?: Localizedish;
  ctaLabel?: Localizedish;
  ctaRouteKey?: string | null;
  imageMedia?: {
    publicUrl?: string | null;
    altText?: Localizedish;
  } | null;
};

type NewsSource = {
  id: string;
  slug?: Localizedish;
  title?: Localizedish;
  excerpt?: Localizedish;
  publishedAt?: Date | string | null;
  featuredMedia?: { publicUrl?: string | null } | null;
};

type PromoCountdownSource = {
  enabled?: boolean;
  endAt?: string | null;
  label?: Localizedish;
} | null | undefined;

function routeKeyToHref(routeKey: string | null | undefined): string {
  if (!routeKey) return "/book-test-drive";
  if (routeKey.startsWith("/")) return routeKey;
  const map: Record<string, string> = {
    home: "/",
    models: "/",
    "test-drive": "/book-test-drive",
    "book-test-drive": "/book-test-drive",
    deposit: "/deposit",
    news: "/news",
  };
  return map[routeKey] ?? `/${routeKey}`;
}

export function toHeroSlideVM(
  slide: HeroSlideSource,
  locale: Locale,
  defaults: {
    primaryLabel: string;
    secondaryLabel: string;
    secondaryHref: string;
    imageAltFallback: string;
  },
  localizeHref?: LocalizeHref,
): HeroSlideVM {
  const title = resolveLocalized(slide.title, locale) || defaults.primaryLabel;
  const ctaLabel = resolveLocalized(slide.ctaLabel, locale);
  const primaryHref = routeKeyToHref(slide.ctaRouteKey);

  return {
    id: slide.id,
    promoChip: resolveLocalized(slide.promoChip, locale) || null,
    title,
    subtitle: resolveLocalized(slide.subtitle, locale) || null,
    primaryCta: {
      label: ctaLabel || defaults.primaryLabel,
      href: localizeHref ? localizeHref(primaryHref) : primaryHref,
    },
    secondaryCta: {
      label: defaults.secondaryLabel,
      href: defaults.secondaryHref,
    },
    imageUrl: slide.imageMedia?.publicUrl ?? null,
    imageAlt:
      resolveLocalized(slide.imageMedia?.altText, locale) ||
      title ||
      defaults.imageAltFallback,
  };
}

export function toNewsTeaserVM(
  post: NewsSource,
  locale: Locale,
  tagFallback: string,
  localizeHref?: LocalizeHref,
): NewsTeaserVM {
  const slug = resolveLocalized(post.slug, locale);
  const published =
    post.publishedAt instanceof Date
      ? post.publishedAt
      : post.publishedAt
        ? new Date(post.publishedAt)
        : null;
  const date =
    published && !Number.isNaN(published.getTime())
      ? published.toLocaleDateString(locale === "en" ? "en-GB" : "vi-VN")
      : "";

  const rawHref = slug ? `/news/${slug}` : "/news";

  return {
    id: post.id,
    slug,
    title: resolveLocalized(post.title, locale),
    tag: tagFallback,
    tagKind: "news",
    date,
    imageUrl: post.featuredMedia?.publicUrl ?? null,
    href: localizeHref ? localizeHref(rawHref) : rawHref,
  };
}

type PromoMessages = {
  overline: string;
  titleFallback: string;
  bullets: string[];
  dateRangeNote: string;
  ctaLabel: string;
  ctaHref: string;
};

/**
 * Compose PromoVM from SiteSettings.promoCountdown + message copy.
 * Facade exposes `{ enabled, endAt, label }` only — bullets/date note from messages.
 * - `enabled: false` → hide section (null)
 * - missing / enabled → show; endsAt only when enabled + future ISO
 */
export function toPromoVM(
  promo: PromoCountdownSource,
  locale: Locale,
  messages: PromoMessages,
): PromoVM | null {
  if (promo?.enabled === false) return null;

  const endsAtRaw =
    promo?.enabled && promo.endAt?.trim() ? promo.endAt.trim() : null;
  const endsAtMs = endsAtRaw ? Date.parse(endsAtRaw) : NaN;
  const valid = Boolean(endsAtRaw && !Number.isNaN(endsAtMs));
  const expired = valid ? endsAtMs <= Date.now() : false;
  const endsAt = valid && !expired ? endsAtRaw : null;

  const label = resolveLocalized(promo?.label, locale);

  return {
    overline: messages.overline,
    title: label || messages.titleFallback,
    bullets: messages.bullets.slice(0, 5),
    endsAt,
    dateRangeNote: messages.dateRangeNote,
    ctaLabel: messages.ctaLabel,
    ctaHref: messages.ctaHref,
  };
}

export function resolveHotline(phone: string | null | undefined): {
  display: string;
  tel: string;
} {
  if (!phone) return { display: "", tel: "" };
  return { display: formatHotlineDisplay(phone), tel: toTelHref(phone) };
}

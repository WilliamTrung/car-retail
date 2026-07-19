import type { LocalizeHref } from "@/lib/i18n/localize-href";
import { daysUntil } from "@/lib/format";
import type { Locale } from "@/lib/view-models/common";
import { resolveLocalized } from "@/lib/view-models/common";
import type {
  DeliveryItemVM,
  HeroSlideVM,
  NewsTeaserVM,
  PromoTiming,
  PromoVM,
} from "@/lib/view-models/home";
import { formatHotlineDisplay, toTelHref } from "@/lib/view-models/mappers";
import type { LineupTabKey } from "./ModelGridSection";

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

type DeliverySource = {
  id: string;
  imageUrl?: string | null;
  caption?: Localizedish;
};

export function toHeroSlideVM(
  slide: HeroSlideSource,
  locale: Locale,
  defaults: {
    primaryLabel: string;
    secondaryLabel: string;
    primaryHref: string;
    secondaryHref: string;
    imageAltFallback: string;
  },
  localizeHref?: LocalizeHref,
): HeroSlideVM {
  const title = resolveLocalized(slide.title, locale) || defaults.primaryLabel;
  const ctaLabel = resolveLocalized(slide.ctaLabel, locale);
  // Force book-test-drive primary — CMS routeKey must not introduce a competing destination.
  const primaryHref = defaults.primaryHref;
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
  /** Template with `{date}` — e.g. "Còn hiệu lực đến {date}" / "Valid until {date}". */
  validUntil: string;
  ctaLabel: string;
  ctaHref: string;
};

function formatPromoDate(endsAt: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(endsAt));
}

function resolvePromoTiming(
  endsAt: string | null,
  messages: PromoMessages,
  locale: Locale,
): PromoTiming {
  if (endsAt && daysUntil(endsAt) <= 14) {
    return { mode: "live", endsAt };
  }
  const validUntilLabel = endsAt
    ? messages.validUntil.replace("{date}", formatPromoDate(endsAt, locale))
    : messages.dateRangeNote;
  return { mode: "static", validUntilLabel };
}

/**
 * Compose PromoVM from SiteSettings.promoCountdown + message copy.
 * Facade exposes `{ enabled, endAt, label }` only — bullets/date note from messages.
 * - `enabled: false` → hide section (null)
 * - missing / enabled → show; endsAt only when enabled + future ISO
 * - daysUntil(endsAt) ≤ 14 → live countdown; else static DateBadge
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
    timing: resolvePromoTiming(endsAt, messages, locale),
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

/** Classify published model into lineup tab (All/Personal/Service/Van). */
export function classifyLineupKey(source: {
  slug?: Localizedish;
  name?: Localizedish;
  segment?: { key?: string | null; line?: { key?: string | null } | null } | null;
  segmentKey?: string | null;
}): Exclude<LineupTabKey, "all"> {
  const lineKey = (source.segment?.line?.key ?? "").toLowerCase();
  const segKey = (
    source.segmentKey ||
    source.segment?.key ||
    ""
  ).toLowerCase();
  const slug = resolveLocalized(source.slug, "en").toLowerCase();
  const name = resolveLocalized(source.name, "en").toLowerCase();
  const hay = `${lineKey} ${segKey} ${slug} ${name}`;

  if (hay.includes("van") || hay.includes("cargo")) return "van";
  if (
    hay.includes("fleet") ||
    hay.includes("service") ||
    hay.includes("commercial") ||
    hay.includes("limo") ||
    hay.includes("metro") ||
    hay.includes("shuttle")
  ) {
    return "service";
  }
  return "personal";
}

/**
 * Normalize delivery captions to entity-bound `{model · branch}`.
 * Parses common seed formats; falls back to paired model/branch entities.
 */
export function toDeliveryItemVM(
  photo: DeliverySource,
  locale: Locale,
  entities: { models: string[]; branches: string[] },
  index: number,
): DeliveryItemVM {
  const raw = resolveLocalized(photo.caption, locale).trim();
  const caption = bindDeliveryCaption(raw, entities, index, locale);

  return {
    id: photo.id,
    imageUrl: photo.imageUrl ?? null,
    caption,
  };
}

function bindDeliveryCaption(
  raw: string,
  entities: { models: string[]; branches: string[] },
  index: number,
  locale: Locale,
): string {
  const cleaned = raw
    .replace(/\s*[—–-]\s*/g, " · ")
    .replace(/\s*handover\s*/gi, " ")
    .replace(/\s*bàn giao\s*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  const parts = cleaned
    .split(/\s*·\s*/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    const model = parts[0]!;
    const branch = parts
      .slice(1)
      .join(" · ")
      .replace(/^(chi nhánh|branch)\s+/i, "")
      .trim();
    return `${model} · ${branch}`;
  }

  const model =
    entities.models[index % Math.max(entities.models.length, 1)] ||
    (locale === "vi" ? "Xe Volta" : "Volta model");
  const branch =
    entities.branches[index % Math.max(entities.branches.length, 1)] ||
    "Showroom";

  // Generic / unparseable caption → entity-bound fallback (content-mismatch fix).
  return `${model} · ${branch}`;
}

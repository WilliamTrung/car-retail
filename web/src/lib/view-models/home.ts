export interface HeroSlideVM {
  id: string;
  promoChip: string | null;
  title: string;
  subtitle: string | null;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string } | null;
  imageUrl: string | null;
  imageAlt: string;
}

/** Live timer when daysUntil(endsAt) ≤ 14; else static date badge (no JS timer). */
export type PromoTiming =
  | { mode: "live"; endsAt: string }
  | { mode: "static"; validUntilLabel: string };

export interface PromoVM {
  overline: string;
  title: string;
  bullets: string[];
  endsAt: string | null;
  timing: PromoTiming;
  dateRangeNote: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface NewsTeaserVM {
  id: string;
  slug: string;
  title: string;
  tag: string;
  tagKind: "promo" | "service" | "news";
  date: string;
  imageUrl: string | null;
  href: string;
}

export interface DeliveryItemVM {
  id: string;
  imageUrl: string | null;
  caption: string;
}

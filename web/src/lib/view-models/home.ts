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

export interface PromoVM {
  overline: string;
  title: string;
  bullets: string[];
  endsAt: string | null;
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

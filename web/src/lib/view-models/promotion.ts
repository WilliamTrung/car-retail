import { daysUntil } from "@/lib/format";
import type { Locale, Localized } from "./common";
import { resolveLocalized } from "./common";
import type { PromoTiming } from "./home";

/**
 * Frontend-owned promotions catalog (listing seed).
 * ponytail: ceiling = typed seed + mapper. Upgrade path = backend Promotion
 * module (CRUD + published list) via lib/queries — do NOT invent that here.
 */

export type OfferType =
  | "site_wide"
  | "by_model"
  | "financing"
  | "trade_in"
  | "special_group";

export interface PromotionSource {
  id: string;
  offerType: OfferType;
  title: Localized;
  /** Max ~2 lines of summary copy. */
  summary: Localized;
  applicableModels: "all" | Localized[];
  /** ISO date — STATIC far-out promos. */
  validUntil?: string;
  /** Mapper: endsAt = renderNow + N days (live urgency). */
  liveOffsetDays?: number;
  spotlight?: boolean;
  conditionsHref?: string;
  bullets?: Localized[];
}

export interface PromoListingCardVM {
  id: string;
  offerType: OfferType;
  offerTypeLabel: string;
  title: string;
  summary: string;
  /** Display chips — already capped (max 3 + "+N" as last chip when needed). */
  applicableModels: string[];
  timing: PromoTiming;
  /** Effective end ms for Ending-soon sort. */
  endsAtMs: number;
  conditionsLabel: string;
  conditionsHref?: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
}

export interface SpotlightPromoVM extends PromoListingCardVM {
  bullets: string[];
  imageUrl: string | null;
  imageAlt: string;
}

export type PromoListMessages = {
  offerType: Record<OfferType, string>;
  /** "Tất cả các dòng xe" / "All models" */
  allModels: string;
  conditionsLabel: string;
  claimCta: string;
  detailCta: string;
  /** "Áp dụng đến {date}" / "Valid until {date}" */
  validUntil: string;
};

/** Seed catalog — bilingual body lives here (not message files). */
export const PROMOTIONS: PromotionSource[] = [
  {
    id: "n1",
    offerType: "site_wide",
    spotlight: true,
    liveOffsetDays: 4,
    title: {
      vi: "Ưu đãi toàn hệ thống tháng này",
      en: "Site-wide offer this month",
    },
    summary: {
      vi: "Giảm đến 10% giá niêm yết kèm hỗ trợ lệ phí trước bạ khi đặt xe tại showroom Volta Auto.",
      en: "Up to 10% off list price plus registration-fee support when you order at a Volta Auto showroom.",
    },
    applicableModels: "all",
    bullets: [
      {
        vi: "Miễn / hỗ trợ lệ phí trước bạ theo chương trình",
        en: "Registration-fee waiver or support per program",
      },
      {
        vi: "Tặng gói sạc / phụ kiện theo phiên bản",
        en: "Charging / accessory pack by trim",
      },
      {
        vi: "Bảo hiểm vật chất ưu đãi khi đặt cọc",
        en: "Preferential physical insurance with deposit",
      },
    ],
  },
  {
    id: "n2",
    offerType: "site_wide",
    validUntil: "2026-12-31T23:59:59+07:00",
    title: {
      vi: "Quà tặng cuối năm khi đặt cọc",
      en: "Year-end gift with deposit",
    },
    summary: {
      vi: "Nhận bộ quà phụ kiện chính hãng khi đặt cọc trước 31/12 — áp dụng mọi dòng xe đang bán.",
      en: "Get an official accessory gift set when you deposit before 31 Dec — all current models.",
    },
    applicableModels: "all",
  },
  {
    id: "n3",
    offerType: "site_wide",
    validUntil: "2029-02-10T23:59:59+07:00",
    title: {
      vi: "Chương trình bảo dưỡng ưu đãi dài hạn",
      en: "Long-term preferential service plan",
    },
    summary: {
      vi: "Gói bảo dưỡng định kỳ giá cố định trong 3 năm đầu — giữ xe luôn sẵn sàng trên mọi hành trình.",
      en: "Fixed-price scheduled service for the first 3 years — keep your EV ready for every trip.",
    },
    applicableModels: "all",
  },
  {
    id: "n4",
    offerType: "financing",
    validUntil: "2026-09-30T23:59:59+07:00",
    title: {
      vi: "Trả góp linh hoạt đến 80%",
      en: "Flexible financing up to 80%",
    },
    summary: {
      vi: "Hỗ trợ vay đến 80% giá xe, lãi suất ưu đãi từ đối tác tài chính trong quý.",
      en: "Finance up to 80% of vehicle price with preferential partner rates this quarter.",
    },
    applicableModels: "all",
  },
  {
    id: "n5",
    offerType: "trade_in",
    validUntil: "2026-12-31T23:59:59+07:00",
    title: {
      vi: "Thu cũ đổi mới — định giá trong ngày",
      en: "Trade-in — same-day valuation",
    },
    summary: {
      vi: "Định giá xe cũ minh bạch, trừ thẳng vào giá xe mới tại showroom trong ngày.",
      en: "Transparent used-car valuation deducted from your new EV price the same day.",
    },
    applicableModels: "all",
  },
  {
    id: "n6",
    offerType: "special_group",
    validUntil: "2026-12-31T23:59:59+07:00",
    title: {
      vi: "Ưu đãi dành cho doanh nghiệp & đoàn thể",
      en: "Fleet & group purchase offer",
    },
    summary: {
      vi: "Chiết khấu theo số lượng, hỗ trợ đăng ký biển & bàn giao tập trung cho đội xe.",
      en: "Volume discounts, registration support, and coordinated fleet handover.",
    },
    applicableModels: "all",
  },
  {
    id: "n7",
    offerType: "by_model",
    liveOffsetDays: 6,
    title: {
      vi: "Volta S7 — ưu đãi ra mắt tuần này",
      en: "Volta S7 — launch week offer",
    },
    summary: {
      vi: "Giảm đặc biệt cho Volta S7 kèm gói sạc tại nhà khi đặt trong khung giờ ưu đãi.",
      en: "Special S7 discount plus a home charging pack when you order in the offer window.",
    },
    applicableModels: [{ vi: "Volta S7", en: "Volta S7" }],
  },
  {
    id: "n8",
    offerType: "by_model",
    validUntil: "2026-08-31T23:59:59+07:00",
    title: {
      vi: "Volta MPV7 — ưu đãi gia đình",
      en: "Volta MPV7 — family offer",
    },
    summary: {
      vi: "Gói phụ kiện gia đình và hỗ trợ lệ phí khi chọn Volta MPV7 trước cuối tháng 8.",
      en: "Family accessory pack and fee support when you choose MPV7 before end of August.",
    },
    applicableModels: [{ vi: "Volta MPV7", en: "Volta MPV7" }],
  },
];

function formatPromoDate(endsAt: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(endsAt));
}

function resolveEndsAt(
  source: PromotionSource,
  nowMs: number,
): { endsAt: string | null; endsAtMs: number } {
  if (
    typeof source.liveOffsetDays === "number" &&
    Number.isFinite(source.liveOffsetDays)
  ) {
    const endsAtMs = nowMs + source.liveOffsetDays * 86_400_000;
    return { endsAt: new Date(endsAtMs).toISOString(), endsAtMs };
  }
  if (source.validUntil?.trim()) {
    const endsAtMs = Date.parse(source.validUntil);
    if (!Number.isNaN(endsAtMs)) {
      return { endsAt: source.validUntil, endsAtMs };
    }
  }
  return { endsAt: null, endsAtMs: Number.POSITIVE_INFINITY };
}

function resolveTiming(
  endsAt: string | null,
  messages: PromoListMessages,
  locale: Locale,
  nowMs: number,
): PromoTiming {
  if (endsAt && daysUntil(endsAt, nowMs) <= 14) {
    return { mode: "live", endsAt };
  }
  const validUntilLabel = endsAt
    ? messages.validUntil.replace("{date}", formatPromoDate(endsAt, locale))
    : "";
  return { mode: "static", validUntilLabel };
}

function mapApplicableModels(
  source: PromotionSource,
  locale: Locale,
  messages: PromoListMessages,
): string[] {
  if (source.applicableModels === "all") {
    return [messages.allModels];
  }
  const labels = source.applicableModels.map((m) =>
    resolveLocalized(m, locale),
  );
  if (labels.length <= 3) return labels;
  const rest = labels.length - 3;
  return [...labels.slice(0, 3), `+${rest}`];
}

export function toPromoListingCardVM(
  source: PromotionSource,
  locale: Locale,
  nowMs: number,
  messages: PromoListMessages,
): PromoListingCardVM {
  const { endsAt, endsAtMs } = resolveEndsAt(source, nowMs);
  const detailHref = source.conditionsHref ?? `#promo-${source.id}`;

  return {
    id: source.id,
    offerType: source.offerType,
    offerTypeLabel: messages.offerType[source.offerType],
    title: resolveLocalized(source.title, locale),
    summary: resolveLocalized(source.summary, locale),
    applicableModels: mapApplicableModels(source, locale, messages),
    timing: resolveTiming(endsAt, messages, locale, nowMs),
    endsAtMs,
    conditionsLabel: messages.conditionsLabel,
    conditionsHref: detailHref,
    primaryCta: {
      label: messages.claimCta,
      href: `#promo-lead?promo=${encodeURIComponent(source.id)}`,
    },
    secondaryCta: {
      label: messages.detailCta,
      href: detailHref,
    },
  };
}

export function toSpotlightPromoVM(
  source: PromotionSource,
  locale: Locale,
  nowMs: number,
  messages: PromoListMessages,
  image: { url: string | null; alt: string },
): SpotlightPromoVM {
  const base = toPromoListingCardVM(source, locale, nowMs, messages);
  const bullets = (source.bullets ?? [])
    .map((b) => resolveLocalized(b, locale))
    .filter(Boolean)
    .slice(0, 5);

  return {
    ...base,
    bullets,
    imageUrl: image.url,
    imageAlt: image.alt,
  };
}

export function toPromoListVM(
  sources: PromotionSource[],
  locale: Locale,
  messages: PromoListMessages,
  image: { url: string | null; alt: string },
  nowMs: number = Date.now(),
): {
  cards: PromoListingCardVM[];
  spotlight: SpotlightPromoVM | null;
} {
  const cards = sources.map((s) =>
    toPromoListingCardVM(s, locale, nowMs, messages),
  );
  const spotlightSrc = sources.find((s) => s.spotlight) ?? null;
  const spotlight = spotlightSrc
    ? toSpotlightPromoVM(spotlightSrc, locale, nowMs, messages, image)
    : null;
  return { cards, spotlight };
}

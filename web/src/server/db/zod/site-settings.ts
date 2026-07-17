import { z } from "zod";
import { LocalizedTextSchema } from "./localized";
import { SeoMetaSchema } from "./seo";

export const SocialLinkSchema = z.object({
  platform: z.string().min(1),
  url: z.string().url().or(z.string().min(1)),
});

export type SocialLink = z.infer<typeof SocialLinkSchema>;

export const SocialLinksSchema = z.array(SocialLinkSchema);

/** SiteSettings.brandStory */
export const BrandStoryLocaleSchema = z.object({
  title: z.string(),
  body: z.string(),
});

export const BrandStorySchema = z.object({
  vi: BrandStoryLocaleSchema,
  en: BrandStoryLocaleSchema,
});

export type BrandStory = z.infer<typeof BrandStorySchema>;

/** SiteSettings.tradeInBlock */
export const TradeInBlockLocaleSchema = z.object({
  title: z.string(),
  body: z.string(),
  ctaLabel: z.string(),
});

export const TradeInBlockSchema = z.object({
  vi: TradeInBlockLocaleSchema,
  en: TradeInBlockLocaleSchema,
  imageMediaId: z.string().optional(),
});

export type TradeInBlock = z.infer<typeof TradeInBlockSchema>;

/** SiteSettings.promoCountdown */
export const PromoCountdownSchema = z.object({
  enabled: z.boolean(),
  endAt: z.string(), // ISO datetime string in Json
  label: LocalizedTextSchema,
});

export type PromoCountdown = z.infer<typeof PromoCountdownSchema>;

/** SiteSettings.ctaTestDrive / ctaDeposit */
export const CtaLinkSchema = z.object({
  label: LocalizedTextSchema,
  routeKey: z.string().min(1),
});

export type CtaLink = z.infer<typeof CtaLinkSchema>;

/** SiteSettings.seoDefaults — same shape as SeoMeta. */
export const SeoDefaultsSchema = SeoMetaSchema;
export type SeoDefaults = z.infer<typeof SeoDefaultsSchema>;

/** Gallery Json on VehicleModel: media asset id strings. */
export const MediaIdListSchema = z.array(z.string().min(1));
export type MediaIdList = z.infer<typeof MediaIdListSchema>;

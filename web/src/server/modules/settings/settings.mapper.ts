import type { Hotline, MenuItem, SiteSettings } from "@prisma/client";
import {
  BrandStorySchema,
  CtaLinkSchema,
  LocalizedTextSchema,
  PromoCountdownSchema,
  SeoDefaultsSchema,
  SocialLinksSchema,
  TradeInBlockSchema,
  type LocalizedText,
} from "@/server/db/zod";
import type {
  HotlineDto,
  MenuItemDto,
  SiteSettingsDto,
} from "./settings.schema";

function loc(value: unknown): LocalizedText {
  return LocalizedTextSchema.parse(value);
}

function locNull(value: unknown): LocalizedText | null {
  if (value == null) return null;
  return LocalizedTextSchema.parse(value);
}

function parseOptional<T>(
  schema: { safeParse: (v: unknown) => { success: true; data: T } | { success: false } },
  value: unknown,
): T | null {
  if (value == null) return null;
  const r = schema.safeParse(value);
  return r.success ? r.data : null;
}

export function toSiteSettingsDto(row: SiteSettings): SiteSettingsDto {
  return {
    id: "singleton",
    dealerName: loc(row.dealerName),
    legalEntity: loc(row.legalEntity),
    mst: row.mst,
    email: row.email,
    copyright: locNull(row.copyright),
    logoMediaId: row.logoMediaId,
    faviconMediaId: row.faviconMediaId,
    socialLinks: parseOptional(SocialLinksSchema, row.socialLinks),
    privacyPolicyUrl: locNull(row.privacyPolicyUrl),
    consentTemplate: locNull(row.consentTemplate),
    seoDefaults: parseOptional(SeoDefaultsSchema, row.seoDefaults),
    disclaimers: locNull(row.disclaimers),
    brandStory: parseOptional(BrandStorySchema, row.brandStory),
    tradeInBlock: parseOptional(TradeInBlockSchema, row.tradeInBlock),
    promoCountdown: parseOptional(PromoCountdownSchema, row.promoCountdown),
    ctaTestDrive: parseOptional(CtaLinkSchema, row.ctaTestDrive),
    ctaDeposit: parseOptional(CtaLinkSchema, row.ctaDeposit),
    maintenanceMode: row.maintenanceMode,
    updatedAt: row.updatedAt,
  };
}

export function toHotlineDto(row: Hotline): HotlineDto {
  return {
    id: row.id,
    label: loc(row.label),
    phone: row.phone,
    sortOrder: row.sortOrder,
    showroomId: row.showroomId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function toMenuItemDto(row: MenuItem): MenuItemDto {
  return {
    id: row.id,
    label: loc(row.label),
    routeKey: row.routeKey,
    placement: row.placement,
    sortOrder: row.sortOrder,
    visible: row.visible,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

import { z } from "zod";
import { MenuPlacement } from "@prisma/client";
import {
  BrandStorySchema,
  CtaLinkSchema,
  LocalizedTextSchema,
  LocalizedTextOptionalSchema,
  PromoCountdownSchema,
  SeoDefaultsSchema,
  SocialLinksSchema,
  TradeInBlockSchema,
} from "@/server/db/zod";

export const SiteSettingsUpdateSchema = z.object({
  dealerName: LocalizedTextSchema.optional(),
  legalEntity: LocalizedTextSchema.optional(),
  mst: z.string().nullable().optional(),
  email: z.string().email().nullable().optional().or(z.literal("")),
  copyright: LocalizedTextOptionalSchema,
  logoMediaId: z.string().nullable().optional(),
  faviconMediaId: z.string().nullable().optional(),
  socialLinks: SocialLinksSchema.nullable().optional(),
  privacyPolicyUrl: LocalizedTextOptionalSchema,
  consentTemplate: LocalizedTextOptionalSchema,
  seoDefaults: SeoDefaultsSchema.nullable().optional(),
  disclaimers: LocalizedTextOptionalSchema,
  brandStory: BrandStorySchema.nullable().optional(),
  tradeInBlock: TradeInBlockSchema.nullable().optional(),
  promoCountdown: PromoCountdownSchema.nullable().optional(),
  ctaTestDrive: CtaLinkSchema.nullable().optional(),
  ctaDeposit: CtaLinkSchema.nullable().optional(),
  maintenanceMode: z.boolean().optional(),
});
export type SiteSettingsUpdateInput = z.infer<typeof SiteSettingsUpdateSchema>;

export const SiteSettingsDtoSchema = z.object({
  id: z.literal("singleton"),
  dealerName: LocalizedTextSchema,
  legalEntity: LocalizedTextSchema,
  mst: z.string().nullable(),
  email: z.string().nullable(),
  copyright: LocalizedTextSchema.nullable(),
  logoMediaId: z.string().nullable(),
  faviconMediaId: z.string().nullable(),
  socialLinks: SocialLinksSchema.nullable(),
  privacyPolicyUrl: LocalizedTextSchema.nullable(),
  consentTemplate: LocalizedTextSchema.nullable(),
  seoDefaults: SeoDefaultsSchema.nullable(),
  disclaimers: LocalizedTextSchema.nullable(),
  brandStory: BrandStorySchema.nullable(),
  tradeInBlock: TradeInBlockSchema.nullable(),
  promoCountdown: PromoCountdownSchema.nullable(),
  ctaTestDrive: CtaLinkSchema.nullable(),
  ctaDeposit: CtaLinkSchema.nullable(),
  maintenanceMode: z.boolean(),
  updatedAt: z.coerce.date(),
});
export type SiteSettingsDto = z.infer<typeof SiteSettingsDtoSchema>;

export const HotlineCreateSchema = z.object({
  label: LocalizedTextSchema,
  phone: z.string().min(1),
  sortOrder: z.number().int().optional(),
  showroomId: z.string().nullable().optional(),
});
export type HotlineCreateInput = z.infer<typeof HotlineCreateSchema>;
export const HotlineUpdateSchema = HotlineCreateSchema.partial();
export type HotlineUpdateInput = z.infer<typeof HotlineUpdateSchema>;

export const HotlineDtoSchema = z.object({
  id: z.string(),
  label: LocalizedTextSchema,
  phone: z.string(),
  sortOrder: z.number().int(),
  showroomId: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type HotlineDto = z.infer<typeof HotlineDtoSchema>;

export const MenuPlacementSchema = z.nativeEnum(MenuPlacement);
export type MenuPlacementDto = z.infer<typeof MenuPlacementSchema>;

export const MenuItemCreateSchema = z.object({
  label: LocalizedTextSchema,
  routeKey: z.string().min(1),
  placement: MenuPlacementSchema,
  sortOrder: z.number().int().optional(),
  visible: z.boolean().optional(),
});
export type MenuItemCreateInput = z.infer<typeof MenuItemCreateSchema>;
export const MenuItemUpdateSchema = MenuItemCreateSchema.partial();
export type MenuItemUpdateInput = z.infer<typeof MenuItemUpdateSchema>;

export const MenuItemDtoSchema = z.object({
  id: z.string(),
  label: LocalizedTextSchema,
  routeKey: z.string(),
  placement: MenuPlacementSchema,
  sortOrder: z.number().int(),
  visible: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type MenuItemDto = z.infer<typeof MenuItemDtoSchema>;

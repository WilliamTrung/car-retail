import { z } from "zod";
import {
  LocalizedTextSchema,
  LocalizedTextOptionalSchema,
} from "@/server/db/zod";

export const HeroSlideCreateSchema = z.object({
  title: LocalizedTextSchema,
  subtitle: LocalizedTextOptionalSchema,
  promoChip: LocalizedTextOptionalSchema,
  ctaLabel: LocalizedTextOptionalSchema,
  ctaRouteKey: z.string().nullable().optional(),
  imageMediaId: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional(),
});
export type HeroSlideCreateInput = z.infer<typeof HeroSlideCreateSchema>;
export const HeroSlideUpdateSchema = HeroSlideCreateSchema.partial();
export type HeroSlideUpdateInput = z.infer<typeof HeroSlideUpdateSchema>;

export const HeroSlideDtoSchema = z.object({
  id: z.string(),
  title: LocalizedTextSchema,
  subtitle: LocalizedTextSchema.nullable(),
  promoChip: LocalizedTextSchema.nullable(),
  ctaLabel: LocalizedTextSchema.nullable(),
  ctaRouteKey: z.string().nullable(),
  imageMediaId: z.string().nullable(),
  sortOrder: z.number().int(),
  published: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type HeroSlideDto = z.infer<typeof HeroSlideDtoSchema>;

export const ServiceBlockCreateSchema = z.object({
  title: LocalizedTextSchema,
  description: LocalizedTextOptionalSchema,
  iconKey: z.string().nullable().optional(),
  linkRouteKey: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional(),
});
export type ServiceBlockCreateInput = z.infer<typeof ServiceBlockCreateSchema>;
export const ServiceBlockUpdateSchema = ServiceBlockCreateSchema.partial();
export type ServiceBlockUpdateInput = z.infer<typeof ServiceBlockUpdateSchema>;

export const ServiceBlockDtoSchema = z.object({
  id: z.string(),
  title: LocalizedTextSchema,
  description: LocalizedTextSchema.nullable(),
  iconKey: z.string().nullable(),
  linkRouteKey: z.string().nullable(),
  sortOrder: z.number().int(),
  published: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type ServiceBlockDto = z.infer<typeof ServiceBlockDtoSchema>;

export const DeliveryPhotoCreateSchema = z.object({
  caption: LocalizedTextSchema,
  imageMediaId: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional(),
});
export type DeliveryPhotoCreateInput = z.infer<typeof DeliveryPhotoCreateSchema>;
export const DeliveryPhotoUpdateSchema = DeliveryPhotoCreateSchema.partial();
export type DeliveryPhotoUpdateInput = z.infer<typeof DeliveryPhotoUpdateSchema>;

export const DeliveryPhotoDtoSchema = z.object({
  id: z.string(),
  caption: LocalizedTextSchema,
  imageMediaId: z.string().nullable(),
  imageUrl: z.string().nullable(),
  sortOrder: z.number().int(),
  published: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type DeliveryPhotoDto = z.infer<typeof DeliveryPhotoDtoSchema>;

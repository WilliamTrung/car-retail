import { z } from "zod";
import {
  AttributeItemSchema,
  AttributeListSchema,
  AttributeTemplateItemSchema,
  LocalizedTextSchema,
  LocalizedTextOptionalSchema,
  MediaIdListSchema,
  SeoMetaSchema,
} from "@/server/db/zod";

export const ApplyTemplateModeSchema = z.enum(["merge", "replace"]);
export type ApplyTemplateMode = z.infer<typeof ApplyTemplateModeSchema>;

export const ApplyTemplateInputSchema = z.object({
  modelId: z.string().min(1),
  templateId: z.string().min(1).optional(),
  templateKey: z.string().min(1).optional(),
  mode: ApplyTemplateModeSchema.default("replace"),
}).refine((v) => Boolean(v.templateId || v.templateKey), {
  message: "templateId or templateKey required",
  path: ["templateId"],
});
export type ApplyTemplateInput = z.infer<typeof ApplyTemplateInputSchema>;

export const LineCreateSchema = z.object({
  key: z.string().min(1),
  name: LocalizedTextSchema,
  sortOrder: z.number().int().optional(),
});
export type LineCreateInput = z.infer<typeof LineCreateSchema>;

export const LineUpdateSchema = LineCreateSchema.partial();
export type LineUpdateInput = z.infer<typeof LineUpdateSchema>;

export const SegmentCreateSchema = z.object({
  lineId: z.string().min(1),
  key: z.string().min(1),
  name: LocalizedTextSchema,
  sortOrder: z.number().int().optional(),
});
export type SegmentCreateInput = z.infer<typeof SegmentCreateSchema>;

export const SegmentUpdateSchema = SegmentCreateSchema.omit({ lineId: true }).partial().extend({
  lineId: z.string().min(1).optional(),
});
export type SegmentUpdateInput = z.infer<typeof SegmentUpdateSchema>;

export const ColorSwatchSchema = z.object({
  name: LocalizedTextSchema,
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  swatchMediaId: z.string().nullable().optional(),
});
export type ColorSwatch = z.infer<typeof ColorSwatchSchema>;

export const ColorSwatchListSchema = z.array(ColorSwatchSchema);

export const ModelPromoSchema = z.object({
  bullets: z.array(LocalizedTextSchema).max(5),
  dateRange: LocalizedTextSchema.nullable().optional(),
});
export type ModelPromo = z.infer<typeof ModelPromoSchema>;

export const ModelCreateSchema = z.object({
  segmentId: z.string().min(1),
  name: LocalizedTextSchema,
  slug: LocalizedTextSchema,
  tagline: LocalizedTextOptionalSchema,
  description: LocalizedTextOptionalSchema,
  meta: SeoMetaSchema.nullable().optional(),
  heroMediaId: z.string().nullable().optional(),
  gallery: MediaIdListSchema.optional(),
  colorSwatches: ColorSwatchListSchema.optional(),
  promo: ModelPromoSchema.nullable().optional(),
  attributes: AttributeListSchema.optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});
export type ModelCreateInput = z.infer<typeof ModelCreateSchema>;

export const ModelUpdateSchema = ModelCreateSchema.partial();
export type ModelUpdateInput = z.infer<typeof ModelUpdateSchema>;

export const VariantCreateSchema = z.object({
  modelId: z.string().min(1),
  name: LocalizedTextSchema,
  price: z.number().nullable().optional(),
  attributes: AttributeListSchema.optional(),
  allowDeposit: z.boolean().optional(),
  allowTestDrive: z.boolean().optional(),
  published: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});
export type VariantCreateInput = z.infer<typeof VariantCreateSchema>;

export const VariantUpdateSchema = VariantCreateSchema.omit({ modelId: true }).partial();
export type VariantUpdateInput = z.infer<typeof VariantUpdateSchema>;

export const FeatureSectionCreateSchema = z.object({
  modelId: z.string().min(1),
  title: LocalizedTextSchema,
  body: LocalizedTextSchema,
  imageMediaId: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
});
export type FeatureSectionCreateInput = z.infer<typeof FeatureSectionCreateSchema>;

export const FeatureSectionUpdateSchema = FeatureSectionCreateSchema.omit({
  modelId: true,
}).partial();
export type FeatureSectionUpdateInput = z.infer<typeof FeatureSectionUpdateSchema>;

export const ModelFaqCreateSchema = z.object({
  modelId: z.string().min(1),
  question: LocalizedTextSchema,
  answer: LocalizedTextSchema,
  sortOrder: z.number().int().optional(),
});
export type ModelFaqCreateInput = z.infer<typeof ModelFaqCreateSchema>;

export const ModelFaqUpdateSchema = ModelFaqCreateSchema.omit({ modelId: true }).partial();
export type ModelFaqUpdateInput = z.infer<typeof ModelFaqUpdateSchema>;

export const PublishFlagSchema = z.object({
  published: z.boolean(),
});
export type PublishFlagInput = z.infer<typeof PublishFlagSchema>;

/** Output DTOs — serialized for UI / public reads. */
export const VariantDtoSchema = z.object({
  id: z.string(),
  modelId: z.string(),
  name: LocalizedTextSchema,
  price: z.number().nullable(),
  attributes: AttributeListSchema,
  allowDeposit: z.boolean(),
  allowTestDrive: z.boolean(),
  published: z.boolean(),
  sortOrder: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type VariantDto = z.infer<typeof VariantDtoSchema>;

export const ModelDtoSchema = z.object({
  id: z.string(),
  segmentId: z.string(),
  name: LocalizedTextSchema,
  slug: LocalizedTextSchema,
  tagline: LocalizedTextSchema.nullable(),
  description: LocalizedTextSchema.nullable(),
  meta: SeoMetaSchema.nullable(),
  heroMediaId: z.string().nullable(),
  gallery: MediaIdListSchema,
  colorSwatches: ColorSwatchListSchema,
  promo: ModelPromoSchema.nullable(),
  attributes: AttributeListSchema,
  published: z.boolean(),
  sortOrder: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  variants: z.array(VariantDtoSchema).optional(),
  segment: z
    .object({
      id: z.string(),
      key: z.string(),
      name: LocalizedTextSchema,
      line: z.object({
        id: z.string(),
        key: z.string(),
        name: LocalizedTextSchema,
      }),
    })
    .nullable()
    .optional(),
});
export type ModelDto = z.infer<typeof ModelDtoSchema>;

export {
  AttributeItemSchema,
  AttributeListSchema,
  AttributeTemplateItemSchema,
};

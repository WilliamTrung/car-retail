import { z } from "zod";
import {
  AttributeTemplateItemsSchema,
  LocalizedTextSchema,
} from "@/server/db/zod";

export const UnitCreateSchema = z.object({
  key: z.string().min(1),
  value: LocalizedTextSchema,
});
export type UnitCreateInput = z.infer<typeof UnitCreateSchema>;

export const UnitUpdateSchema = UnitCreateSchema.partial();
export type UnitUpdateInput = z.infer<typeof UnitUpdateSchema>;

export const UnitDtoSchema = z.object({
  id: z.string(),
  key: z.string(),
  value: LocalizedTextSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type UnitDto = z.infer<typeof UnitDtoSchema>;

export const AttributeKeyCreateSchema = z.object({
  key: z.string().min(1),
  groupKey: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
});
export type AttributeKeyCreateInput = z.infer<typeof AttributeKeyCreateSchema>;

export const AttributeKeyUpdateSchema = AttributeKeyCreateSchema.partial();
export type AttributeKeyUpdateInput = z.infer<typeof AttributeKeyUpdateSchema>;

export const AttributeKeyDtoSchema = z.object({
  id: z.string(),
  key: z.string(),
  groupKey: z.string().nullable(),
  sortOrder: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type AttributeKeyDto = z.infer<typeof AttributeKeyDtoSchema>;

export const TemplateCreateSchema = z.object({
  key: z.string().min(1),
  name: LocalizedTextSchema,
  items: AttributeTemplateItemsSchema,
});
export type TemplateCreateInput = z.infer<typeof TemplateCreateSchema>;

export const TemplateUpdateSchema = TemplateCreateSchema.partial();
export type TemplateUpdateInput = z.infer<typeof TemplateUpdateSchema>;

export const TemplateDtoSchema = z.object({
  id: z.string(),
  key: z.string(),
  name: LocalizedTextSchema,
  items: AttributeTemplateItemsSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type TemplateDto = z.infer<typeof TemplateDtoSchema>;

/** Create a template from a model's current attributes. */
export const SaveAsTemplateInputSchema = z.object({
  modelId: z.string().min(1),
  key: z.string().min(1),
  name: LocalizedTextSchema,
});
export type SaveAsTemplateInput = z.infer<typeof SaveAsTemplateInputSchema>;

/** Apply template to model — delegates merge/replace to vehicles service contract. */
export const ApplyTemplateToModelSchema = z.object({
  modelId: z.string().min(1),
  templateId: z.string().min(1).optional(),
  templateKey: z.string().min(1).optional(),
  mode: z.enum(["merge", "replace"]).default("replace"),
}).refine((v) => Boolean(v.templateId || v.templateKey), {
  message: "templateId or templateKey required",
});
export type ApplyTemplateToModelInput = z.infer<typeof ApplyTemplateToModelSchema>;

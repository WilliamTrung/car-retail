import { z } from "zod";

/** Spec row on VehicleModel / VehicleVariant: `[{ key, value, unit }]`. */
export const AttributeItemSchema = z.object({
  key: z.string().min(1),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
  unit: z.string().min(1),
});

export type AttributeItem = z.infer<typeof AttributeItemSchema>;

export const AttributeListSchema = z.array(AttributeItemSchema);

/** Row inside AttributeTemplate.items. */
export const AttributeTemplateItemSchema = z.object({
  key: z.string().min(1),
  unit: z.string().min(1),
  defaultValue: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
  showInStrip: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  groupKey: z.string().nullable().optional(),
});

export type AttributeTemplateItem = z.infer<typeof AttributeTemplateItemSchema>;

export const AttributeTemplateItemsSchema = z.array(AttributeTemplateItemSchema);

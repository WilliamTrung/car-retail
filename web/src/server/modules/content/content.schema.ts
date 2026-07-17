import { z } from "zod";
import {
  LocalizedTextSchema,
  LocalizedTextOptionalSchema,
  SeoMetaSchema,
} from "@/server/db/zod";

export const NewsCreateSchema = z.object({
  slug: LocalizedTextSchema,
  title: LocalizedTextSchema,
  excerpt: LocalizedTextOptionalSchema,
  body: LocalizedTextSchema,
  meta: SeoMetaSchema.nullable().optional(),
  featuredMediaId: z.string().nullable().optional(),
  publishedAt: z.coerce.date().nullable().optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
});
export type NewsCreateInput = z.infer<typeof NewsCreateSchema>;
export const NewsUpdateSchema = NewsCreateSchema.partial();
export type NewsUpdateInput = z.infer<typeof NewsUpdateSchema>;

export const NewsDtoSchema = z.object({
  id: z.string(),
  slug: LocalizedTextSchema,
  title: LocalizedTextSchema,
  excerpt: LocalizedTextSchema.nullable(),
  body: LocalizedTextSchema,
  meta: SeoMetaSchema.nullable(),
  featuredMediaId: z.string().nullable(),
  publishedAt: z.coerce.date().nullable(),
  featured: z.boolean(),
  published: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type NewsDto = z.infer<typeof NewsDtoSchema>;

export const PageCreateSchema = z.object({
  pageType: z.string().min(1),
  slug: LocalizedTextSchema,
  title: LocalizedTextSchema,
  body: LocalizedTextSchema,
  meta: SeoMetaSchema.nullable().optional(),
  published: z.boolean().optional(),
});
export type PageCreateInput = z.infer<typeof PageCreateSchema>;
export const PageUpdateSchema = PageCreateSchema.partial();
export type PageUpdateInput = z.infer<typeof PageUpdateSchema>;

export const PageDtoSchema = z.object({
  id: z.string(),
  pageType: z.string(),
  slug: LocalizedTextSchema,
  title: LocalizedTextSchema,
  body: LocalizedTextSchema,
  meta: SeoMetaSchema.nullable(),
  published: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type PageDto = z.infer<typeof PageDtoSchema>;

export const PolicyCreateSchema = z.object({
  slug: LocalizedTextSchema,
  title: LocalizedTextSchema,
  body: LocalizedTextOptionalSchema,
  pdfMediaId: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional(),
});
export type PolicyCreateInput = z.infer<typeof PolicyCreateSchema>;
export const PolicyUpdateSchema = PolicyCreateSchema.partial();
export type PolicyUpdateInput = z.infer<typeof PolicyUpdateSchema>;

export const PolicyDtoSchema = z.object({
  id: z.string(),
  slug: LocalizedTextSchema,
  title: LocalizedTextSchema,
  body: LocalizedTextSchema.nullable(),
  pdfMediaId: z.string().nullable(),
  sortOrder: z.number().int(),
  published: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type PolicyDto = z.infer<typeof PolicyDtoSchema>;

export const FaqCreateSchema = z.object({
  question: LocalizedTextSchema,
  answer: LocalizedTextSchema,
  sortOrder: z.number().int().optional(),
  published: z.boolean().optional(),
});
export type FaqCreateInput = z.infer<typeof FaqCreateSchema>;
export const FaqUpdateSchema = FaqCreateSchema.partial();
export type FaqUpdateInput = z.infer<typeof FaqUpdateSchema>;

export const FaqDtoSchema = z.object({
  id: z.string(),
  question: LocalizedTextSchema,
  answer: LocalizedTextSchema,
  sortOrder: z.number().int(),
  published: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type FaqDto = z.infer<typeof FaqDtoSchema>;

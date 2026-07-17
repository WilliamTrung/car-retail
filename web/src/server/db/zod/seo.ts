import { z } from "zod";

/** Per-locale SEO title/description. */
export const SeoLocaleSchema = z.object({
  title: z.string(),
  description: z.string(),
});

/** Bilingual SEO meta: `{ vi: { title, description }, en: {...} }`. */
export const SeoMetaSchema = z.object({
  vi: SeoLocaleSchema,
  en: SeoLocaleSchema,
});

export type SeoMeta = z.infer<typeof SeoMetaSchema>;
export type SeoLocale = z.infer<typeof SeoLocaleSchema>;

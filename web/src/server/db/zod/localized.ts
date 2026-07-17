import { z } from "zod";

/** Bilingual text stored in Prisma Json columns: `{ vi, en }`. Empty `en` → UI falls back to `vi`. */
export const LocalizedTextSchema = z.object({
  vi: z.string(),
  en: z.string(),
});

export type LocalizedText = z.infer<typeof LocalizedTextSchema>;

/** Optional bilingual string (nullable Json fields). */
export const LocalizedTextOptionalSchema = LocalizedTextSchema.nullable().optional();

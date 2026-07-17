import type { LocalizedText } from "@/server/db/zod";

/** Bilingual JSON helper — empty `en` falls back to `vi`. */
export function pickLocale(
  field: LocalizedText | null | undefined,
  locale: string,
): string {
  if (!field) return "";
  const value = locale === "en" ? field.en : field.vi;
  return value || field.vi || field.en || "";
}

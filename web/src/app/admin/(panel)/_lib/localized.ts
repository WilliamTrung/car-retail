import type { LocalizedValue } from "@/components/admin";

/** Nullable `{ vi, en }` DTO field → controlled LocalizedField value. */
export const lv = (
  v: { vi: string; en: string } | null | undefined,
): LocalizedValue => ({ vi: v?.vi ?? "", en: v?.en ?? "" });

export const hasLoc = (v: LocalizedValue) => v.vi !== "" || v.en !== "";

/** Date → `datetime-local` input value (local time, minute precision). */
export function dateToLocalInput(date: Date | null | undefined): string {
  if (!date || Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

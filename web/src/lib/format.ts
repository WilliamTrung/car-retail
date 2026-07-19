/** VND display: vi → `749.000.000đ`; en → `₫749,000,000`. */
export function formatVnd(
  amount: number | string | null | undefined,
  locale: string = "vi",
): string {
  if (amount == null || amount === "") return "";
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(n)) return "";
  if (locale === "en") {
    return `₫${new Intl.NumberFormat("en-US").format(n)}`;
  }
  return `${new Intl.NumberFormat("vi-VN").format(n)}đ`;
}

export function formatPriceFrom(
  amount: number | string | null | undefined,
  locale: string,
): string {
  const formatted = formatVnd(amount, locale);
  if (!formatted) return "";
  return locale === "vi" ? `Từ ${formatted}` : `From ${formatted}`;
}

export function formatCardPrice(
  amount: number | string | null | undefined,
  locale: string,
): string {
  return formatVnd(amount, locale);
}

/** Whole calendar days from `now` until `endsAt` (ceil). NaN/invalid → +Infinity. */
export function daysUntil(endsAt: string, nowMs: number = Date.now()): number {
  const ms = Date.parse(endsAt);
  if (Number.isNaN(ms)) return Number.POSITIVE_INFINITY;
  return Math.ceil((ms - nowMs) / 86_400_000);
}

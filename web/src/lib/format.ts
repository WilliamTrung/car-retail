/** VND display: `285.000.000đ` (vi-VN grouping + đ suffix). */
export function formatVnd(amount: number | string | null | undefined): string {
  if (amount == null || amount === "") return "";
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(n)) return "";
  return `${new Intl.NumberFormat("vi-VN").format(n)}đ`;
}

export function formatPriceFrom(
  amount: number | string | null | undefined,
  locale: string,
): string {
  const formatted = formatVnd(amount);
  if (!formatted) return "";
  return locale === "vi" ? `Từ ${formatted}` : `From ${formatted}`;
}

export function formatCardPrice(
  amount: number | string | null | undefined,
  locale: string,
): string {
  const formatted = formatVnd(amount);
  if (!formatted) return "";
  return locale === "en" ? formatted.replace(/đ$/u, " VND") : formatted;
}

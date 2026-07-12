/** @param {number | string | null | undefined} amount */
export function formatVnd(amount) {
  if (amount == null || amount === "") return "";
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(n)) return "";
  return new Intl.NumberFormat("vi-VN").format(n);
}

/** @param {number | string | null | undefined} amount @param {string} locale */
export function formatPriceFrom(amount, locale) {
  const formatted = formatVnd(amount);
  if (!formatted) return "";
  return locale === "vi" ? `Từ ${formatted} VNĐ` : `From ${formatted} VND`;
}

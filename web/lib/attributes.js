/**
 * Bilingual JSON helpers and attribute display utilities.
 * ponytail: minimal helpers for Phase 3+ admin/public; expand as needed.
 */

/** @param {string} locale @param {{ vi?: string, en?: string } | null | undefined} field */
export function pickLocale(field, locale) {
  if (!field || typeof field !== "object") return "";
  const value = field[locale];
  if (value) return value;
  return field.vi || field.en || "";
}

/**
 * Compose attribute display label from messages + units catalog.
 * @param {string} locale
 * @param {string} key
 * @param {Record<string, string>} specMessages - messages.spec
 * @param {{ key: string, value: { vi: string, en: string } }[]} units
 * @param {string} [unitKey]
 */
export function formatAttributeLabel(locale, key, specMessages, units, unitKey) {
  const label = specMessages[key] || key;
  if (!unitKey) return label;
  const unit = units.find((u) => u.key === unitKey);
  const unitLabel = unit ? pickLocale(unit.value, locale) : unitKey;
  return `${label} (${unitLabel})`;
}

/**
 * Lean API contract shape for vehicle model/variant responses.
 * @param {{ key: string, value: { vi: string, en: string } }[]} units
 * @param {{ key: string, value: unknown, unit?: string }[]} attributes
 */
export function toAttributesResponse(units, attributes) {
  return {
    units: units.map((u) => ({ key: u.key, value: u.value })),
    attributes: attributes.map(({ key, value, unit }) => ({ key, value, unit: unit ?? null })),
  };
}

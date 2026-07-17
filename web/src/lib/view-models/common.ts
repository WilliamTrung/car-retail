export type Locale = "vi" | "en";

export interface Localized {
  vi: string;
  en: string;
}

/** Matches API attribute contract — labels composed client-side. */
export interface VehicleAttribute {
  key: string;
  value: string | number;
  unit?: string | null;
}

/** From getUnits(): unit key → localized label. */
export type UnitsMap = Record<string, Localized>;

export type SpecTranslate = (key: string) => string;

/**
 * Compose attribute label + display string.
 * Unknown `spec.*` keys fall back to the raw key (never throw).
 * Display: `"326 km"` from value + units map (or raw unit key).
 */
export function composeAttributeDisplay(
  attr: VehicleAttribute,
  units: UnitsMap,
  locale: Locale,
  t: SpecTranslate,
): { label: string; display: string } {
  let label: string;
  try {
    label = t(attr.key);
    if (!label) label = attr.key;
  } catch {
    label = attr.key;
  }

  const unitKey = attr.unit?.trim();
  let unitPart = "";
  if (unitKey) {
    const localized = units[unitKey];
    const unitLabel =
      (localized ? localized[locale] || localized.vi || localized.en : "") ||
      unitKey;
    unitPart = ` ${unitLabel}`;
  }

  return {
    label,
    display: `${attr.value}${unitPart}`,
  };
}

/** Pick locale string; empty `en` falls back to `vi`. */
export function resolveLocalized(
  field: Localized | string | null | undefined,
  locale: Locale,
): string {
  if (field == null) return "";
  if (typeof field === "string") return field;
  const primary = locale === "en" ? field.en : field.vi;
  return primary || field.vi || field.en || "";
}

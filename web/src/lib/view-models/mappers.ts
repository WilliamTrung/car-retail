import type { LocalizeHref } from "@/lib/i18n/localize-href";
import type { Locale, Localized, SpecTranslate, UnitsMap, VehicleAttribute } from "./common";
import { composeAttributeDisplay, resolveLocalized } from "./common";
import type { ModelCardVM } from "./model-card";
import type { ModelDetailVM, VariantVM } from "./model-detail";
import type { ShowroomVM } from "./showroom";
import type { SiteChromeVM } from "./site";

type Localizedish = Localized | string | null | undefined;

export type ModelCardSource = {
  id?: string | null;
  name?: Localizedish;
  slug?: Localizedish;
  tagline?: Localizedish;
  attributes?: Array<{
    key?: string | null;
    value?: string | number | boolean | null;
    unit?: string | null;
  }> | null;
  variants?: Array<{
    price?: number | null;
    published?: boolean | null;
  }> | null;
  heroMedia?: {
    publicUrl?: string | null;
    altText?: Localizedish;
  } | null;
  heroMediaUrl?: string | null;
  segment?: {
    key?: string | null;
    line?: { key?: string | null } | null;
  } | null;
  segmentKey?: string | null;
  isEv?: boolean | null;
  promoLine?: Localizedish;
  published?: boolean | null;
};

export type ModelDetailSource = ModelCardSource & {
  galleryMedia?: Array<{
    publicUrl?: string | null;
    altText?: Localizedish;
  }> | null;
  gallery?: string[] | null;
  colorSwatches?: Array<{
    name?: Localizedish;
    hex?: string | null;
    imageUrl?: string | null;
  }> | null;
  featureSections?: Array<{
    title?: Localizedish;
    body?: Localizedish;
    imageUrl?: string | null;
    imageMedia?: { publicUrl?: string | null } | null;
    sortOrder?: number | null;
  }> | null;
  faqs?: Array<{
    question?: Localizedish;
    answer?: Localizedish;
  }> | null;
  promo?: {
    bullets?: Localizedish[] | null;
    dateRange?: Localizedish | null;
  } | null;
  related?: ModelCardSource[] | null;
  variants?: Array<{
    id?: string | null;
    name?: Localizedish;
    price?: number | null;
    attributes?: ModelCardSource["attributes"];
    allowDeposit?: boolean | null;
    allowTestDrive?: boolean | null;
    published?: boolean | null;
    sortOrder?: number | null;
  }> | null;
};

export type ShowroomSource = {
  id?: string | null;
  name?: Localizedish;
  address?: Localizedish;
  city?: string | null;
  phone?: string | null;
  hours?: Localizedish;
  typeTag?: string | null;
  lat?: number | null;
  lng?: number | null;
  imageUrl?: string | null;
  imageMedia?: { publicUrl?: string | null } | null;
};

export type SiteChromeSource = {
  settings?: {
    dealerName?: Localizedish;
    legalEntity?: Localizedish;
    mst?: string | null;
    email?: string | null;
    copyright?: Localizedish;
    socialLinks?: Array<{ platform?: string | null; url?: string | null }> | null;
    brandStory?: unknown;
  } | null;
  hotlines?: Array<{ phone?: string | null; sortOrder?: number | null }> | null;
  showrooms?: ShowroomSource[] | null;
  headerMenu?: Array<{
    label?: Localizedish;
    routeKey?: string | null;
    visible?: boolean | null;
  }> | null;
  footerMenu?: Array<{
    label?: Localizedish;
    routeKey?: string | null;
    visible?: boolean | null;
  }> | null;
  zaloUrl?: string | null;
  workingHours?: string | null;
  hqAddress?: string | null;
};

function minVariantPrice(
  variants: ModelCardSource["variants"],
): number | null {
  if (!variants?.length) return null;
  let min: number | null = null;
  for (const v of variants) {
    if (v.published === false) continue;
    if (v.price == null || Number.isNaN(v.price)) continue;
    if (min == null || v.price < min) min = v.price;
  }
  return min;
}

function isEvModel(model: ModelCardSource): boolean {
  if (typeof model.isEv === "boolean") return model.isEv;
  const attrs = model.attributes ?? [];
  return attrs.some((a) => {
    const key = (a.key ?? "").toLowerCase();
    const val = String(a.value ?? "").toLowerCase();
    return (
      key.includes("ev") ||
      key.includes("electric") ||
      (key === "drivetrain" && val.includes("điện")) ||
      val.includes("ev") ||
      key === "battery"
    );
  });
}

function segmentOf(model: ModelCardSource): "personal" | "commercial" {
  const key = (
    model.segmentKey ||
    model.segment?.key ||
    model.segment?.line?.key ||
    ""
  ).toLowerCase();
  if (
    key.includes("commercial") ||
    key.includes("service") ||
    key.includes("dich-vu") ||
    key.includes("thuong-mai") ||
    key.includes("van")
  ) {
    return "commercial";
  }
  return "personal";
}

function toVehicleAttrs(
  raw: ModelCardSource["attributes"],
): VehicleAttribute[] {
  if (!raw) return [];
  const out: VehicleAttribute[] = [];
  for (const a of raw) {
    if (!a?.key) continue;
    if (a.value == null || typeof a.value === "boolean") continue;
    out.push({ key: a.key, value: a.value, unit: a.unit ?? null });
  }
  return out;
}

function composeSpecChips(
  attrs: VehicleAttribute[],
  units: UnitsMap,
  locale: Locale,
  t: SpecTranslate,
  limit = 3,
): string[] {
  const chips: string[] = [];
  for (const attr of attrs) {
    if (chips.length >= limit) break;
    chips.push(composeAttributeDisplay(attr, units, locale, t).display);
  }
  while (chips.length < limit) chips.push("—");
  return chips.slice(0, limit);
}

function slugFor(model: ModelCardSource, locale: Locale): string {
  return resolveLocalized(model.slug, locale) || model.id || "";
}

function detailHref(slug: string): string {
  return slug ? `/models/${slug}` : "/models";
}

function leadHref(slug: string): string {
  return slug
    ? `/book-test-drive?model=${encodeURIComponent(slug)}`
    : "/book-test-drive";
}

function withLocalize(href: string, localizeHref?: LocalizeHref): string {
  return localizeHref ? localizeHref(href) : href;
}

export function toModelCardVM(
  model: ModelCardSource | null | undefined,
  units: UnitsMap,
  t: SpecTranslate,
  locale: Locale,
  localizeHref?: LocalizeHref,
): ModelCardVM {
  const m = model ?? {};
  const slug = slugFor(m, locale);
  const name = resolveLocalized(m.name, locale) || "—";
  const tagline = resolveLocalized(m.tagline, locale);
  const attrs = toVehicleAttrs(m.attributes);
  const imageUrl =
    m.heroMedia?.publicUrl ?? m.heroMediaUrl ?? null;

  return {
    id: m.id ?? "",
    slug,
    name,
    taglineOverline: tagline ? tagline.toUpperCase() : "",
    imageUrl,
    imageAlt: resolveLocalized(m.heroMedia?.altText, locale) || name,
    isEv: isEvModel(m),
    specChips: composeSpecChips(attrs, units, locale, t, 3),
    priceFromVnd: minVariantPrice(m.variants),
    promoLine: resolveLocalized(m.promoLine, locale) || null,
    segment: segmentOf(m),
    detailHref: withLocalize(detailHref(slug), localizeHref),
    leadHref: withLocalize(leadHref(slug), localizeHref),
  };
}

function toVariantVM(
  variant: NonNullable<ModelDetailSource["variants"]>[number],
  units: UnitsMap,
  t: SpecTranslate,
  locale: Locale,
  index: number,
): VariantVM {
  const attrs = toVehicleAttrs(variant.attributes);
  return {
    id: variant.id ?? `variant-${index}`,
    name: resolveLocalized(variant.name, locale) || "—",
    priceVnd: variant.price ?? null,
    chips: composeSpecChips(attrs, units, locale, t, 3).filter((c) => c !== "—"),
    isDefault: index === 0,
    allowsDeposit: variant.allowDeposit !== false,
    allowsTestDrive: variant.allowTestDrive !== false,
  };
}

export function toModelDetailVM(
  model: ModelDetailSource | null | undefined,
  units: UnitsMap,
  t: SpecTranslate,
  locale: Locale,
  relatedModels: ModelCardSource[] = [],
  localizeHref?: LocalizeHref,
): ModelDetailVM {
  const m = model ?? {};
  const card = toModelCardVM(m, units, t, locale, localizeHref);
  const galleryMedia = m.galleryMedia ?? [];
  const thumbs = galleryMedia
    .map((g) => g.publicUrl)
    .filter((u): u is string => Boolean(u));
  const mainUrl = m.heroMedia?.publicUrl ?? thumbs[0] ?? null;

  const variantsRaw = [...(m.variants ?? [])].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );
  const variants = variantsRaw
    .filter((v) => v.published !== false)
    .map((v, i) => toVariantVM(v, units, t, locale, i));
  if (variants.length === 0) {
    variants.push({
      id: "default",
      name: card.name,
      priceVnd: card.priceFromVnd,
      chips: card.specChips.filter((c) => c !== "—"),
      isDefault: true,
      allowsDeposit: true,
      allowsTestDrive: true,
    });
  } else {
    variants[0] = { ...variants[0]!, isDefault: true };
  }

  const attrs = toVehicleAttrs(m.attributes);
  const specStrip = attrs.slice(0, 7).map((attr) => {
    const { label, display } = composeAttributeDisplay(attr, units, locale, t);
    return { key: attr.key, label, display };
  });

  const featureSections = (m.featureSections ?? []).map((fs, i) => ({
    title: resolveLocalized(fs.title, locale),
    body: resolveLocalized(fs.body, locale),
    imageUrl: fs.imageUrl ?? fs.imageMedia?.publicUrl ?? null,
    // Penpot 04: row 0 text|image → imageLeft false; then alternate
    imageLeft: i % 2 === 1,
  }));

  const faqs = (m.faqs ?? []).map((f) => ({
    q: resolveLocalized(f.question, locale),
    a: resolveLocalized(f.answer, locale),
  }));

  const related = (relatedModels.length ? relatedModels : m.related ?? [])
    .slice(0, 3)
    .map((r) => toModelCardVM(r, units, t, locale, localizeHref));

  const swatches = (m.colorSwatches ?? [])
    .slice(0, 9)
    .map((s) => ({
      name: resolveLocalized(s.name, locale),
      hex: s.hex ?? "#000000",
      imageUrl: s.imageUrl ?? null,
    }))
    .filter((s) => s.name || s.hex);

  return {
    id: card.id,
    slug: card.slug,
    name: card.name,
    taglineOverline: card.taglineOverline,
    isEv: card.isEv,
    gallery: {
      mainUrl,
      thumbs: thumbs.slice(0, 5),
      alt: card.imageAlt,
    },
    colorSwatches: swatches,
    priceFromVnd: card.priceFromVnd,
    variants,
    promo: m.promo
      ? {
          bullets: (m.promo.bullets ?? [])
            .slice(0, 5)
            .map((b) => resolveLocalized(b, locale))
            .filter(Boolean),
          dateRange: m.promo.dateRange
            ? resolveLocalized(m.promo.dateRange, locale) || null
            : null,
        }
      : null,
    featureSections,
    specStrip,
    related,
    faqs,
  };
}

function normalizeTypeTag(raw: string | null | undefined): "1S" | "2S" | "3S" {
  const t = (raw ?? "").toUpperCase().replace(/\s/g, "");
  if (t === "1S" || t.includes("1S")) return "1S";
  if (t === "2S" || t.includes("2S")) return "2S";
  return "3S";
}

function cityKeyFrom(city: string): string {
  const c = city
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (c.includes("ho-chi-minh") || c.includes("hcm") || c.includes("saigon")) {
    return "hcm";
  }
  if (c.includes("binh-duong")) return "binh-duong";
  return c || "other";
}

/** Display hotline with spaces; tel: strips non-digits (keep leading +). */
export function formatHotlineDisplay(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  const national = digits.replace(/^\+84/, "0").replace(/^84/, "0");
  if (national.length === 10) {
    return `${national.slice(0, 4)} ${national.slice(4, 6)} ${national.slice(6, 8)} ${national.slice(8)}`;
  }
  if (national.length === 11 && national.startsWith("1900")) {
    return `${national.slice(0, 4)} ${national.slice(4, 6)} ${national.slice(6, 8)} ${national.slice(8)}`;
  }
  return phone.trim();
}

export function toTelHref(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+")) return `tel:${cleaned}`;
  if (cleaned.startsWith("84")) return `tel:+${cleaned}`;
  return `tel:${cleaned}`;
}

function mapsUrlFor(s: ShowroomSource, address: string): string {
  if (s.lat != null && s.lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function toShowroomVM(
  showroom: ShowroomSource | null | undefined,
  locale: Locale,
  localizeHref?: LocalizeHref,
): ShowroomVM {
  const s = showroom ?? {};
  const id = s.id ?? "";
  const name = resolveLocalized(s.name, locale) || "—";
  const address = resolveLocalized(s.address, locale);
  const city = s.city ?? "";
  const phone = s.phone ?? "";

  return {
    id,
    name,
    typeTag: normalizeTypeTag(s.typeTag),
    address,
    hours: resolveLocalized(s.hours, locale),
    city,
    cityKey: cityKeyFrom(city),
    hotline: phone ? formatHotlineDisplay(phone) : "",
    mapsUrl: mapsUrlFor(s, address || city || name),
    imageUrl: s.imageUrl ?? s.imageMedia?.publicUrl ?? null,
    bookHref: withLocalize(
      id
        ? `/book-test-drive?showroom=${encodeURIComponent(id)}`
        : "/book-test-drive",
      localizeHref,
    ),
  };
}

const SOCIAL_KINDS = new Set([
  "facebook",
  "youtube",
  "zalo",
  "tiktok",
  "instagram",
] as const);

type SocialKind = SiteChromeVM["socials"][number]["kind"];

function routeKeyToHref(routeKey: string): string {
  if (!routeKey) return "/";
  if (routeKey.startsWith("/")) return routeKey;
  const map: Record<string, string> = {
    home: "/",
    models: "/models",
    news: "/news",
    about: "/about",
    contact: "/contact",
    policies: "/policies",
    support: "/support",
    "test-drive": "/book-test-drive",
    "book-test-drive": "/book-test-drive",
    deposit: "/deposit",
    showrooms: "/showrooms",
    showroom: "/showrooms",
  };
  return map[routeKey] ?? `/${routeKey}`;
}

export function toSiteChromeVM(
  settings: SiteChromeSource["settings"],
  hotlines: SiteChromeSource["hotlines"],
  showrooms: ShowroomSource[] | null | undefined,
  menuItems: {
    header?: SiteChromeSource["headerMenu"];
    footer?: SiteChromeSource["footerMenu"];
  },
  locale: Locale,
  extras?: {
    zaloUrl?: string | null;
    workingHours?: string | null;
    hqAddress?: string | null;
  },
): SiteChromeVM {
  const dealer = resolveLocalized(settings?.dealerName, locale) || "VOLTA AUTO";
  const parts = dealer.trim().split(/\s+/);
  const primary = parts[0] ?? "VOLTA";
  const accent = parts.slice(1).join(" ") || "AUTO";

  const primaryHotline =
    [...(hotlines ?? [])].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
    )[0]?.phone ?? "";

  const socials: SiteChromeVM["socials"] = [];
  for (const link of settings?.socialLinks ?? []) {
    const platform = (link.platform ?? "").toLowerCase();
    if (!SOCIAL_KINDS.has(platform as SocialKind)) continue;
    if (!link.url) continue;
    socials.push({ kind: platform as SocialKind, url: link.url });
  }

  const nav = (menuItems.header ?? [])
    .filter((m) => m.visible !== false)
    .map((m) => ({
      label: resolveLocalized(m.label, locale),
      href: routeKeyToHref(m.routeKey ?? "/"),
    }));

  const footerLinks = (menuItems.footer ?? [])
    .filter((m) => m.visible !== false)
    .map((m) => ({
      label: resolveLocalized(m.label, locale),
      href: routeKeyToHref(m.routeKey ?? "/"),
    }));

  const zaloFromSocial = socials.find((s) => s.kind === "zalo")?.url;
  const zaloUrl =
    extras?.zaloUrl || zaloFromSocial || "https://zalo.me/";

  return {
    logoText: { primary, accent },
    nav,
    hotline: {
      display: primaryHotline ? formatHotlineDisplay(primaryHotline) : "",
      tel: primaryHotline ? toTelHref(primaryHotline) : "",
    },
    zaloUrl,
    legal: {
      companyName: resolveLocalized(settings?.legalEntity, locale) || dealer,
      mst: settings?.mst ?? "",
      hqAddress: extras?.hqAddress ?? "",
      copyright: resolveLocalized(settings?.copyright, locale),
    },
    socials,
    showrooms: (showrooms ?? []).map((s) => toShowroomVM(s, locale)),
    footerLinks,
    contactEmail: settings?.email ?? "",
    workingHours: extras?.workingHours ?? "",
  };
}

/** Units DTO rows → UnitsMap. */
export function unitsToMap(
  rows: Array<{ key: string; value: Localized }> | null | undefined,
): UnitsMap {
  const map: UnitsMap = {};
  for (const row of rows ?? []) {
    if (!row?.key) continue;
    map[row.key] = row.value;
  }
  return map;
}

/** Normalize scraped model names to stable keys. */
export function modelKeyFromName(name) {
  const n = String(name || "")
    .toLowerCase()
    .replace(/vinfast/g, "")
    .trim();
  if (/vf\s*e34|e34/.test(n)) return "vf-e34";
  if (/mpv\s*7|mpv7/.test(n)) return "mpv-7";
  if (/limo\s*green/.test(n)) return "limo-green";
  if (/ec\s*van|ecvan/.test(n)) return "ec-van";
  if (/herio/.test(n)) return "herio-green";
  if (/nerio/.test(n)) return "nerio-green";
  if (/minio/.test(n)) return "minio-green";
  const vf = n.match(/vf\s*(\d+)/);
  if (vf) return `vf-${vf[1]}`;
  return n.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unknown";
}

/** @param {string} key */
export function segmentForKey(key) {
  if (key === "mpv-7" || key === "limo-green") return "mpv";
  if (key === "ec-van") return "van";
  if (key.startsWith("vf-")) return "suv";
  if (key.includes("green")) return "sedan";
  return "suv";
}

/** @param {string} key */
export function lineForSegment(segment) {
  return segment === "van" ? "commercial" : "personal";
}

/** Parse VND price from text. */
export function parseVndPrice(text) {
  if (!text) return null;
  const matches = [...String(text).matchAll(/(\d{1,3}(?:\.\d{3})+)\s*₫/g)];
  if (!matches.length) return null;
  const nums = matches.map((m) => Number(m[1].replace(/\./g, ""))).filter((n) => n > 100_000_000);
  return nums.length ? Math.min(...nums) : null;
}

/** Extract numeric specs from page text. */
export function parseAttributes(text) {
  const attrs = [];
  const range = text.match(/(\d{2,4})\s*km/i);
  if (range) attrs.push({ key: "range", value: Number(range[1]), unit: "km" });
  const power = text.match(/(\d{2,3})\s*kW/i);
  if (power) attrs.push({ key: "power", value: Number(power[1]), unit: "kW" });
  const battery = text.match(/(\d{2,3}(?:\.\d)?)\s*kWh/i);
  if (battery) attrs.push({ key: "battery", value: Number(battery[1]), unit: "kWh" });
  const seats = text.match(/(\d)\s*ch[ỗo]/i) || text.match(/(\d)\s*seats/i);
  if (seats) attrs.push({ key: "seats", value: Number(seats[1]), unit: "seats" });
  return attrs;
}

/**
 * Merge models from multiple site scrapes.
 * @param {Array<{ site: object, models: object[], heroes?: object[], news?: object[] }>} siteResults
 */
export function normalizeManifest(siteResults) {
  const byKey = new Map();
  const heroes = [];
  const news = [];
  const layoutNotes = [];
  const warnings = [];

  for (const result of siteResults.sort((a, b) => a.site.priority - b.site.priority)) {
    if (result.layoutNotes) layoutNotes.push({ site: result.site.id, ...result.layoutNotes });
    for (const hero of result.heroes || []) heroes.push({ ...hero, sourceSite: result.site.id });
    for (const item of result.news || []) news.push({ ...item, sourceSite: result.site.id });

    for (const raw of result.models || []) {
      const key = raw.key || modelKeyFromName(raw.name?.vi || raw.name);
      if (!key || key === "unknown") {
        warnings.push(`Skipped model without key: ${JSON.stringify(raw.name)}`);
        continue;
      }

      const existing = byKey.get(key);
      const merged = existing
        ? mergeModel(existing, raw, result.site)
        : {
            key,
            name: raw.name || { vi: key, en: key },
            slug: raw.slug || slugFromKey(key, raw.detailUrl),
            segment: raw.segment || segmentForKey(key),
            tagline: raw.tagline || null,
            description: raw.description || null,
            attributes: raw.attributes || [],
            variants: raw.variants || [],
            images: raw.images || [],
            featureSections: raw.featureSections || [],
            faqs: raw.faqs || [],
            sources: [{ site: result.site.id, url: raw.detailUrl || result.site.baseUrl }],
          };

      byKey.set(key, merged);
    }
  }

  const models = [...byKey.values()].sort((a, b) => a.key.localeCompare(b.key));
  return {
    scrapedAt: new Date().toISOString(),
    models,
    heroes: dedupeHeroes(heroes).slice(0, 5),
    news: dedupeNews(news).slice(0, 6),
    layoutNotes: mergeLayoutNotes(layoutNotes),
    warnings,
  };
}

function slugFromKey(key, url) {
  let vi = key;
  if (url) {
    try {
      const path = new URL(url).pathname.replace(/^\/|\/$/g, "");
      if (path) vi = path;
    } catch {
      /* ignore */
    }
  }
  const en = key;
  return { vi, en };
}

/** Strip SEO suffixes from scraped titles. */
export function cleanModelName(name) {
  return String(name || "")
    .replace(/\s*[-|–—]\s*VinFast.*$/i, "")
    .replace(/:\s*Thông số.*$/i, "")
    .replace(/\s*-\s*VinFast\s*Đông.*$/i, "")
    .trim();
}

function mergeModel(existing, incoming, site) {
  const dealer = site.type === "wordpress-dealer";
  return {
    ...existing,
    name: dealer && incoming.name
      ? { vi: cleanModelName(incoming.name.vi), en: cleanModelName(incoming.name.en || incoming.name.vi) }
      : existing.name || incoming.name,
    slug: dealer && incoming.slug ? incoming.slug : existing.slug || incoming.slug,
    tagline: dealer && incoming.tagline ? incoming.tagline : existing.tagline || incoming.tagline,
    description: dealer && incoming.description ? incoming.description : existing.description || incoming.description,
    attributes: incoming.attributes?.length ? incoming.attributes : existing.attributes,
    variants: mergeVariants(existing.variants, incoming.variants),
    images: mergeImages(existing.images, incoming.images),
    featureSections: [...existing.featureSections, ...(incoming.featureSections || [])].slice(0, 6),
    faqs: [...existing.faqs, ...(incoming.faqs || [])].slice(0, 8),
    sources: [...existing.sources, { site: site.id, url: incoming.detailUrl }].filter(
      (s, i, arr) => arr.findIndex((x) => x.url === s.url) === i
    ),
  };
}

function mergeVariants(a = [], b = []) {
  const map = new Map();
  for (const v of [...a, ...b]) {
    const k = (v.name?.vi || v.name || "").toLowerCase();
    if (!k) continue;
    const prev = map.get(k);
    map.set(k, prev ? { ...prev, price: prev.price ?? v.price } : v);
  }
  return [...map.values()];
}

function mergeImages(a = [], b = []) {
  const seen = new Set();
  const out = [];
  for (const img of [...a, ...b]) {
    const url = img.url?.split("?")[0];
    if (!url || seen.has(url) || /logo|icon|favicon/i.test(url)) continue;
    seen.add(url);
    out.push({ ...img, url });
  }
  return out;
}

function dedupeHeroes(heroes) {
  const seen = new Set();
  return heroes.filter((h) => {
    const k = h.imageUrl?.split("?")[0];
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function dedupeNews(items) {
  const seen = new Set();
  return items.filter((n) => {
    const k = n.url || n.title?.vi;
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function mergeLayoutNotes(notes) {
  const dealer = notes.find((n) => n.type === "wordpress-dealer") || notes[0];
  const oem = notes.find((n) => n.type === "oem-spa");
  return {
    listPage: dealer?.listPage || {},
    detailPage: dealer?.detailPage || {},
    oemListPage: oem?.listPage || {},
    oemDetailPage: oem?.detailPage || {},
    sites: notes.map((n) => ({ id: n.site, type: n.type, listPage: n.listPage, detailPage: n.detailPage })),
  };
}

/** v1 cars-only keys (exclude OEM gasoline / corporate pages). */
export const ALLOWED_MODEL_KEYS = new Set([
  "vf-3", "vf-5", "vf-6", "vf-7", "vf-8", "vf-9", "vf-e34",
  "mpv-7", "limo-green", "ec-van", "herio-green", "minio-green", "nerio-green",
]);

export function filterCatalogModels(models) {
  return models.filter((m) => ALLOWED_MODEL_KEYS.has(m.key));
}

export function sanitizeSlug(slug, key) {
  const vi = String(slug?.vi || key).split("/").filter(Boolean).pop() || key;
  const en = String(slug?.en || key).split("/").filter(Boolean).pop() || key;
  return { vi, en };
}

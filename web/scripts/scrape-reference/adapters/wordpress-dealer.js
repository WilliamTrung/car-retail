import { MODEL_PATTERNS } from "../sites.js";
import { modelKeyFromName, parseAttributes, parseVndPrice, segmentForKey } from "../normalize.js";

const MODEL_LINK_RE =
  /\/(vinfast-)?(vf-?\d+|vf-e34|vf\d|mpv-?7|limo-green|ec-van|vinfast-ec-van|herio|nerio|minio)[/\?-]/i;

/**
 * @param {import('playwright').Page} page
 * @param {{ id: string, baseUrl: string }} site
 */
export async function scrapeWordPressDealer(page, site) {
  await page.goto(site.baseUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2000);

  const modelLinks = await page.evaluate((patterns) => {
    const reList = patterns.map((p) => new RegExp(p.source, p.flags));
    const links = new Map();
    for (const a of document.querySelectorAll("a[href]")) {
      const href = a.href;
      const text = a.textContent?.trim() || "";
      const combined = `${text} ${href}`;
      if (!reList.some((re) => re.test(combined)) && !/\/vf|mpv|limo|ec-van|ecvan/i.test(href)) continue;
      if (href.includes("#") || href.includes("category") || href.includes("tin-tuc")) continue;
      const key = href.split("?")[0];
      if (!links.has(key)) links.set(key, { url: key, text: text || href });
    }
    return [...links.values()];
  }, MODEL_PATTERNS.map((p) => ({ source: p.source, flags: p.flags })));

  const models = [];
  for (const link of modelLinks.slice(0, 14)) {
    try {
      const model = await scrapeModelDetail(page, link, site);
      if (model) models.push(model);
    } catch (err) {
      console.warn(`  warn ${site.id} ${link.url}: ${err.message}`);
    }
  }

  const heroes = await scrapeHeroBanners(page, site);
  const news = await scrapeNews(page, site);

  return { models, heroes, news };
}

/**
 * @param {import('playwright').Page} page
 * @param {{ url: string, text: string }} link
 * @param {{ id: string }} site
 */
async function scrapeModelDetail(page, link, site) {
  if (!MODEL_LINK_RE.test(link.url) && !MODEL_PATTERNS.some((p) => p.test(link.text))) return null;

  await page.goto(link.url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1500);

  const data = await page.evaluate(() => {
    const bodyText = document.body.innerText || "";
    const title =
      document.querySelector("h1")?.textContent?.trim() ||
      document.title.replace(/\s*-\s*.+$/, "").trim();
    const headings = [...document.querySelectorAll("h2, h3")]
      .map((h) => h.textContent?.trim())
      .filter(Boolean)
      .slice(0, 8);

    const imgs = [...document.querySelectorAll("img[src]")]
      .map((img) => img.src)
      .filter((src) => /wp-content\/uploads/i.test(src) && !/logo|icon/i.test(src))
      .map((src) => src.split("?")[0]);

    const uniqueImgs = [...new Set(imgs)];

    const prices = [...bodyText.matchAll(/(\d{1,3}(?:\.\d{3})+)\s*₫/g)].map((m) => m[0]);

    return { title, headings, bodyText: bodyText.slice(0, 8000), imgs: uniqueImgs, prices };
  });

  const nameVi = data.title.replace(/VinFast\s*/i, "").trim() || link.text;
  const key = modelKeyFromName(nameVi);
  if (!key || key === "unknown") return null;

      const slugPath = new URL(link.url).pathname.replace(/^\/|\/$/g, "");
      const slugLeaf = slugPath.split("/").filter(Boolean).pop() || key;
  const attributes = parseAttributes(data.bodyText);
  const priceFrom = parseVndPrice(data.prices.join(" "));

  const images = data.imgs.slice(0, 12).map((url, i) => ({
    url,
    role: i === 0 ? "hero" : "gallery",
    sourceSite: site.id,
  }));

  const featureSections = data.headings.slice(0, 4).map((h, i) => ({
    title: { vi: h, en: h },
    body: { vi: h, en: h },
    sortOrder: i + 1,
  }));

  return {
    key,
    name: { vi: nameVi, en: nameVi },
    slug: { vi: slugLeaf || key, en: key },
    segment: segmentForKey(key),
    tagline: data.headings[0] ? { vi: data.headings[0], en: data.headings[0] } : null,
    description: data.headings[1]
      ? { vi: data.headings.slice(0, 3).join(". "), en: data.headings.slice(0, 3).join(". ") }
      : null,
    attributes,
    variants: priceFrom
      ? [{ name: { vi: "Giá từ", en: "From" }, price: priceFrom, published: true }]
      : [{ name: { vi: "Tiêu chuẩn", en: "Standard" }, published: true }],
    images,
    featureSections,
    faqs: [],
    detailUrl: link.url,
  };
}

/** @param {import('playwright').Page} page @param {{ id: string, baseUrl: string }} site */
async function scrapeHeroBanners(page, site) {
  await page.goto(site.baseUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
  const banners = await page.evaluate(() => {
    return [...document.querySelectorAll("img[src*='wp-content'], [style*='background-image']")]
      .map((el) => {
        if (el.tagName === "IMG") return el.src;
        const m = el.getAttribute("style")?.match(/url\(['"]?([^'")]+)/);
        return m?.[1];
      })
      .filter((u) => u && /wp-content\/uploads/i.test(u) && !/logo|thumb/i.test(u))
      .map((u) => u.split("?")[0]);
  });
  const unique = [...new Set(banners)];
  return unique.slice(0, 3).map((imageUrl, i) => ({
    id: `hero-${site.id}-${i + 1}`,
    title: { vi: "Khuyến mãi", en: "Promotion" },
    subtitle: { vi: "Ưu đãi đặc biệt", en: "Special offer" },
    imageUrl,
    sortOrder: i + 1,
  }));
}

/** @param {import('playwright').Page} page @param {{ id: string, baseUrl: string }} site */
async function scrapeNews(page, site) {
  const newsUrl = new URL("/tin-tuc/", site.baseUrl).href;
  try {
    await page.goto(newsUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
  } catch {
    return [];
  }

  return page.evaluate(() => {
    const items = [];
    for (const a of document.querySelectorAll("article a, .post a, h2 a, h3 a")) {
      const href = a.href;
      const title = a.textContent?.trim();
      if (!href || !title || href.includes("/category/")) continue;
      const img = a.closest("article")?.querySelector("img")?.src || a.parentElement?.querySelector("img")?.src;
      items.push({
        url: href,
        title: { vi: title.slice(0, 120), en: title.slice(0, 120) },
        imageUrl: img?.split("?")[0],
      });
      if (items.length >= 4) break;
    }
    return items;
  });
}

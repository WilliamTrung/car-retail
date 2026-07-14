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
      if (!reList.some((re) => re.test(combined)) && !/\/vf|mpv|limo|ec-van|ecvan|minio|herio|nerio/i.test(href)) {
        continue;
      }
      if (href.includes("#") || href.includes("category") || href.includes("tin-tuc")) continue;
      const key = href.split("?")[0];
      const score = /\/san-pham\//i.test(href) ? 2 : /\/danh-muc\//i.test(href) ? 1 : 0;
      const prev = links.get(key);
      if (!prev || score > prev.score) {
        links.set(key, { url: key, text: text || href, score });
      }
    }
    return [...links.values()].sort((a, b) => b.score - a.score);
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
    const NOISE = /^(mô tả|thông số|đăng ký|liên hệ|hỗ trợ|tin tức|danh mục|sản phẩm|trang chủ)$/i;

    const title =
      document.querySelector(".product_title, h1.entry-title, h1")?.textContent?.trim() ||
      document.title.replace(/\s*[-|–—]\s*.+$/, "").trim();

    const root =
      document.querySelector(".product, .single-product, .woocommerce") ||
      document.querySelector("main") ||
      document.body;

    const highlights = [];
    for (const ul of root.querySelectorAll(
      ".summary ul, .woocommerce-product-details__short-description ul, .product-summary ul, .entry-summary ul"
    )) {
      for (const li of ul.querySelectorAll("li")) {
        const t = li.textContent?.trim().replace(/\s+/g, " ");
        if (t && t.length > 4 && !NOISE.test(t)) highlights.push(t);
      }
    }

    const descRoot =
      document.querySelector("#tab-description") ||
      document.querySelector(".woocommerce-Tabs-panel--description") ||
      document.querySelector(".product-description") ||
      document.querySelector(".entry-content");

    const paragraphs = [];
    const featureSections = [];

    if (descRoot) {
      for (const p of descRoot.querySelectorAll("p")) {
        const t = p.textContent?.trim().replace(/\s+/g, " ");
        if (t && t.length > 35 && !NOISE.test(t)) paragraphs.push(t);
      }

      for (const h of descRoot.querySelectorAll("h2, h3, h4")) {
        const heading = h.textContent?.trim().replace(/\s+/g, " ");
        if (!heading || heading.length < 8 || NOISE.test(heading)) continue;

        let body = "";
        let el = h.nextElementSibling;
        while (el && !/^H[2-4]$/i.test(el.tagName)) {
          if (el.tagName === "P") {
            body = el.textContent?.trim().replace(/\s+/g, " ");
            if (body && body !== heading) break;
          } else if (el.tagName === "UL" || el.tagName === "OL") {
            const items = [...el.querySelectorAll("li")]
              .map((li) => li.textContent?.trim().replace(/\s+/g, " "))
              .filter((t) => t && t.length > 8);
            if (items.length) {
              body = items.join(". ");
              break;
            }
          } else if (el.tagName === "DIV") {
            const innerP = el.querySelector("p");
            const candidate = (innerP || el).textContent?.trim().replace(/\s+/g, " ");
            if (candidate && candidate.length > 35 && candidate !== heading) {
              body = candidate;
              break;
            }
          }
          el = el.nextElementSibling;
        }

        const img =
          h.parentElement?.querySelector("img")?.src ||
          h.nextElementSibling?.querySelector("img")?.src;
        featureSections.push({
          title: heading,
          body: body || heading,
          imageUrl: img ? img.split("?")[0] : null,
        });
      }
    }

    const galleryImgs = [
      ...document.querySelectorAll(
        ".woocommerce-product-gallery img, .flex-control-thumbs img, figure.woocommerce-product-gallery__image img, .product-gallery img"
      ),
    ]
      .map((img) => img.src || img.dataset?.src || img.getAttribute("data-large_image"))
      .filter(Boolean)
      .map((s) => s.split("?")[0]);

    const contentImgs = [...root.querySelectorAll("img[src]")]
      .map((img) => img.src)
      .filter((src) => /wp-content\/uploads/i.test(src) && !/logo|icon|100x100|button\.gif/i.test(src))
      .map((src) => src.split("?")[0]);

    const imgs = [...new Set([...galleryImgs, ...contentImgs])];

    const bodyText = root.innerText || "";
    const prices = [...bodyText.matchAll(/(\d{1,3}(?:\.\d{3})+)\s*₫/g)].map((m) => m[0]);

    return { title, highlights, paragraphs, featureSections, imgs, prices, bodyText: bodyText.slice(0, 8000) };
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

  const featureSections = (data.featureSections.length ? data.featureSections : [])
    .slice(0, 6)
    .map((s, i) => ({
      title: { vi: s.title, en: s.title },
      body: { vi: s.body, en: s.body },
      imageUrl: s.imageUrl,
      sortOrder: i + 1,
    }));

  const leadParagraph = data.paragraphs[0] || null;

  return {
    key,
    name: { vi: nameVi, en: nameVi },
    slug: { vi: slugLeaf || key, en: key },
    segment: segmentForKey(key),
    tagline: leadParagraph
      ? { vi: leadParagraph.slice(0, 120), en: leadParagraph.slice(0, 120) }
      : data.highlights[0]
        ? { vi: data.highlights[0], en: data.highlights[0] }
        : null,
    description: leadParagraph
      ? { vi: data.paragraphs.slice(0, 3).join(" "), en: data.paragraphs.slice(0, 3).join(" ") }
      : null,
    paragraphs: data.paragraphs,
    highlights: data.highlights,
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

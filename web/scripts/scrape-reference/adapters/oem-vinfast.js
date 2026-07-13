import { modelKeyFromName, parseAttributes, segmentForKey } from "../normalize.js";

/**
 * @param {import('playwright').Page} page
 * @param {{ id: string, baseUrl: string }} site
 */
export async function scrapeOemSite(page, site) {
  await page.goto(site.baseUrl, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForTimeout(3000);

  const modelLinks = await page.evaluate(() => {
    const links = new Map();
    for (const a of document.querySelectorAll("a[href]")) {
      const href = a.href;
      const text = a.textContent?.trim() || "";
      if (!/vinfastauto\.com/i.test(href)) continue;
      if (!/vf|mpv|limo|van|herio|nerio|minio|e34|o-to|car|xe/i.test(`${text} ${href}`)) continue;
      if (href.includes("javascript:") || href.endsWith("/vn_vi") || href.endsWith("/vn_vi/")) continue;
      const clean = href.split("?")[0];
      if (!links.has(clean)) links.set(clean, { url: clean, text: text || clean });
    }
    return [...links.values()].slice(0, 16);
  });

  const models = [];
  for (const link of modelLinks) {
    try {
      const model = await scrapeOemDetail(page, link, site);
      if (model) models.push(model);
    } catch (err) {
      console.warn(`  warn OEM ${link.url}: ${err.message}`);
    }
  }

  if (!models.length) {
    console.warn("  OEM: no models parsed — dealer sites will supply catalog.");
  }

  return { models, heroes: [], news: [] };
}

/** @param {import('playwright').Page} page @param {{ url: string, text: string }} link @param {{ id: string }} site */
async function scrapeOemDetail(page, link, site) {
  await page.goto(link.url, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForTimeout(2000);

  const data = await page.evaluate(() => {
    const title = document.querySelector("h1")?.textContent?.trim() || document.title.split("|")[0].trim();
    const bodyText = document.body.innerText?.slice(0, 12000) || "";
    const headings = [...document.querySelectorAll("h2, h3")].map((h) => h.textContent?.trim()).filter(Boolean);
    const imgs = [...document.querySelectorAll("img[src]")]
      .map((i) => i.src)
      .filter((s) => !/logo|icon|svg/i.test(s))
      .map((s) => s.split("?")[0]);
    return { title, bodyText, headings, imgs: [...new Set(imgs)] };
  });

  const nameVi = data.title.replace(/VinFast\s*/i, "").trim() || link.text;
  const key = modelKeyFromName(nameVi);
  if (!key || key === "unknown") return null;

  const attributes = parseAttributes(data.bodyText);
  const slugPart = link.url.split("/").filter(Boolean).pop() || key;

  return {
    key,
    name: { vi: nameVi, en: nameVi },
    slug: { vi: slugPart, en: key },
    segment: segmentForKey(key),
    tagline: data.headings[0] ? { vi: data.headings[0], en: data.headings[0] } : null,
    description: data.headings[1]
      ? { vi: data.headings.slice(0, 2).join(". "), en: data.headings.slice(0, 2).join(". ") }
      : null,
    attributes,
    variants: [{ name: { vi: "Tiêu chuẩn", en: "Standard" }, published: true }],
    images: data.imgs.slice(0, 8).map((url, i) => ({ url, role: i === 0 ? "hero" : "gallery", sourceSite: site.id })),
    featureSections: data.headings.slice(0, 3).map((h, i) => ({
      title: { vi: h, en: h },
      body: { vi: h, en: h },
      sortOrder: i + 1,
    })),
    faqs: [],
    detailUrl: link.url,
  };
}

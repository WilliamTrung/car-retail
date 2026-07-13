/**
 * Playwright reference scraper — dev seed manifest only.
 * Usage: npm run scrape:reference
 */
import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { chromium } from "playwright";
import { scrapeWordPressDealer } from "./adapters/wordpress-dealer.js";
import { scrapeOemSite } from "./adapters/oem-vinfast.js";
import { captureLayoutNotes, screenshotPage } from "./layout-notes.js";
import { normalizeManifest } from "./normalize.js";
import { REFERENCE_SITES } from "./sites.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "output");
const MANIFEST_PATH = join(OUT_DIR, "manifest.json");
const SCREENSHOT_DIR = join(OUT_DIR, "screenshots");

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    viewport: { width: 1440, height: 900 },
    locale: "vi-VN",
  });
  const page = await context.newPage();

  const siteResults = [];

  for (const site of REFERENCE_SITES) {
    console.log(`\n=== ${site.label} ===`);
    try {
      let scraped;
      if (site.type === "oem-spa") {
        scraped = await scrapeOemSite(page, site);
      } else {
        scraped = await scrapeWordPressDealer(page, site);
      }

      const layoutNotes = await captureLayoutNotes(page, site);
      await screenshotPage(page, join(SCREENSHOT_DIR, `${site.id}-home.png`));

      if (scraped.models[0]?.detailUrl) {
        await page.goto(scraped.models[0].detailUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
        await screenshotPage(page, join(SCREENSHOT_DIR, `${site.id}-detail.png`));
      }

      siteResults.push({
        site,
        models: scraped.models,
        heroes: scraped.heroes,
        news: scraped.news,
        layoutNotes,
      });

      console.log(`  models: ${scraped.models.length}, heroes: ${scraped.heroes?.length || 0}, news: ${scraped.news?.length || 0}`);
    } catch (err) {
      console.error(`  ERROR ${site.id}:`, err.message);
      siteResults.push({ site, models: [], heroes: [], news: [], layoutNotes: null, error: err.message });
    }
  }

  await browser.close();

  const manifest = normalizeManifest(siteResults);
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf8");
  console.log(`\nWrote ${MANIFEST_PATH} (${manifest.models.length} models)`);
  if (manifest.warnings.length) {
    console.log("Warnings:", manifest.warnings.slice(0, 5).join("; "));
  }
  console.log("Next: npm run scrape:generate");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

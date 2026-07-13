/**
 * Extended UI smoke + visual checks for dealer alignment.
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE = process.env.UI_TEST_BASE || "http://localhost:3000";
const OUT = path.join(process.cwd(), "scripts", "ui-smoke-output");
const failures = [];
const consoleErrors = [];

function fail(msg) {
  failures.push(msg);
  console.error(`FAIL: ${msg}`);
}

async function shot(page, name) {
  fs.mkdirSync(OUT, { recursive: true });
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false });
}

async function checkPage(page, url, checks) {
  const res = await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
  if (!res || res.status() !== 200) fail(`${url} status ${res?.status()}`);
  for (const check of checks) {
    await check(page, url);
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  // Desktop
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const t = msg.text();
      if (!/favicon|404|hydration/i.test(t)) consoleErrors.push(t);
    }
  });

  await checkPage(page, `${BASE}/vi`, [
    async (p) => {
      if (!(await p.locator("#lineup").isVisible())) fail("Home: lineup missing");
      const track = p.locator('[class*="VehicleLineup_track__"]');
      if (!(await track.isVisible())) fail("Home: lineup track missing");
      await shot(p, "home-desktop");
    },
    async (p) => {
      await p.getByRole("button", { name: /Dòng xe/i }).hover();
      const panel = p.locator('[class*="modelsPanel"]');
      if (!(await panel.isVisible())) fail("Header: models panel not shown on click");
      await shot(p, "header-models-desktop");
    },
  ]);

  await checkPage(page, `${BASE}/vi/models/vf-3`, [
    async (p) => {
      const hero = p.locator('[class*="modelHeroDealer"]');
      if (!(await hero.isVisible())) fail("Model: dealer hero missing");
      const img = hero.locator("img").first();
      const box = await img.boundingBox();
      if (!box || box.width < 50) fail("Model: hero image too small or missing");
      await shot(p, "model-hero-desktop");
    },
    async (p) => {
      const variants = p.locator('[class*="VariantCards"] article, section[class*="sectionDealer"] article');
      if ((await variants.count()) < 1) fail("Model: no variant cards");
    },
    async (p) => {
      const features = p.locator('[class*="ModelFeatureSections"] article, [class*="featuresWrap"] + div article');
      if ((await features.count()) < 1) {
        const alt = p.locator('[class*="block"]').first();
        if (!(await alt.isVisible())) fail("Model: no feature sections");
      }
      await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await shot(p, "model-features-desktop");
    },
    async (p) => {
      await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      const sticky = p.locator('[class*="stickyBar"]');
      if (!(await sticky.isVisible())) fail("Model: sticky bar not visible after scroll");
      await shot(p, "model-sticky-desktop");
    },
  ]);

  await checkPage(page, `${BASE}/vi/dang-ky-lai-thu`, [
    async (p) => {
      if (!(await p.locator("form").isVisible())) fail("Test drive form missing");
      await shot(p, "test-drive-desktop");
    },
  ]);

  // Mobile
  await ctx.close();
  const mobileCtx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobile = await mobileCtx.newPage();
  mobile.on("console", (msg) => {
    if (msg.type() === "error") {
      const t = msg.text();
      if (!/favicon|404|hydration/i.test(t)) consoleErrors.push(`[mobile] ${t}`);
    }
  });

  await checkPage(mobile, `${BASE}/vi`, [
    async (p) => {
      const card = p.locator("#lineup article").first();
      if (!(await card.isVisible())) fail("Mobile home: card missing");
      const box = await card.boundingBox();
      if (box && box.width > 400) fail(`Mobile home: card too wide (${box.width}px)`);
      await shot(p, "home-mobile");
    },
    async (p) => {
      await p.getByRole("button", { name: /^Menu$/i }).click();
      const nav = p.locator("#site-nav");
      if (!(await nav.isVisible())) fail("Mobile: nav drawer not open");
      await shot(p, "header-mobile-menu");
    },
  ]);

  await checkPage(mobile, `${BASE}/vi/models/vf-3`, [
    async (p) => {
      await shot(p, "model-hero-mobile");
      const cta = p.getByRole("link", { name: /lái thử|test drive/i }).first();
      if (!(await cta.isVisible())) fail("Mobile model: CTA missing");
    },
  ]);

  await mobileCtx.close();
  await browser.close();

  if (consoleErrors.length) {
    console.error("\nConsole errors:");
    [...new Set(consoleErrors)].forEach((e) => console.error(`  ${e}`));
    failures.push(`${consoleErrors.length} console error(s)`);
  }

  if (failures.length) {
    console.error(`\n${failures.length} failure(s). Screenshots in ${OUT}`);
    process.exit(1);
  }

  console.log(`PASS: extended UI test OK. Screenshots: ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

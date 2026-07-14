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

async function dismissPromoModal(page) {
  const backdrop = page.locator('[class*="PromoModal_backdrop"]');
  if (await backdrop.isVisible({ timeout: 2000 }).catch(() => false)) {
    const close = page.locator('[class*="PromoModal_closeBtn"]');
    if (await close.isVisible().catch(() => false)) {
      await close.click();
    } else {
      await page.keyboard.press("Escape");
    }
    await backdrop.waitFor({ state: "hidden", timeout: 5000 }).catch(() => {});
  }
}

async function checkPage(page, url, checks) {
  const res = await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
  if (!res || res.status() !== 200) fail(`${url} status ${res?.status()}`);
  await dismissPromoModal(page);
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
      const card = p.locator("#lineup a[class*='VehicleCard_card']").first();
      if (!(await card.isVisible())) fail("Home: vehicle card missing");
      const cardBtns = p.locator("#lineup a[class*='VehicleCard'] button");
      if ((await cardBtns.count()) > 0) fail("Home: vehicle cards should not have buttons");
      await card.hover();
      await shot(p, "card-hover-desktop");
    },
  ]);

  await checkPage(page, `${BASE}/vi/models/vf-3`, [
    async (p) => {
      const gallery = p.locator('[class*="ModelGallery_root"]');
      if (!(await gallery.isVisible())) fail("Model: gallery missing");
      const img = p.locator('[class*="ModelGallery_mainImage"]').first();
      if (!(await img.isVisible())) fail("Model: gallery image missing");
      await shot(p, "model-detail-desktop");
    },
    async (p) => {
      const price = p.locator('[class*="productPrice"]').first();
      if (!(await price.isVisible())) fail("Model: price missing");
      const quoteCta = p.getByRole("link", { name: /báo giá|quote/i });
      if (!(await quoteCta.isVisible())) fail("Model: quote CTA missing");
    },
    async (p) => {
      const tab = p.getByRole("tab", { name: /Mô tả|Description/i });
      if (!(await tab.isVisible())) fail("Model: tabs missing");
      await tab.click();
      await p.getByRole("tab", { name: /Thông số|Specifications/i }).click();
      await shot(p, "model-specs-tab-desktop");
    },
    async (p) => {
      const sticky = p.locator('[class*="stickyBar"]');
      if (!(await sticky.isVisible())) fail("Model: sticky bar missing");
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
      const card = p.locator("#lineup a[class*='VehicleCard_card']").first();
      if (!(await card.isVisible())) fail("Mobile home: card missing");
      const cardBtns = p.locator("#lineup a[class*='VehicleCard'] button");
      if ((await cardBtns.count()) > 0) fail("Mobile home: card has buttons");
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
      await shot(p, "model-detail-mobile");
      const quoteCta = p.getByRole("link", { name: /báo giá|quote/i }).first();
      if (!(await quoteCta.isVisible())) fail("Mobile model: quote CTA missing");
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

/**
 * Local UI smoke test for dealer alignment (run against npm run dev on :3000).
 * Usage: node scripts/ui-smoke-test.js
 */
import { chromium } from "playwright";

const BASE = process.env.UI_TEST_BASE || "http://localhost:3000";
const failures = [];
const consoleErrors = [];

function fail(msg) {
  failures.push(msg);
  console.error(`FAIL: ${msg}`);
}

async function dismissPromoModal(page) {
  const backdrop = page.locator('[class*="PromoModal_backdrop"]');
  if (await backdrop.isVisible({ timeout: 2000 }).catch(() => false)) {
    const close = page.locator('[class*="PromoModal_closeBtn"]');
    if (await close.isVisible().catch(() => false)) await close.click();
    else await page.keyboard.press("Escape");
    await backdrop.waitFor({ state: "hidden", timeout: 5000 }).catch(() => {});
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      if (!text.includes("favicon") && !text.includes("404")) {
        consoleErrors.push(`[${page.url()}] ${text}`);
      }
    }
  });

  // Home
  const homeRes = await page.goto(`${BASE}/vi`, { waitUntil: "networkidle", timeout: 30000 });
  if (!homeRes || homeRes.status() !== 200) fail(`Home /vi status ${homeRes?.status()}`);
  await dismissPromoModal(page);

  const lineup = page.locator("#lineup");
  if (!(await lineup.isVisible())) fail("Home: #lineup section missing");
  const cards = page.locator("#lineup a[class*='VehicleCard_card']");
  if ((await cards.count()) < 1) fail("Home: no vehicle cards in lineup");
  const cardButtons = page.locator("#lineup a[class*='VehicleCard'] button");
  if ((await cardButtons.count()) > 0) fail("Home: vehicle cards should not have buttons");
  const href = await cards.first().getAttribute("href");
  if (!href || !href.includes("/models/")) fail("Home: card should link to model detail");

  const modelsTrigger = page.getByRole("button", { name: /Dòng xe/i });
  if (!(await modelsTrigger.isVisible())) fail("Header: Models dropdown trigger missing");
  await modelsTrigger.click();
  const expanded = await modelsTrigger.getAttribute("aria-expanded");
  if (expanded !== "true") fail("Header: models dropdown should open on click");

  await cards.first().click();
  await page.waitForURL(/\/models\//, { timeout: 10000 });

  // Model detail (known slug)
  await page.goto(`${BASE}/vi/models/vf-3`, { waitUntil: "networkidle", timeout: 30000 });
  await dismissPromoModal(page);
  const h1 = page.locator("h1").first();
  if (!(await h1.isVisible())) fail("Model: product title missing");
  const heroImg = page.locator('[class*="ModelGallery_mainImage"]').first();
  if (!(await heroImg.isVisible())) fail("Model: gallery main image missing");

  const productPrice = page.locator('[class*="productPrice"]').first();
  if (!(await productPrice.isVisible())) fail("Model: product price missing");

  const tabDescription = page.getByRole("tab", { name: /Mô tả|Description/i });
  if (!(await tabDescription.isVisible())) fail("Model: description tab missing");

  const stickyBar = page.locator('[class*="stickyBar"]').first();
  if (!(await stickyBar.isVisible())) fail("Model: sticky CTA bar missing");

  // Test drive page
  await page.goto(`${BASE}/vi/dang-ky-lai-thu`, { waitUntil: "networkidle", timeout: 30000 });
  const form = page.locator("form").first();
  if (!(await form.isVisible())) fail("Test drive: form missing");

  // English locale
  const enRes = await page.goto(`${BASE}/en`, { waitUntil: "networkidle", timeout: 30000 });
  if (!enRes || enRes.status() !== 200) fail(`Home /en status ${enRes?.status()}`);

  await browser.close();

  if (consoleErrors.length) {
    console.error("\nConsole errors:");
    consoleErrors.forEach((e) => console.error(`  ${e}`));
    failures.push(`${consoleErrors.length} console error(s)`);
  }

  if (failures.length) {
    console.error(`\n${failures.length} failure(s) total`);
    process.exit(1);
  }

  console.log("PASS: UI smoke test OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

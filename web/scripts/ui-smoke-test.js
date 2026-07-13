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

  const lineup = page.locator("#lineup");
  if (!(await lineup.isVisible())) fail("Home: #lineup section missing");
  const cards = page.locator("#lineup article");
  if ((await cards.count()) < 1) fail("Home: no vehicle cards in lineup");

  const modelsTrigger = page.getByRole("button", { name: /Dòng xe/i });
  if (!(await modelsTrigger.isVisible())) fail("Header: Models dropdown trigger missing");
  await modelsTrigger.click();
  const modelLink = page.locator('a[href*="/vi/models/"]').first();
  if (!(await modelLink.isVisible({ timeout: 3000 }))) fail("Header: models panel links not visible");

  // Model detail
  await page.goto(`${BASE}/vi/models/vf-3`, { waitUntil: "networkidle", timeout: 30000 });
  const h1 = page.locator("header h1").first();
  if (!(await h1.isVisible())) fail("Model: hero h1 missing");
  const heroImg = page.locator("header img").first();
  if (!(await heroImg.isVisible())) fail("Model: hero stage image missing");

  const variantCards = page.locator("section article h3").first();
  if (!(await variantCards.isVisible())) fail("Model: variant cards missing");

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

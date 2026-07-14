/**
 * Admin smoke test: login, Vietnamese chrome, inline upload fields present.
 * Usage: node scripts/admin-smoke-test.js (reads ADMIN_EMAIL / ADMIN_PASSWORD from .env)
 */
import { readFileSync } from "fs";
import { chromium } from "playwright";

const BASE = process.env.UI_TEST_BASE || "http://localhost:3000";
const failures = [];

function fail(msg) {
  failures.push(msg);
  console.error(`FAIL: ${msg}`);
}

function envFromFile() {
  const out = {};
  for (const line of readFileSync(new URL("../.env", import.meta.url), "utf8").split("\n")) {
    const m = line.match(/^(\w+)=(.*)$/);
    if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return out;
}

async function main() {
  const env = envFromFile();
  const email = process.env.ADMIN_EMAIL || env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || env.ADMIN_PASSWORD || "change-me";

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Login (Vietnamese)
  await page.goto(`${BASE}/admin/login`, { waitUntil: "networkidle" });
  if (!(await page.getByRole("heading", { name: "Đăng nhập quản trị" }).isVisible()))
    fail("Login: Vietnamese title missing");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await page.waitForURL(/\/admin$/, { timeout: 10000 }).catch(() => fail("Login: redirect to /admin failed"));

  // Dashboard + nav Vietnamese
  if (!(await page.getByRole("heading", { name: "Tổng quan" }).isVisible())) fail("Dashboard: 'Tổng quan' missing");
  if (!(await page.getByRole("link", { name: /Danh mục xe/ }).first().isVisible())) fail("Nav: 'Danh mục xe' missing");

  // Media pickers with inline upload per page
  const checks = [
    { url: "/admin/settings", h1: "Cài đặt site", minUploads: 3 },
    { url: "/admin/homepage", h1: "Quản lý trang chủ", minUploads: 1 },
    { url: "/admin/news", h1: "Tin tức", minUploads: 1 },
    { url: "/admin/models", h1: "Danh mục xe", minUploads: 1 },
    { url: "/admin/pages", h1: "Trang tĩnh & FAQ", minUploads: 1 },
    { url: "/admin/media", h1: "Thư viện media", minUploads: 1 },
  ];

  for (const check of checks) {
    await page.goto(`${BASE}${check.url}`, { waitUntil: "networkidle" });
    if (!(await page.getByRole("heading", { name: check.h1 }).first().isVisible()))
      fail(`${check.url}: heading '${check.h1}' missing`);
    const uploads = await page.locator('input[type="file"]').count();
    if (uploads < check.minUploads)
      fail(`${check.url}: expected ≥${check.minUploads} file input(s), found ${uploads}`);
  }

  // Model edit: hero picker + gallery + feature sections
  const editLink = page.getByRole("link", { name: "Sửa" }).first();
  await page.goto(`${BASE}/admin/models`, { waitUntil: "networkidle" });
  if (await editLink.isVisible()) {
    await editLink.click();
    await page.waitForURL(/\/admin\/models\/.+/, { timeout: 10000 });
    if (!(await page.getByText("Ảnh hero").first().isVisible())) fail("Model edit: 'Ảnh hero' picker missing");
    if (!(await page.getByText("Thư viện ảnh").first().isVisible())) fail("Model edit: gallery picker missing");
    if (!(await page.getByRole("button", { name: "HTML" }).first().isVisible()))
      fail("Model edit: HTML editor tab missing");
    const uploads = await page.locator('input[type="file"]').count();
    if (uploads < 2) fail(`Model edit: expected ≥2 file inputs, found ${uploads}`);
  } else {
    fail("Models: no edit link found");
  }

  await browser.close();

  if (failures.length) {
    console.error(`\n${failures.length} failure(s) total`);
    process.exit(1);
  }
  console.log("PASS: admin smoke test OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

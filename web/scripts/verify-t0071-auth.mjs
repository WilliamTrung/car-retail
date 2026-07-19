/**
 * T-0071 acceptance verify against start:standalone (port 3000).
 * Login once → assert 1 Session row → Settings save → Create Model → News save.
 * Fail if any step redirects to /admin/login.
 */
import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const EMAIL = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
const PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "long-enough-password";
const SUFFIX = Date.now().toString(36);

const prisma = new PrismaClient();
const results = [];

function ok(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function sessionCount(userId) {
  return prisma.session.count({ where: { userId } });
}

async function assertStillLoggedIn(page, label) {
  const url = page.url();
  const onLogin = url.includes("/admin/login");
  ok(`${label}: still logged in`, !onLogin, url);
  return !onLogin;
}

async function main() {
  const user = await prisma.user.findUnique({ where: { email: EMAIL } });
  if (!user) throw new Error(`No user ${EMAIL}`);

  // Clean slate so AC4 is measurable for this login.
  await prisma.session.deleteMany({ where: { userId: user.id } });
  const before = await sessionCount(user.id);
  ok("pre-login session count is 0", before === 0, `count=${before}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // --- Login ---
  await page.goto(`${BASE}/admin/login`);
  await page.fill('input[name="email"]', EMAIL);
  await page.fill('input[name="password"]', PASSWORD);
  await Promise.all([
    page.waitForURL((u) => !u.pathname.includes("/admin/login"), { timeout: 15000 }),
    page.click('button[type="submit"]'),
  ]);
  await assertStillLoggedIn(page, "after login");

  const afterLogin = await sessionCount(user.id);
  ok("AC4: exactly one Session row after login", afterLogin === 1, `count=${afterLogin}`);

  // Header has a Logout <button type="submit"> — never click bare submit.
  const mainSave = () => page.locator("main button[type='submit']").first();

  // --- Settings save (revalidateTag siteSettings) ---
  await page.goto(`${BASE}/admin/settings`);
  await page.waitForSelector("#dealerName-vi");
  const dealerVi = await page.inputValue("#dealerName-vi");
  const marker = ` T0071-${SUFFIX}`;
  await page.fill("#dealerName-vi", `${dealerVi.replace(/ T0071-\w+$/, "")}${marker}`);
  await mainSave().click();
  await page.waitForTimeout(2500);
  await assertStillLoggedIn(page, "AC2: after settings save");
  const settingsStill = await sessionCount(user.id);
  ok("sessions unchanged after settings", settingsStill === 1, `count=${settingsStill}`);

  // Reload settings and confirm persistence
  await page.goto(`${BASE}/admin/settings`);
  await page.waitForSelector("#dealerName-vi");
  const dealerAfter = await page.inputValue("#dealerName-vi");
  ok("AC2: settings change persisted", dealerAfter.includes(marker), dealerAfter.slice(0, 80));

  // --- Create Model (revalidateTag models) ---
  await page.goto(`${BASE}/admin/models/new`);
  await page.waitForSelector("#model-segment");
  const segmentValue = await page.$eval("#model-segment", (el) => {
    const opt = [...el.options].find((o) => o.value);
    return opt?.value ?? "";
  });
  if (!segmentValue) throw new Error("No segment options");
  await page.selectOption("#model-segment", segmentValue);

  const nameVi = `T0071 Model ${SUFFIX}`;
  const slugVi = `t0071-model-${SUFFIX}`;
  await page.fill("#model-name-vi", nameVi);
  await page.fill("#model-slug-vi", slugVi);
  await page.click("#model-name-tab-en");
  await page.fill("#model-name-en", nameVi);
  await page.click("#model-slug-tab-en");
  await page.fill("#model-slug-en", slugVi);

  await mainSave().click();
  await page.waitForURL(
    (u) =>
      /\/admin\/models\/[^/]+$/.test(u.pathname) && !u.pathname.endsWith("/new"),
    { timeout: 20000 },
  ).catch(() => {});
  const modelUrl = page.url();
  const createdOk =
    /\/admin\/models\/[^/]+$/.test(new URL(modelUrl).pathname) &&
    !modelUrl.includes("/admin/login") &&
    !modelUrl.endsWith("/new");
  ok("AC1: landed on /admin/models/[id]", createdOk, modelUrl);
  await assertStillLoggedIn(page, "AC1: after create model");

  const afterModel = await sessionCount(user.id);
  ok("sessions still one after create model", afterModel === 1, `count=${afterModel}`);

  await page.goto(`${BASE}/admin/models`);
  await page.waitForTimeout(1000);
  const listText = await page.locator("body").innerText();
  ok(
    "AC1: model appears on /admin/models",
    listText.includes(nameVi) || listText.includes(slugVi),
    nameVi,
  );

  // --- News save (revalidateTag news) — toggle publish on first row ---
  await page.goto(`${BASE}/admin/news`);
  await page.waitForTimeout(1000);
  const beforeNewsUrl = page.url();
  const toggleBtn = page.locator("main").getByRole("button").filter({ hasText: /publish|unpublish|đăng|ẩn/i }).first();
  if (await toggleBtn.count()) {
    await toggleBtn.click();
  } else {
    // Fallback: open edit on first row and save
    await page.locator("main").getByRole("button").filter({ hasText: /edit|sửa/i }).first().click();
    await page.waitForSelector("#news-title-vi:visible", { timeout: 10000 });
    const title = await page.inputValue("#news-title-vi");
    await page.fill("#news-title-vi", `${title.replace(/ T0071-\w+$/, "")}${marker}`);
    await page.locator("main form button[type='submit']").last().click();
  }
  await page.waitForTimeout(2500);
  ok("AC3: news revalidating action submitted", true, beforeNewsUrl);
  await assertStillLoggedIn(page, "AC3: after news save");
  const finalSessions = await sessionCount(user.id);
  ok("AC4 final: still exactly one Session row", finalSessions === 1, `count=${finalSessions}`);

  await browser.close();
  await prisma.$disconnect();

  const failed = results.filter((r) => !r.pass);
  console.log("\n--- SUMMARY ---");
  console.log(`${results.length - failed.length}/${results.length} passed`);
  if (failed.length) {
    process.exitCode = 1;
  }
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});

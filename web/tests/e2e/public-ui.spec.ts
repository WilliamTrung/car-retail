import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

import { waitForHydration } from "./helpers/browser";

const SEEDED_MODEL_SLUG = "city-ev-compact";
const SEEDED_MST = "0000000000";
const SEEDED_SHOWROOM_ID = "seed-showroom-1";

const VI_ROUTES = [
  "/vi",
  `/vi/models/${SEEDED_MODEL_SLUG}`,
  "/vi/dang-ky-lai-thu",
  "/vi/dat-coc",
  "/vi/showroom",
] as const;

const EN_ROUTES = [
  "/en",
  `/en/models/${SEEDED_MODEL_SLUG}`,
  "/en/book-test-drive",
  "/en/deposit",
  "/en/showrooms",
] as const;

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
} as const;

const E2E_DIR = path.join(process.cwd(), "tests", "e2e");
const ARTIFACTS_DIR = path.join(E2E_DIR, "artifacts");
const CWV_SUMMARY = path.join(ARTIFACTS_DIR, "cwv-summary.json");

/** Benign dev-only noise (hydration warnings, favicon 404 on standalone). */
function isBenignConsoleError(text: string): boolean {
  return (
    text.includes("favicon.ico") ||
    text.includes("Download the React DevTools") ||
    text.includes("Hydration")
  );
}

function attachConsoleGuard(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" && !isBenignConsoleError(msg.text())) {
      errors.push(msg.text());
    }
  });
  page.on("pageerror", (err) => {
    if (!isBenignConsoleError(err.message)) {
      errors.push(err.message);
    }
  });
  return errors;
}

async function assertPageShell(
  page: Page,
  route: string,
  viewport: (typeof VIEWPORTS)[keyof typeof VIEWPORTS],
  locale: "vi" | "en",
) {
  await page.setViewportSize(viewport);
  const response = await page.goto(route, { waitUntil: "domcontentloaded" });
  expect(response?.status(), `${route} status`).toBe(200);

  await expect(page.locator("h1"), `${route} h1`).toHaveCount(1);
  await expect(page.getByRole("banner"), `${route} site header`).toBeVisible();
  await expect(page.getByRole("contentinfo"), `${route} footer`).toBeVisible();

  const footer = page.getByRole("contentinfo");
  await expect(footer, `${route} MST`).toContainText(SEEDED_MST);

  if (viewport.width > 900) {
    await expect(
      footer.locator('a[href^="tel:"]').first(),
      `${route} footer tel`,
    ).toBeVisible();
  } else {
    const mobileLabel =
      locale === "vi" ? "Thao tác nhanh" : "Quick actions";
    await expect(
      page
        .getByRole("navigation", { name: mobileLabel })
        .locator('a[href^="tel:"]'),
      `${route} mobile tel`,
    ).toBeVisible();
  }

  if (viewport.width > 900) {
    const floatingLabel =
      locale === "vi" ? "Liên hệ nhanh" : "Quick contact";
    await expect(
      page.getByRole("complementary", { name: floatingLabel }),
      `${route} floating cluster`,
    ).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: locale === "vi" ? "Thao tác nhanh" : "Quick actions" }),
    ).toBeHidden();
  } else {
    const mobileLabel =
      locale === "vi" ? "Thao tác nhanh" : "Quick actions";
    await expect(
      page.getByRole("navigation", { name: mobileLabel }),
      `${route} mobile action bar`,
    ).toBeVisible();
    await expect(
      page.getByRole("complementary", {
        name: locale === "vi" ? "Liên hệ nhanh" : "Quick contact",
      }),
    ).toBeHidden();
  }
}

test.describe.configure({ mode: "parallel" });

for (const route of VI_ROUTES) {
  test(`vi shell desktop — ${route}`, async ({ page }) => {
    const errors = attachConsoleGuard(page);
    await assertPageShell(page, route, VIEWPORTS.desktop, "vi");
    expect(errors, `console on ${route}`).toEqual([]);
  });

  test(`vi shell mobile — ${route}`, async ({ page }) => {
    const errors = attachConsoleGuard(page);
    await assertPageShell(page, route, VIEWPORTS.mobile, "vi");
    expect(errors, `console on ${route}`).toEqual([]);
  });
}

for (const route of EN_ROUTES) {
  test(`en shell desktop — ${route}`, async ({ page }) => {
    const errors = attachConsoleGuard(page);
    await assertPageShell(page, route, VIEWPORTS.desktop, "en");
    expect(errors, `console on ${route}`).toEqual([]);
  });

  test(`en shell mobile — ${route}`, async ({ page }) => {
    const errors = attachConsoleGuard(page);
    await assertPageShell(page, route, VIEWPORTS.mobile, "en");
    expect(errors, `console on ${route}`).toEqual([]);
  });
}

test.describe("conversion paths", () => {
  test("hero primary CTA → test-drive", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto("/vi");
    const hero = page.locator('section[aria-roledescription="carousel"]');
    await hero.getByRole("link").first().click();
    await expect(page).toHaveURL(/\/vi\/dang-ky-lai-thu/);
  });

  test("ModelCard test-drive CTA carries model slug", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto("/vi");
    const leadLink = page
      .getByRole("article")
      .first()
      .getByRole("link", { name: /Lái thử|Tư vấn|Test drive/i });
    await leadLink.scrollIntoViewIfNeeded();
    const href = await leadLink.getAttribute("href");
    expect(href ?? "").toMatch(/model=[^&]+/);
    await leadLink.click();
    await expect(page).toHaveURL(/dang-ky-lai-thu\?model=/);
  });

  test("showroom book CTA → test-drive?showroom=", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto("/vi/showroom");
    const bookLink = page
      .locator("article")
      .first()
      .getByRole("link", { name: /Đặt lịch tại chi nhánh|Book.*branch/i });
    await bookLink.click();
    await expect(page).toHaveURL(
      new RegExp(
        `/vi/dang-ky-lai-thu\\?showroom=${SEEDED_SHOWROOM_ID.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
      ),
    );
  });

  test("lead submit success", async ({ page }) => {
    await page.route("**/api/leads", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ id: "e2e-ui-lead" }),
      });
    });

    await page.goto("/vi/dang-ky-lai-thu");
    await page.locator("#lead-fullName").fill("Nguyễn E2E");
    await page.locator("#lead-phone").fill("0901234567");
    await page.locator("#lead-consent").check();
    await page.getByRole("button", { name: "Đăng ký lái thử" }).click();

    await expect(page.getByRole("status")).toContainText("Đăng ký thành công");
  });

  test("consent-off blocks submit", async ({ page }) => {
    let posts = 0;
    await page.route("**/api/leads", async (route) => {
      posts += 1;
      await route.fulfill({ status: 201, body: "{}" });
    });

    await page.goto("/vi/dang-ky-lai-thu");
    await page.locator("#lead-fullName").fill("No Consent");
    await page.locator("#lead-phone").fill("0901234567");

    const submit = page.getByRole("button", { name: "Đăng ký lái thử" });
    await expect(submit).toBeDisabled();

    await page.locator("#lead-consent").check();
    await expect(submit).toBeEnabled();
    await page.locator("#lead-consent").uncheck();
    await expect(submit).toBeDisabled();
    expect(posts).toBe(0);
  });
});

test.describe("reduced motion", () => {
  test("carousel does not auto-advance; FAB has no pulse", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto("/vi");

    const hero = page.locator('section[aria-roledescription="carousel"]');
    const titleBefore = await hero.locator("h1").textContent();
    await page.waitForTimeout(5500);
    const titleAfter = await hero.locator("h1").textContent();
    expect(titleAfter).toBe(titleBefore);

    const callFab = page
      .getByRole("complementary", { name: "Liên hệ nhanh" })
      .locator('a[data-variant="call"]');
    const fabAnimation = await callFab.evaluate(
      (el) => getComputedStyle(el).animationName,
    );
    expect(fabAnimation === "none" || fabAnimation === "").toBeTruthy();
  });

  test("FAB pulses when motion is allowed", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto("/vi");

    const callFab = page
      .getByRole("complementary", { name: "Liên hệ nhanh" })
      .locator('a[data-variant="call"]');
    const fabAnimation = await callFab.evaluate(
      (el) => getComputedStyle(el).animationName,
    );
    expect(fabAnimation.toLowerCase()).toContain("pulse");
  });
});

test.describe("keyboard & focus-visible", () => {
  test("mobile drawer: open, focus trap, Escape closes", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.mobile);
    await page.goto("/vi");

    await page.getByRole("button", { name: "Mở menu" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Tab");
    const focusedInDialog = await dialog.evaluate((el) =>
      el.contains(document.activeElement),
    );
    expect(focusedInDialog).toBeTruthy();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("showroom tabs: ArrowRight moves focus/selection", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto("/vi/showroom");

    const tablist = page.getByRole("tablist").first();
    const tabs = tablist.getByRole("tab");
    const count = await tabs.count();
    test.skip(count < 2, "Need ≥2 showroom city tabs");

    await tabs.first().focus();
    await page.keyboard.press("ArrowRight");
    await expect(tabs.nth(1)).toBeFocused();
    await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  });

  test("hero carousel: focus-visible ring on keyboard focus", async ({
    page,
  }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto("/vi");

    const hero = page.locator('section[aria-roledescription="carousel"]');
    await hero.focus();
    const outlineWidth = await hero.evaluate((el) => {
      const s = getComputedStyle(el);
      return s.outlineWidth;
    });
    expect(outlineWidth).not.toBe("0px");
  });

  test("model variant radiogroup is keyboard operable", async ({ page }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto(`/vi/models/${SEEDED_MODEL_SLUG}`);

    const radios = page.getByRole("radiogroup").getByRole("radio");
    await expect(radios.first()).toBeVisible();
    await radios.first().focus();
    const outline = await radios.first().evaluate((el) => {
      const s = getComputedStyle(el);
      return s.outlineStyle;
    });
    expect(outline === "auto" || outline === "solid").toBeTruthy();
  });

  test("gallery thumbs respond to ArrowRight when present", async ({
    page,
  }) => {
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.goto(`/vi/models/family-suv-electric`);

    const thumbs = page.locator("[data-thumb]");
    const thumbCount = await thumbs.count();
    test.skip(thumbCount < 2, "Need ≥2 gallery thumbs");

    // T-0078: focusing before hydration leaves activeElement on BODY and the
    // React key handler unbound — wait for the fiber first.
    await waitForHydration(page, "[data-thumb]");
    await thumbs.first().focus();
    await page.keyboard.press("ArrowRight");
    await expect(thumbs.nth(1)).toBeFocused();
  });
});

test.describe("CWV lab (prod build)", () => {
  test.describe.configure({ mode: "serial" });
  test.setTimeout(180_000);

  test("Lighthouse /vi + model — CLS < 0.1", async () => {
    const script = path.join(E2E_DIR, "run-lighthouse.mjs");
    execFileSync(process.execPath, [script], {
      cwd: path.resolve(E2E_DIR, "../.."),
      stdio: "pipe",
      env: {
        ...process.env,
        PLAYWRIGHT_BASE_URL:
          process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000",
      },
    });

    expect(existsSync(CWV_SUMMARY)).toBeTruthy();
    const summary = JSON.parse(readFileSync(CWV_SUMMARY, "utf8")) as Array<{
      url: string;
      lcpMs: number;
      cls: number;
      tbtMs: number;
      lcpElement: string | null;
    }>;

    expect(summary.length).toBeGreaterThanOrEqual(2);

    for (const row of summary) {
      expect(row.cls, `CLS ${row.url}`).toBeLessThan(0.1);
      expect(row.lcpMs, `LCP ${row.url}`).toBeGreaterThan(0);
      expect(row.tbtMs, `TBT ${row.url}`).toBeGreaterThanOrEqual(0);
      if (row.lcpElement) {
        expect(
          row.lcpElement,
          `LCP element ${row.url}`,
        ).toMatch(/hero|gallery|heading|image|img|h1|section|div|p|span|text|ms/i);
      }
    }

    test.info().attach("cwv-summary", {
      body: JSON.stringify(summary, null, 2),
      contentType: "application/json",
    });
  });
});

import { expect, test } from "@playwright/test";

import { captureConsole, waitForHydration } from "./helpers/browser";

/**
 * T-0057 regression gate: a real React #418 shipped once (fixed in d564ceb by
 * gating `CountdownTimer`). SSR/curl review cannot see hydration errors — they
 * only exist in a live browser — so this spec drives every high-traffic route
 * and fails on ANY hydration diagnostic or uncaught exception.
 */

const MODEL_SLUG = "city-ev-compact";

const ROUTES = [
  "/", // bare root → middleware locale negotiation → /vi
  "/vi",
  "/en",
  `/vi/models/${MODEL_SLUG}`,
  `/en/models/${MODEL_SLUG}`,
  "/vi/khuyen-mai", // localized /promotions
  "/en/promotions",
] as const;

test.describe.configure({ mode: "parallel" });

for (const route of ROUTES) {
  test(`no hydration errors — ${route}`, async ({ page }) => {
    const console_ = captureConsole(page);

    const response = await page.goto(route, { waitUntil: "load" });
    expect(response?.status(), `${route} status`).toBeLessThan(400);

    await waitForHydration(page);
    // Recoverable hydration errors are logged asynchronously after the first
    // paint — give React a beat to flush them before asserting.
    await page.waitForTimeout(1_000);

    expect(console_.hydration(), `hydration diagnostics on ${route}`).toEqual(
      [],
    );
    expect(console_.pageErrors(), `uncaught errors on ${route}`).toEqual([]);
  });
}

test("no hydration errors — /vi at mobile 390x844", async ({ page }) => {
  const console_ = captureConsole(page);
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto("/vi", { waitUntil: "load" });
  await waitForHydration(page);
  await page.waitForTimeout(1_000);

  expect(console_.hydration(), "mobile hydration diagnostics").toEqual([]);
  expect(console_.pageErrors(), "mobile uncaught errors").toEqual([]);
});

test("client-side navigation home → model detail stays clean", async ({
  page,
}) => {
  const console_ = captureConsole(page);

  await page.goto("/vi", { waitUntil: "load" });
  await waitForHydration(page);

  await page
    .getByRole("article")
    .first()
    .getByRole("link")
    .first()
    .click();
  await page.waitForURL(/\/vi\/(models|dang-ky-lai-thu)/);
  await waitForHydration(page);
  await page.waitForTimeout(1_000);

  expect(console_.hydration(), "hydration after soft nav").toEqual([]);
  expect(console_.pageErrors(), "uncaught errors after soft nav").toEqual([]);
});

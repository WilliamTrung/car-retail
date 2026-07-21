import { expect, test } from "@playwright/test";

import {
  captureConsole,
  scrollThroughPage,
  waitForHydration,
} from "./helpers/browser";

/**
 * GalleryHero interactivity (T-0025 keyboard, T-0073 swatches) — behaviour that
 * only exists after hydration and therefore cannot be reviewed over SSR/curl.
 *
 * Every focus/key interaction awaits {@link waitForHydration} first: T-0078
 * showed `.focus()` straight after `page.goto()` lands pre-hydration, leaving
 * `document.activeElement === BODY` and React key handlers unbound.
 */

const MODEL = "city-ev-compact"; // 5 gallery thumbs + 3 colour swatches (seed)
const THUMB = "[data-thumb]";

/** The main gallery image = first <img> inside the region, above the thumb listbox. */
function mainImage(page: import("@playwright/test").Page) {
  return page
    .locator('[role="region"]:has([role="listbox"]) img')
    .first();
}

async function openModel(page: import("@playwright/test").Page, locale = "vi") {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`/${locale}/models/${MODEL}`, { waitUntil: "load" });
  await waitForHydration(page, THUMB);
}

test.describe.configure({ mode: "serial" });

test("gallery: thumbnail click swaps the main image", async ({ page }) => {
  const console_ = captureConsole(page);
  await openModel(page);

  const thumbs = page.locator(THUMB);
  expect(await thumbs.count(), "seeded gallery thumbs").toBeGreaterThan(1);

  const main = mainImage(page);
  const before = await main.getAttribute("src");
  expect(before, "main image has a src").toBeTruthy();

  await thumbs.nth(2).click();
  await expect(thumbs.nth(2)).toHaveAttribute("aria-selected", "true");
  await expect(thumbs.nth(0)).toHaveAttribute("aria-selected", "false");
  await expect(main).not.toHaveAttribute("src", before!);

  // …and the swapped-in image really decodes.
  await expect
    .poll(() => main.evaluate((el: HTMLImageElement) => el.naturalWidth), {
      timeout: 15_000,
    })
    .toBeGreaterThan(0);

  expect(console_.pageErrors(), "uncaught during gallery interaction").toEqual(
    [],
  );
});

test("gallery: ArrowRight/ArrowLeft/Home/End move focus and selection", async ({
  page,
}) => {
  await openModel(page);

  const thumbs = page.locator(THUMB);
  const count = await thumbs.count();
  expect(count, "need ≥2 thumbs").toBeGreaterThan(1);

  await thumbs.first().focus();
  await expect(thumbs.first(), "focus lands post-hydration (T-0078)").toBeFocused();

  await page.keyboard.press("ArrowRight");
  await expect(thumbs.nth(1)).toBeFocused();
  await expect(thumbs.nth(1)).toHaveAttribute("aria-selected", "true");

  await page.keyboard.press("ArrowLeft");
  await expect(thumbs.nth(0)).toBeFocused();
  await expect(thumbs.nth(0)).toHaveAttribute("aria-selected", "true");

  await page.keyboard.press("End");
  await expect(thumbs.nth(count - 1)).toBeFocused();

  await page.keyboard.press("Home");
  await expect(thumbs.nth(0)).toBeFocused();

  // Wrap-around at the end of the list.
  await thumbs.nth(count - 1).focus();
  await page.keyboard.press("ArrowRight");
  await expect(thumbs.nth(0)).toBeFocused();
});

test("gallery: keyboard selection swaps the main image too", async ({
  page,
}) => {
  await openModel(page);

  const main = mainImage(page);
  const before = await main.getAttribute("src");

  await page.locator(THUMB).first().focus();
  await page.keyboard.press("ArrowRight");

  await expect(main).not.toHaveAttribute("src", before!);
});

test("colour swatch click (T-0073) is wired and never blanks the image", async ({
  page,
}, testInfo) => {
  const console_ = captureConsole(page);
  await openModel(page);

  const swatches = page.locator('ul[aria-label="Màu xe"] button');
  const count = await swatches.count();
  expect(count, "seeded colour swatches").toBeGreaterThan(0);

  const main = mainImage(page);
  const before = await main.getAttribute("src");

  let swapped = false;
  for (let i = 0; i < count; i++) {
    await swatches.nth(i).click();
    const after = await main.getAttribute("src");
    if (after !== before) swapped = true;
    // Whatever happens, the hero must still show a decoded image.
    expect(after, `swatch ${i} left the main image without a src`).toBeTruthy();
  }

  await expect
    .poll(() => main.evaluate((el: HTMLImageElement) => el.naturalWidth), {
      timeout: 15_000,
    })
    .toBeGreaterThan(0);

  expect(console_.pageErrors(), "uncaught during swatch interaction").toEqual(
    [],
  );

  testInfo.annotations.push({
    type: "swatch-image-swap",
    description: swapped
      ? "at least one swatch carried an image and swapped the hero"
      : "NO seeded swatch carries imageUrl/imageMedia — the swap branch of " +
        "GalleryHero.selectSwatch is inert with current data (data gap, not code)",
  });
});

test("variant selector switches the selected variant", async ({ page }) => {
  // city-ev-compact ships a single variant — use a multi-variant seeded model.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/vi/models/vf-3", { waitUntil: "load" });
  await waitForHydration(page);

  const group = page.getByRole("radiogroup").first();
  await group.waitFor({ state: "attached" });
  const radios = group.getByRole("radio");
  await expect
    .poll(() => radios.count(), { timeout: 10_000 })
    .toBeGreaterThan(1);

  await waitForHydration(page, '[role="radiogroup"]');
  // The <input type=radio> is visually hidden inside its <label> — click the label.
  await group.locator("label").nth(1).click();
  await expect(radios.nth(1)).toBeChecked();
  await expect(radios.nth(0)).not.toBeChecked();
});

/* ------------------------------------------------------------------ *
 * Post-hydration image integrity (SSR review is blind to broken images)
 * ------------------------------------------------------------------ */

for (const route of ["/vi", `/vi/models/${MODEL}`, "/vi/khuyen-mai"] as const) {
  test(`rendered <img> all decode — ${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(route, { waitUntil: "load" });
    await waitForHydration(page);
    await scrollThroughPage(page);

    const broken = await page.evaluate(async () => {
      const imgs = Array.from(document.images).filter(
        (img) => img.getAttribute("src") && img.offsetParent !== null,
      );
      await Promise.all(
        imgs.map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise((r) => {
                img.addEventListener("load", r, { once: true });
                img.addEventListener("error", r, { once: true });
              }),
        ),
      );
      return imgs
        .filter((img) => img.naturalWidth === 0)
        .map((img) => img.currentSrc || img.src);
    });

    expect(broken, `broken images on ${route}`).toEqual([]);
  });
}

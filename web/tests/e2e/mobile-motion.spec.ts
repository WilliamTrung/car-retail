import { expect, test } from "@playwright/test";

import { captureConsole, waitForHydration } from "./helpers/browser";

/**
 * Mobile chrome (390x844) + prefers-reduced-motion — both are runtime-only
 * behaviours invisible to an SSR/curl review.
 */

const MOBILE = { width: 390, height: 844 } as const;
const DESKTOP = { width: 1440, height: 900 } as const;

const LABELS = {
  vi: { open: "Mở menu", close: "Đóng menu", actions: "Thao tác nhanh" },
  en: { open: "Open menu", close: "Close menu", actions: "Quick actions" },
} as const;

test.describe("mobile chrome @390x844", () => {
  for (const locale of ["vi", "en"] as const) {
    test(`${locale}: drawer opens, traps focus both ways, closes`, async ({
      page,
    }) => {
      const console_ = captureConsole(page);
      const l = LABELS[locale];

      await page.setViewportSize(MOBILE);
      await page.goto(`/${locale}`, { waitUntil: "load" });
      await waitForHydration(page, `button[aria-label="${l.open}"]`);

      const trigger = page.getByRole("button", { name: l.open });
      await expect(trigger).toBeVisible();
      await expect(trigger).toHaveAttribute("aria-expanded", "false");

      await trigger.click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveAttribute("aria-modal", "true");

      // Focus is moved into the dialog on open (close button).
      // NB: the backdrop carries the same aria-label — scope to the dialog.
      await expect(dialog.getByRole("button", { name: l.close })).toBeFocused();

      // Body scroll is locked while open.
      expect(
        await page.evaluate(() => document.body.style.overflow),
      ).toBe("hidden");

      // Forward trap: Tab off the last focusable wraps to the first.
      const focusables = dialog.locator(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      const n = await focusables.count();
      expect(n, "focusables inside drawer").toBeGreaterThan(1);

      await focusables.nth(n - 1).focus();
      await page.keyboard.press("Tab");
      await expect(focusables.first()).toBeFocused();

      // Backward trap: Shift+Tab off the first wraps to the last.
      await page.keyboard.press("Shift+Tab");
      await expect(focusables.nth(n - 1)).toBeFocused();

      // Focus never escapes the dialog.
      expect(
        await dialog.evaluate((el) => el.contains(document.activeElement)),
      ).toBe(true);

      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      expect(
        await page.evaluate(() => document.body.style.overflow),
      ).not.toBe("hidden");

      expect(console_.pageErrors(), "uncaught in mobile drawer").toEqual([]);
    });

    test(`${locale}: drawer closes via its close button`, async ({ page }) => {
      const l = LABELS[locale];
      await page.setViewportSize(MOBILE);
      await page.goto(`/${locale}`, { waitUntil: "load" });
      await waitForHydration(page, `button[aria-label="${l.open}"]`);

      await page.getByRole("button", { name: l.open }).click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();

      await dialog.getByRole("button", { name: l.close }).click();
      await expect(dialog).toBeHidden();
    });

    /**
     * DEFECT (pre-existing, also in prod @58b7db6) — the drawer overlay is
     * clipped to the header.
     *
     * `src/components/layout/SiteHeader.module.css:8` sets
     * `backdrop-filter: blur(10px)` on the sticky `<header>`. A non-`none`
     * backdrop-filter makes that element the containing block for `position:
     * fixed` descendants, and `MobileNav` is rendered inside the header
     * (`SiteHeader.tsx` → `MobileChromeControls` → `#site-mobile-nav`). So
     * `MobileNav.module.css .root { position: fixed; inset: 0 }` resolves
     * against the 390x71 header box instead of the 390x844 viewport:
     * the panel is 71px tall, the scrim never covers the page, and
     * tap-outside-to-close only works inside the header strip.
     *
     * Measured: panel box {x:0,y:0,w:320,h:71};
     * `document.elementFromPoint(355, 422)` → `HeroCarousel_trustValue`.
     *
     * `test.fail()` records it without wedging the gate red — drop the marker
     * once the drawer is portalled out of the header (or the blur moved to a
     * pseudo-element).
     */
    test(`${locale}: KNOWN DEFECT — drawer overlay covers the viewport`, async ({
      page,
    }) => {
      test.fail();
      const l = LABELS[locale];
      await page.setViewportSize(MOBILE);
      await page.goto(`/${locale}`, { waitUntil: "load" });
      await waitForHydration(page, `button[aria-label="${l.open}"]`);

      await page.getByRole("button", { name: l.open }).click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();

      const panel = await dialog.boundingBox();
      expect(panel!.height, "drawer panel spans the viewport").toBeGreaterThan(
        MOBILE.height * 0.9,
      );

      // Tap the scrim beside the 320px panel — should dismiss the drawer.
      await page.mouse.click(
        panel!.x + panel!.width + (MOBILE.width - panel!.width) / 2,
        MOBILE.height / 2,
      );
      await expect(dialog).toBeHidden();
    });

    test(`${locale}: mobile action bar renders and desktop hides it`, async ({
      page,
    }) => {
      const l = LABELS[locale];

      await page.setViewportSize(MOBILE);
      await page.goto(`/${locale}`, { waitUntil: "load" });
      const bar = page.getByRole("navigation", { name: l.actions });
      await expect(bar).toBeVisible();
      await expect(bar.locator('a[href^="tel:"]').first()).toBeVisible();

      await page.setViewportSize(DESKTOP);
      await expect(bar).toBeHidden();
    });
  }

  test("vi: drawer link navigates and closes the drawer", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/vi", { waitUntil: "load" });
    await waitForHydration(page, 'button[aria-label="Mở menu"]');

    await page.getByRole("button", { name: "Mở menu" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByRole("link").first().click();

    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/\/vi(\/|$)/);
  });
});

test.describe("prefers-reduced-motion", () => {
  const ROUTES = [
    "/vi",
    "/vi/models/city-ev-compact",
    "/vi/khuyen-mai",
  ] as const;

  for (const route of ROUTES) {
    test(`no infinite animations — ${route}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize(DESKTOP);
      await page.goto(route, { waitUntil: "load" });
      await waitForHydration(page);

      const offenders = await page.evaluate(() =>
        Array.from(document.querySelectorAll("body *"))
          .filter((el) => {
            const s = getComputedStyle(el);
            const infinite = s.animationIterationCount
              .split(",")
              .some((v) => v.trim() === "infinite");
            const running =
              s.animationName !== "none" && s.animationPlayState !== "paused";
            return infinite && running;
          })
          .slice(0, 10)
          .map(
            (el) =>
              `${el.tagName.toLowerCase()}[class=${el.getAttribute("class") ?? ""}]` +
              ` :: ${getComputedStyle(el).animationName}`,
          ),
      );

      expect(offenders, `infinite animations under reduce on ${route}`).toEqual(
        [],
      );
    });
  }

  /**
   * The active slide is read off the dot `aria-selected`, NOT the hero `<h1>`:
   * all seeded hero slides currently share the title "Khuyến mãi", so a
   * text-based assertion can never observe a slide change (that is exactly why
   * `public-ui.spec.ts:226` cannot actually detect autoplay).
   */
  const activeSlide = (page: import("@playwright/test").Page) =>
    page
      .locator('section[aria-roledescription="carousel"] [role="tab"]')
      .evaluateAll((els) =>
        els.findIndex((el) => el.getAttribute("aria-selected") === "true"),
      );

  test("hero carousel does not autoplay under reduce (12s window)", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize(DESKTOP);
    await page.goto("/vi", { waitUntil: "load" });
    await waitForHydration(page);

    const before = await activeSlide(page);
    expect(before, "a hero slide is active").toBeGreaterThanOrEqual(0);
    // AUTO_MS is 5000 — two full ticks must pass with no slide change.
    await page.waitForTimeout(12_000);
    expect(await activeSlide(page), "slide advanced under reduced motion").toBe(
      before,
    );

    // The pause/play control is disabled because autoplay is off.
    const pause = page
      .locator('section[aria-roledescription="carousel"] button[disabled]')
      .first();
    await expect(pause).toBeDisabled();
  });

  test("hero carousel DOES autoplay when motion is allowed", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.setViewportSize(DESKTOP);
    await page.goto("/vi", { waitUntil: "load" });
    await waitForHydration(page);

    const hero = page.locator('section[aria-roledescription="carousel"]');
    const slides = await hero.getByRole("tab").count();
    test.skip(slides < 2, "need ≥2 hero slides to observe autoplay");

    const before = await activeSlide(page);
    await expect
      .poll(() => activeSlide(page), { timeout: 15_000 })
      .not.toBe(before);
  });
});

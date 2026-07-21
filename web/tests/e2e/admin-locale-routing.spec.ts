import { expect, test, type Page } from "@playwright/test";

import { captureConsole, waitForHydration } from "./helpers/browser";

/**
 * T-0079 browser gate: `/admin/**` moved under `[locale]` with `(site)`/`(admin)`
 * route groups, each owning its own `<html>`/`<body>`, plus middleware locale
 * negotiation that bypasses `intlMiddleware` for admin.
 *
 * Covered here and nowhere else: bare-`/admin` 307 negotiation (cookie →
 * Accept-Language → defaultLocale), the unauthenticated redirect + callbackUrl,
 * single-document route-group isolation, and the admin panel actually rendering
 * in the language of its locale prefix.
 */

const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "";

test.beforeAll(() => {
  if (!adminPassword || adminPassword.length < 12) {
    throw new Error(
      "SEED_ADMIN_PASSWORD must be set (≥12 chars) for E2E — load web/.env",
    );
  }
});

async function login(page: Page, locale: "vi" | "en"): Promise<void> {
  await page.goto(`/${locale}/admin/login`);
  await page.locator("#email").fill(adminEmail);
  await page.locator("#password").fill(adminPassword);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(new RegExp(`/${locale}/admin/?$`));
}

/* ------------------------------------------------------------------ *
 * 1. Login page renders under both locale prefixes
 * ------------------------------------------------------------------ */

for (const locale of ["vi", "en"] as const) {
  test(`/${locale}/admin/login renders as its own document`, async ({
    page,
  }) => {
    const console_ = captureConsole(page);
    const res = await page.goto(`/${locale}/admin/login`, {
      waitUntil: "load",
    });
    expect(res?.status(), "login status").toBe(200);

    await expect(
      page.getByRole("heading", { name: "Admin login" }),
    ).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();

    // (admin) route group owns <html lang>; must match the URL prefix.
    await expect(page.locator("html")).toHaveAttribute("lang", locale);

    // Exactly one document — a mis-nested (site)/(admin) layout pair would
    // emit a second <html>/<body>.
    const counts = await page.evaluate(() => ({
      html: document.querySelectorAll("html").length,
      body: document.querySelectorAll("body").length,
    }));
    expect(counts).toEqual({ html: 1, body: 1 });

    // Admin must NOT inherit the public site chrome.
    await expect(page.getByRole("banner")).toHaveCount(0);
    await expect(page.getByRole("contentinfo")).toHaveCount(0);

    await page.waitForTimeout(500);
    expect(console_.hydration(), `hydration on ${locale} login`).toEqual([]);
    expect(console_.pageErrors(), `uncaught on ${locale} login`).toEqual([]);
  });
}

/* ------------------------------------------------------------------ *
 * 2. Unauthenticated guard
 * ------------------------------------------------------------------ */

const GUARDED = [
  { locale: "vi", path: "/vi/admin/models" },
  { locale: "vi", path: "/vi/admin" },
  { locale: "en", path: "/en/admin/leads" },
  { locale: "en", path: "/en/admin/settings" },
] as const;

for (const { locale, path } of GUARDED) {
  test(`unauthenticated ${path} → ${locale} login with callbackUrl`, async ({
    page,
  }) => {
    await page.goto(path);
    await expect(page).toHaveURL(
      `${new URL(page.url()).origin}/${locale}/admin/login?callbackUrl=${encodeURIComponent(path)}`,
    );
    await expect(
      page.getByRole("heading", { name: "Admin login" }),
    ).toBeVisible();
  });
}

/* ------------------------------------------------------------------ *
 * 3. Bare /admin/** → 307 to negotiated locale, path + query preserved
 * ------------------------------------------------------------------ */

const NEGOTIATION = [
  {
    name: "no hints → defaultLocale vi",
    headers: { "accept-language": "" },
    expected: "vi",
  },
  {
    name: "Accept-Language en",
    headers: { "accept-language": "en-US,en;q=0.9" },
    expected: "en",
  },
  {
    name: "Accept-Language vi",
    headers: { "accept-language": "vi-VN,vi;q=0.9" },
    expected: "vi",
  },
  {
    name: "NEXT_LOCALE cookie wins over Accept-Language",
    headers: { "accept-language": "vi-VN,vi;q=0.9", cookie: "NEXT_LOCALE=en" },
    expected: "en",
  },
] as const;

for (const { name, headers, expected } of NEGOTIATION) {
  test(`bare /admin negotiation — ${name}`, async ({ playwright, baseURL }) => {
    const ctx = await playwright.request.newContext({ baseURL });
    try {
      for (const target of [
        "/admin",
        "/admin/models",
        "/admin/models?foo=bar&q=1",
      ]) {
        const res = await ctx.get(target, { headers, maxRedirects: 0 });
        expect(res.status(), `${target} status`).toBe(307);
        const location = res.headers()["location"] ?? "";
        expect(new URL(location, baseURL).pathname + new URL(location, baseURL).search, target).toBe(
          `/${expected}${target}`,
        );
      }
    } finally {
      await ctx.dispose();
    }
  });
}

test("bare /admin/login also redirects (login is not exempt from the prefix)", async ({
  playwright,
  baseURL,
}) => {
  const ctx = await playwright.request.newContext({ baseURL });
  try {
    const res = await ctx.get("/admin/login", {
      headers: { "accept-language": "" },
      maxRedirects: 0,
    });
    expect(res.status()).toBe(307);
    expect(new URL(res.headers()["location"] ?? "", baseURL).pathname).toBe(
      "/vi/admin/login",
    );
  } finally {
    await ctx.dispose();
  }
});

/* ------------------------------------------------------------------ *
 * 4. Authenticated panel renders in the locale of its prefix
 * ------------------------------------------------------------------ */

/** From messages/{en,vi}.json → admin.nav / admin.common. */
const PANEL_COPY: Record<
  "en" | "vi",
  {
    brand: string;
    dashboard: string;
    models: string;
    leads: string;
    logout: string;
    /** Copy from the OTHER locale that must not appear. */
    foreign: string[];
  }
> = {
  en: {
    brand: "Admin",
    dashboard: "Dashboard",
    models: "Models",
    leads: "Leads",
    logout: "Sign out",
    foreign: ["Quản trị", "Tổng quan", "Đăng xuất", "Dòng xe"],
  },
  vi: {
    brand: "Quản trị",
    dashboard: "Tổng quan",
    models: "Dòng xe",
    leads: "Khách hàng tiềm năng",
    logout: "Đăng xuất",
    foreign: ["Dashboard", "Sign out", "Models"],
  },
};

for (const locale of ["en", "vi"] as const) {
  test(`/${locale}/admin panel renders in ${locale}`, async ({ page }) => {
    const console_ = captureConsole(page);
    const copy = PANEL_COPY[locale];

    await login(page, locale);
    await waitForHydration(page);

    await expect(page.locator("html")).toHaveAttribute("lang", locale);

    const nav = page.getByRole("navigation", { name: copy.brand });
    await expect(nav, `${locale} admin sidebar labelled "${copy.brand}"`).toBeVisible();
    await expect(nav.getByRole("link", { name: copy.dashboard })).toBeVisible();
    await expect(nav.getByRole("link", { name: copy.models })).toBeVisible();
    await expect(nav.getByRole("link", { name: copy.leads })).toBeVisible();
    await expect(
      page.getByRole("button", { name: copy.logout }),
    ).toBeVisible();

    // The other locale's copy must be absent — proves it is not defaultLocale
    // leaking through the intlMiddleware bypass.
    for (const foreign of copy.foreign) {
      await expect(
        page.getByText(foreign, { exact: true }),
        `${locale} panel must not show "${foreign}"`,
      ).toHaveCount(0);
    }

    // Sidebar hrefs stay locale-prefixed.
    const href = await nav
      .getByRole("link", { name: copy.models })
      .getAttribute("href");
    expect(href).toBe(`/${locale}/admin/models`);

    expect(console_.hydration(), `hydration on ${locale} admin`).toEqual([]);
    expect(console_.pageErrors(), `uncaught on ${locale} admin`).toEqual([]);
  });
}

test("admin session survives crossing locales (vi ↔ en)", async ({ page }) => {
  await login(page, "en");

  await page.goto("/vi/admin/models");
  await expect(page).not.toHaveURL(/admin\/login/);
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  await expect(
    page.getByRole("navigation", { name: "Quản trị" }),
  ).toBeVisible();

  await page.goto("/en/admin/models");
  await expect(page).not.toHaveURL(/admin\/login/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("navigation", { name: "Admin" })).toBeVisible();
});

test("admin panel routes render (no 404/500) for both locales", async ({
  page,
}) => {
  await login(page, "en");
  for (const path of [
    "/en/admin",
    "/en/admin/models",
    "/en/admin/leads",
    "/en/admin/media",
    "/en/admin/settings",
    "/vi/admin",
    "/vi/admin/models",
    "/vi/admin/leads",
  ]) {
    const res = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(res?.status(), `${path} status`).toBe(200);
    await expect(page.locator("main").first(), `${path} main`).toBeVisible();
  }
});

/**
 * KNOWN PRE-EXISTING DEFECT (also present in prod @58b7db6): the leads page
 * renders its own `<main>` inside the panel layout's `<main>` — two `main`
 * landmarks, invalid HTML. `test.fail()` keeps it visible without turning the
 * gate red; delete the marker once
 * `src/app/[locale]/(admin)/admin/(panel)/leads/page.tsx` drops its `<main>`.
 */
test("admin leads page exposes exactly one <main> landmark", async ({
  page,
}) => {
  test.fail();
  await login(page, "en");
  await page.goto("/en/admin/leads", { waitUntil: "domcontentloaded" });
  expect(await page.locator("main").count()).toBe(1);
});

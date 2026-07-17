import { expect, test, type Page } from "@playwright/test";

import {
  deleteE2eModelBySlug,
  disconnectE2eDb,
} from "./helpers/e2e-model-cleanup";

const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "";

test.describe.configure({ mode: "serial" });

test.beforeAll(() => {
  if (!adminPassword || adminPassword.length < 12) {
    throw new Error(
      "SEED_ADMIN_PASSWORD must be set (≥12 chars) for E2E — load web/.env",
    );
  }
});

test.afterAll(async () => {
  await disconnectE2eDb();
});

async function adminLogin(page: Page): Promise<void> {
  await page.goto("/admin/login");
  await page.locator("#email").fill(adminEmail);
  await page.locator("#password").fill(adminPassword);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin\/?$/);
  await expect(page.getByRole("heading", { name: "Admin" })).toBeVisible();
}

/** Drive the admin create form (createModelAction → createModel → bustModels). */
async function createModelViaUi(
  page: Page,
  opts: { slug: string; name: string; published: boolean },
): Promise<void> {
  await page.goto("/admin/models/new");
  await expect(
    page.getByRole("heading", { name: "Create model" }),
  ).toBeVisible();
  await expect(page.locator("#segmentId option").first()).toBeAttached();
  await page.locator("#name").fill(opts.name);
  await page.locator("#slug").fill(opts.slug);
  const published = page.locator("#published");
  if (opts.published) {
    await published.check();
  } else {
    await published.uncheck();
  }
  await page.getByRole("button", { name: "Create" }).click();
  await expect(page.getByTestId("created-slug")).toHaveAttribute(
    "data-slug",
    opts.slug,
  );
}

/**
 * Bust the running server's `models` Data Cache so a stale `/vi` drops the E2E
 * card immediately — without a rebuild or the 300s revalidate wait.
 *
 * The raw-Prisma delete runs in this test process and cannot fire the server's
 * `revalidateTag('models')`. The only models-mutating server action wired to a
 * browser-drivable UI is create, and `createModel` calls `bustModels()`. So we
 * create an UNPUBLISHED throwaway (excluded from `listPublishedModels`, never
 * shown on the grid) to trigger the in-process revalidateTag, then delete it.
 *
 * ponytail: workaround — no admin *delete* UI exists yet to drive
 * `deleteModelAction` directly. Upgrade path: once a minimal admin model-delete
 * affordance exists, delete the created model through it here (fires
 * revalidateTag in one step) and drop this throwaway.
 */
async function bustModelsCacheViaServer(page: Page): Promise<void> {
  const bustSlug = `e2e-model-${Date.now()}`;
  try {
    await adminLogin(page);
    await createModelViaUi(page, {
      slug: bustSlug,
      name: `E2E Model ${bustSlug}`,
      published: false,
    });
  } finally {
    await deleteE2eModelBySlug(bustSlug);
  }
}

test("health endpoint is ok", async ({ request }) => {
  const res = await request.get("/api/health");
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body).toMatchObject({ status: "ok" });
});

test("login → create model via action → public model API reflects it", async ({
  page,
  request,
}) => {
  const slug = `e2e-model-${Date.now()}`;

  try {
    await adminLogin(page);
    await createModelViaUi(page, {
      slug,
      name: `E2E Model ${slug}`,
      published: true,
    });

    // Cache bust via revalidateTag — public API should see the new model.
    await expect
      .poll(
        async () => {
          const res = await request.get(
            `/api/models/${encodeURIComponent(slug)}?locale=vi`,
          );
          return res.status();
        },
        { timeout: 15_000 },
      )
      .toBe(200);

    const modelRes = await request.get(
      `/api/models/${encodeURIComponent(slug)}?locale=vi`,
    );
    const payload = await modelRes.json();
    expect(payload).toEqual(
      expect.objectContaining({
        units: expect.any(Array),
        attributes: expect.arrayContaining([
          expect.objectContaining({ key: "range", unit: "km" }),
          expect.objectContaining({ key: "power", unit: "kW" }),
        ]),
      }),
    );
    expect(Object.keys(payload).sort()).toEqual(["attributes", "units"]);
    for (const attr of payload.attributes) {
      expect(Object.keys(attr).sort()).toEqual(["key", "unit", "value"]);
    }
  } finally {
    // 1) Critical: remove the published E2E row from the DB (runs even on
    //    assertion failure).
    await deleteE2eModelBySlug(slug);
    // 2) Fire the server's revalidateTag('models') so /vi drops the E2E card
    //    with no rebuild. Best-effort: never mask a primary assertion failure.
    try {
      await bustModelsCacheViaServer(page);
    } catch (error) {
      console.warn("[e2e] models cache bust failed:", error);
    }
  }
});

test("submit lead → appears via leads service; rate-limit burst returns 429", async ({
  page,
  request,
}) => {
  const uniqueName = `E2E Lead ${Date.now()}`;
  const createRes = await request.post("/api/leads", {
    data: {
      type: "CONSULT",
      locale: "vi",
      payload: {
        name: uniqueName,
        phone: "0901234567",
        email: "e2e@example.com",
        consent: true,
      },
    },
  });
  expect(createRes.status()).toBe(201);
  const { id: leadId } = (await createRes.json()) as { id: string };
  expect(leadId).toBeTruthy();

  await adminLogin(page);
  await page.goto("/admin/leads");
  await expect(page.getByTestId("leads-list")).toBeVisible();
  await expect(page.locator(`[data-lead-id="${leadId}"]`)).toBeVisible();

  // Burst over capacity (5) → 429. Unique IP so other tests aren't polluted.
  const burstIp = `203.0.113.${Math.floor(Math.random() * 200) + 1}`;
  let saw429 = false;
  for (let i = 0; i < 8; i++) {
    const res = await request.post("/api/leads", {
      headers: { "x-forwarded-for": burstIp },
      data: {
        type: "TEST_DRIVE",
        locale: "en",
        payload: {
          name: `Burst ${i}`,
          phone: "0912345678",
          consent: true,
        },
      },
    });
    if (res.status() === 429) {
      saw429 = true;
      const body = await res.json();
      expect(body.error?.code).toBe("RATE_LIMITED");
      break;
    }
  }
  expect(saw429).toBe(true);
});

test("POST /api/leads rejects missing consent", async ({ request }) => {
  const res = await request.post("/api/leads", {
    data: {
      type: "DEPOSIT",
      locale: "vi",
      payload: {
        name: "No Consent",
        phone: "0900000000",
        consent: false,
      },
    },
  });
  expect(res.status()).toBe(400);
  const body = await res.json();
  expect(body.error?.code).toBe("VALIDATION_ERROR");
});

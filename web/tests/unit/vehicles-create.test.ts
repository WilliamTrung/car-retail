import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/server/modules/vehicles/vehicles.repository", () => ({
  createModel: vi.fn(),
  findModelById: vi.fn(),
  listPublishedModels: vi.fn(),
  listAdminModels: vi.fn(),
  listLines: vi.fn(),
  updateModel: vi.fn(),
  deleteModel: vi.fn(),
  findPublishedModelWithDetails: vi.fn(),
  findTemplateByIdOrKey: vi.fn(),
  createLine: vi.fn(),
  updateLine: vi.fn(),
  deleteLine: vi.fn(),
  createSegment: vi.fn(),
  updateSegment: vi.fn(),
  deleteSegment: vi.fn(),
  createVariant: vi.fn(),
  updateVariant: vi.fn(),
  deleteVariant: vi.fn(),
  createFeatureSection: vi.fn(),
  updateFeatureSection: vi.fn(),
  deleteFeatureSection: vi.fn(),
  createModelFaq: vi.fn(),
  updateModelFaq: vi.fn(),
  deleteModelFaq: vi.fn(),
}));

const revalidateTags = vi.fn();

vi.mock("@/server/cache/tags", () => ({
  TAGS: {
    siteSettings: "site-settings",
    menu: "menu",
    units: "units",
    models: "models",
    hero: "hero",
    services: "services",
    news: "news",
    pages: "pages",
    policies: "policies",
    faqs: "faqs",
    showrooms: "showrooms",
    hotlines: "hotlines",
  },
  revalidateTags: (...args: unknown[]) => revalidateTags(...args),
  cachedRead: (_keys: string[], fn: () => Promise<unknown>) => fn(),
}));

import * as repo from "@/server/modules/vehicles/vehicles.repository";
import { createModel } from "@/server/modules/vehicles/vehicles.service";

describe("vehicles.createModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid input without writing", async () => {
    const result = await createModel({ name: "nope" });
    expect(result.ok).toBe(false);
    expect(repo.createModel).not.toHaveBeenCalled();
  });

  it("persists and busts models cache tag", async () => {
    const now = new Date();
    vi.mocked(repo.createModel).mockResolvedValue({
      id: "m-new",
      segmentId: "seg-1",
      name: { vi: "Test", en: "Test" },
      slug: { vi: "test", en: "test" },
      tagline: null,
      description: null,
      meta: null,
      heroMediaId: null,
      gallery: [],
      colorSwatches: [],
      promo: null,
      attributes: [{ key: "range", value: 400, unit: "km" }],
      published: true,
      sortOrder: 0,
      createdAt: now,
      updatedAt: now,
    });

    const result = await createModel({
      segmentId: "seg-1",
      name: { vi: "Test", en: "Test" },
      slug: { vi: "test", en: "test" },
      attributes: [{ key: "range", value: 400, unit: "km" }],
      published: true,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.id).toBe("m-new");
      expect(result.data.published).toBe(true);
    }
    expect(revalidateTags).toHaveBeenCalledWith("models");
  });
});

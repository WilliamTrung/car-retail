import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";

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

vi.mock("@/server/modules/vehicles/vehicles.repository", () => ({
  findModelById: vi.fn(),
  findTemplateByIdOrKey: vi.fn(),
  updateModel: vi.fn(),
  listPublishedModels: vi.fn(),
  listAdminModels: vi.fn(),
  listLines: vi.fn(),
  createLine: vi.fn(),
  updateLine: vi.fn(),
  deleteLine: vi.fn(),
  createSegment: vi.fn(),
  updateSegment: vi.fn(),
  deleteSegment: vi.fn(),
  createModel: vi.fn(),
  deleteModel: vi.fn(),
  findPublishedModelWithDetails: vi.fn(),
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

import {
  applyTemplateAttributes,
  decimalToNumber,
  toModelDto,
  toVariantDto,
} from "@/server/modules/vehicles/vehicles.mapper";
import * as repo from "@/server/modules/vehicles/vehicles.repository";
import {
  applyTemplate,
  getPublishedModels,
} from "@/server/modules/vehicles/vehicles.service";

describe("toModelDto colorSwatches and promo", () => {
  const baseRow = {
    id: "model-1",
    segmentId: "seg-1",
    name: { vi: "VF 8", en: "VF 8" },
    slug: { vi: "vf-8", en: "vf-8" },
    tagline: null,
    description: null,
    meta: null,
    heroMediaId: null,
    gallery: [],
    attributes: [],
    published: true,
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("parses colorSwatches and promo from row", () => {
    const dto = toModelDto({
      ...baseRow,
      colorSwatches: [
        { name: { vi: "Trắng", en: "White" }, hex: "#FFFFFF" },
        { name: { vi: "Đen", en: "Black" }, hex: "#000000" },
      ],
      promo: {
        bullets: [
          { vi: "Ưu đãi sạc", en: "Charging offer" },
          { vi: "Bảo hành pin", en: "Battery warranty" },
        ],
        dateRange: { vi: "Đến 31/12", en: "Until Dec 31" },
      },
    });
    expect(dto.colorSwatches).toEqual([
      { name: { vi: "Trắng", en: "White" }, hex: "#FFFFFF" },
      { name: { vi: "Đen", en: "Black" }, hex: "#000000" },
    ]);
    expect(dto.promo).toEqual({
      bullets: [
        { vi: "Ưu đãi sạc", en: "Charging offer" },
        { vi: "Bảo hành pin", en: "Battery warranty" },
      ],
      dateRange: { vi: "Đến 31/12", en: "Until Dec 31" },
    });
  });

  it("defaults colorSwatches to [] and promo to null", () => {
    const dto = toModelDto({
      ...baseRow,
      colorSwatches: null as unknown as [],
      promo: null,
    });
    expect(dto.colorSwatches).toEqual([]);
    expect(dto.promo).toBeNull();
  });
});

describe("decimalToNumber / variant mapper", () => {
  it("serializes Prisma Decimal price to number", () => {
    const price = new Prisma.Decimal("1250000000");
    expect(decimalToNumber(price)).toBe(1250000000);

    const dto = toVariantDto({
      id: "v1",
      modelId: "m1",
      name: { vi: "Base", en: "Base" },
      price,
      attributes: [],
      allowDeposit: true,
      allowTestDrive: true,
      published: true,
      sortOrder: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(dto.price).toBe(1250000000);
    expect(typeof dto.price).toBe("number");
  });

  it("maps null price to null", () => {
    expect(decimalToNumber(null)).toBeNull();
  });
});

describe("applyTemplateAttributes", () => {
  const existing = [
    { key: "range", value: 400, unit: "km" },
    { key: "custom", value: "keep-me", unit: "none" },
  ];
  const templateItems = [
    { key: "range", unit: "km", defaultValue: 450, sortOrder: 1 },
    { key: "power", unit: "kW", defaultValue: 150, sortOrder: 2 },
  ];

  it("replace mode overwrites the full list", () => {
    const next = applyTemplateAttributes(existing, templateItems, "replace");
    expect(next).toEqual([
      { key: "range", value: 450, unit: "km" },
      { key: "power", value: 150, unit: "kW" },
    ]);
  });

  it("merge mode upserts template keys and keeps others", () => {
    const next = applyTemplateAttributes(existing, templateItems, "merge");
    expect(next).toEqual([
      { key: "range", value: 450, unit: "km" },
      { key: "custom", value: "keep-me", unit: "none" },
      { key: "power", value: 150, unit: "kW" },
    ]);
  });
});

describe("vehicles.getPublishedModels", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("includes segment.line.key on list DTO items", async () => {
    const now = new Date();
    vi.mocked(repo.listPublishedModels).mockResolvedValue([
      {
        id: "model-1",
        segmentId: "seg-suv",
        name: { vi: "VF 8", en: "VF 8" },
        slug: { vi: "vf-8", en: "vf-8" },
        tagline: null,
        description: null,
        meta: null,
        heroMediaId: null,
        gallery: [],
        colorSwatches: [],
        promo: null,
        attributes: [],
        published: true,
        sortOrder: 0,
        createdAt: now,
        updatedAt: now,
        heroMedia: null,
        variants: [],
        segment: {
          id: "seg-suv",
          lineId: "line-personal",
          key: "suv",
          name: { vi: "SUV", en: "SUV" },
          sortOrder: 1,
          createdAt: now,
          updatedAt: now,
          line: {
            id: "line-personal",
            key: "personal",
            name: { vi: "Xe cá nhân", en: "Personal" },
            sortOrder: 0,
            createdAt: now,
            updatedAt: now,
          },
        },
      },
    ]);

    const models = await getPublishedModels();

    expect(models).toHaveLength(1);
    expect(models[0]?.segment?.line.key).toBe("personal");
  });
});

describe("vehicles.applyTemplate service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("merges attributes and calls revalidateTags", async () => {
    const now = new Date();
    vi.mocked(repo.findTemplateByIdOrKey).mockResolvedValue({
      id: "tpl-1",
      key: "electric-suv-standard",
      name: { vi: "SUV", en: "SUV" },
      items: [
        { key: "range", unit: "km", defaultValue: 450, sortOrder: 1 },
        { key: "power", unit: "kW", defaultValue: 150, sortOrder: 2 },
      ],
      createdAt: now,
      updatedAt: now,
    });
    vi.mocked(repo.findModelById).mockResolvedValue({
      id: "model-1",
      segmentId: "seg-1",
      name: { vi: "VF", en: "VF" },
      slug: { vi: "vf", en: "vf" },
      tagline: null,
      description: null,
      meta: null,
      heroMediaId: null,
      gallery: [],
      colorSwatches: [],
      promo: null,
      attributes: [
        { key: "range", value: 400, unit: "km" },
        { key: "custom", value: "x", unit: "none" },
      ],
      published: false,
      sortOrder: 0,
      createdAt: now,
      updatedAt: now,
      variants: [],
      featureSections: [],
      faqs: [],
      segment: null as never,
      heroMedia: null,
    });
    vi.mocked(repo.updateModel).mockImplementation(async (_id, data) =>
      ({
        id: "model-1",
        segmentId: "seg-1",
        name: { vi: "VF", en: "VF" },
        slug: { vi: "vf", en: "vf" },
        tagline: null,
        description: null,
        meta: null,
        heroMediaId: null,
        gallery: [],
        colorSwatches: [],
        promo: null,
        attributes: (data.attributes ?? []) as object,
        published: false,
        sortOrder: 0,
        createdAt: now,
        updatedAt: now,
      }) as Awaited<ReturnType<typeof repo.updateModel>>,
    );

    const result = await applyTemplate({
      modelId: "model-1",
      templateId: "tpl-1",
      mode: "merge",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.attributes).toEqual([
        { key: "range", value: 450, unit: "km" },
        { key: "custom", value: "x", unit: "none" },
        { key: "power", value: 150, unit: "kW" },
      ]);
    }
    expect(revalidateTags).toHaveBeenCalledWith("models");
  });

  it("replace mode replaces all attributes", async () => {
    const now = new Date();
    vi.mocked(repo.findTemplateByIdOrKey).mockResolvedValue({
      id: "tpl-1",
      key: "t",
      name: { vi: "T", en: "T" },
      items: [{ key: "seats", unit: "seats", defaultValue: 5, sortOrder: 1 }],
      createdAt: now,
      updatedAt: now,
    });
    vi.mocked(repo.findModelById).mockResolvedValue({
      id: "model-1",
      segmentId: "seg-1",
      name: { vi: "VF", en: "VF" },
      slug: { vi: "vf", en: "vf" },
      tagline: null,
      description: null,
      meta: null,
      heroMediaId: null,
      gallery: [],
      colorSwatches: [],
      promo: null,
      attributes: [{ key: "old", value: 1, unit: "x" }],
      published: false,
      sortOrder: 0,
      createdAt: now,
      updatedAt: now,
      variants: [],
      featureSections: [],
      faqs: [],
      segment: null as never,
      heroMedia: null,
    });
    vi.mocked(repo.updateModel).mockImplementation(async (_id, data) =>
      ({
        id: "model-1",
        segmentId: "seg-1",
        name: { vi: "VF", en: "VF" },
        slug: { vi: "vf", en: "vf" },
        tagline: null,
        description: null,
        meta: null,
        heroMediaId: null,
        gallery: [],
        colorSwatches: [],
        promo: null,
        attributes: (data.attributes ?? []) as object,
        published: false,
        sortOrder: 0,
        createdAt: now,
        updatedAt: now,
      }) as Awaited<ReturnType<typeof repo.updateModel>>,
    );

    const result = await applyTemplate({
      modelId: "model-1",
      templateKey: "t",
      mode: "replace",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.attributes).toEqual([
        { key: "seats", value: 5, unit: "seats" },
      ]);
    }
    expect(revalidateTags).toHaveBeenCalledWith("models");
  });
});

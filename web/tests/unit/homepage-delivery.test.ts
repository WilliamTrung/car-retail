import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DeliveryPhoto } from "@prisma/client";

const revalidateTags = vi.fn();
let cachedReadTags: string[] = [];

vi.mock("@/server/cache/tags", () => ({
  TAGS: {
    siteSettings: "site-settings",
    menu: "menu",
    units: "units",
    models: "models",
    hero: "hero",
    delivery: "delivery",
    services: "services",
    news: "news",
    pages: "pages",
    policies: "policies",
    faqs: "faqs",
    showrooms: "showrooms",
    hotlines: "hotlines",
  },
  revalidateTags: (...args: unknown[]) => revalidateTags(...args),
  cachedRead: (
    _keys: string[],
    fn: () => Promise<unknown>,
    tags: string[],
  ) => {
    cachedReadTags = tags;
    return fn();
  },
}));

vi.mock("@/server/modules/homepage/homepage.repository", () => ({
  listPublishedDeliveryPhotos: vi.fn(),
  createDeliveryPhoto: vi.fn(),
  updateDeliveryPhoto: vi.fn(),
  deleteDeliveryPhoto: vi.fn(),
}));

import * as repo from "@/server/modules/homepage/homepage.repository";
import {
  createDeliveryPhoto,
  deleteDeliveryPhoto,
  getDeliveryPhotos,
  updateDeliveryPhoto,
} from "@/server/modules/homepage/homepage.service";

const sampleRow = {
  id: "dp-1",
  caption: { vi: "Bàn giao", en: "Handover" },
  imageMediaId: "media-1",
  sortOrder: 1,
  published: true,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-02"),
  imageMedia: {
    id: "media-1",
    r2Key: "site/delivery.png",
    publicUrl: "https://cdn.example/delivery.png",
    folder: "SITE" as const,
    mimeType: "image/png",
    sizeBytes: 1024,
    altText: { vi: "Ảnh", en: "Photo" },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

describe("homepage delivery photos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cachedReadTags = [];
  });

  it("getDeliveryPhotos uses cachedRead with TAGS.delivery", async () => {
    vi.mocked(repo.listPublishedDeliveryPhotos).mockResolvedValue([sampleRow]);

    const result = await getDeliveryPhotos();

    expect(cachedReadTags).toEqual(["delivery"]);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "dp-1",
      imageUrl: "https://cdn.example/delivery.png",
      caption: { vi: "Bàn giao", en: "Handover" },
    });
  });

  it("createDeliveryPhoto revalidates delivery tag", async () => {
    vi.mocked(repo.createDeliveryPhoto).mockResolvedValue({
      ...sampleRow,
      imageMedia: undefined,
    } as DeliveryPhoto);

    const result = await createDeliveryPhoto({
      caption: { vi: "Bàn giao", en: "Handover" },
      imageMediaId: "media-1",
    });

    expect(result.ok).toBe(true);
    expect(revalidateTags).toHaveBeenCalledWith("delivery");
  });

  it("updateDeliveryPhoto revalidates delivery tag", async () => {
    vi.mocked(repo.updateDeliveryPhoto).mockResolvedValue({
      ...sampleRow,
      imageMedia: undefined,
    } as DeliveryPhoto);

    const result = await updateDeliveryPhoto("dp-1", { published: false });

    expect(result.ok).toBe(true);
    expect(revalidateTags).toHaveBeenCalledWith("delivery");
  });

  it("deleteDeliveryPhoto revalidates delivery tag", async () => {
    vi.mocked(repo.deleteDeliveryPhoto).mockResolvedValue(sampleRow);

    const result = await deleteDeliveryPhoto("dp-1");

    expect(result.ok).toBe(true);
    expect(revalidateTags).toHaveBeenCalledWith("delivery");
  });
});

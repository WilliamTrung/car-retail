import { beforeEach, describe, expect, it, vi } from "vitest";

const findUnique = vi.fn();

vi.mock("@/server/db/prisma", () => ({
  prisma: {
    vehicleModel: {
      findUnique: (...args: unknown[]) => findUnique(...args),
    },
  },
}));

import { findPublishedModelBySlug } from "@/server/modules/vehicles/vehicles.repository";

describe("findPublishedModelBySlug (slugKey / slugKeyEn)", () => {
  const now = new Date();
  const divergentRow = {
    id: "model-divergent",
    segmentId: "seg-1",
    name: { vi: "Xe điện đô thị", en: "City EV" },
    slug: { vi: "xe-dien-do-thi", en: "city-ev" },
    slugKey: "xe-dien-do-thi",
    slugKeyEn: "city-ev",
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
    segment: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("looks up by slugKey for vi locale", async () => {
    findUnique.mockResolvedValue(divergentRow);

    const row = await findPublishedModelBySlug("xe-dien-do-thi", "vi");

    expect(findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slugKey: "xe-dien-do-thi" },
      }),
    );
    expect(row?.id).toBe("model-divergent");
  });

  it("looks up by slugKeyEn for en locale", async () => {
    findUnique.mockResolvedValue(divergentRow);

    const row = await findPublishedModelBySlug("city-ev", "en");

    expect(findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slugKeyEn: "city-ev" },
      }),
    );
    expect(row?.id).toBe("model-divergent");
  });

  it("returns null when locale slug JSON does not match (cross-locale)", async () => {
    // Wrong key path still returned a row — guard rejects mismatched locale slug.
    findUnique.mockResolvedValue(divergentRow);

    const cross = await findPublishedModelBySlug("xe-dien-do-thi", "en");

    expect(findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slugKeyEn: "xe-dien-do-thi" },
      }),
    );
    expect(cross).toBeNull();
  });

  it("returns null when no row matches", async () => {
    findUnique.mockResolvedValue(null);

    expect(await findPublishedModelBySlug("missing", "vi")).toBeNull();
    expect(await findPublishedModelBySlug("missing", "en")).toBeNull();
  });

  it("returns null when row is unpublished", async () => {
    findUnique.mockResolvedValue({ ...divergentRow, published: false });

    expect(await findPublishedModelBySlug("city-ev", "en")).toBeNull();
  });
});

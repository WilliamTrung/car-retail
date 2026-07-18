import { describe, expect, it, vi } from "vitest";
import { linkMedia } from "../../prisma/seed-media-run.js";

type Db = Parameters<typeof linkMedia>[0];

function fakeDb(count: number) {
  const updateMany = vi.fn().mockResolvedValue({ count });
  const db = {
    vehicleModel: { updateMany },
    heroSlide: { updateMany },
    newsPost: { updateMany },
    deliveryPhoto: { updateMany },
    featureSection: { updateMany },
  } as unknown as Db;
  return { db, updateMany };
}

describe("seed-media linkMedia", () => {
  it("links when the target row exists", async () => {
    const { db, updateMany } = fakeDb(1);
    const linked = await linkMedia(
      db,
      { table: "vehicleModel", entityId: "seed-model-city-ev", field: "heroMediaId" },
      "seed-media-city-ev-hero",
    );
    expect(linked).toBe(true);
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: "seed-model-city-ev" },
      data: { heroMediaId: "seed-media-city-ev-hero" },
    });
  });

  it("skips (no throw) when the target row is missing — the prod P2025 case", async () => {
    // unknown model id → updateMany count 0
    const { db } = fakeDb(0);
    await expect(
      linkMedia(
        db,
        { table: "vehicleModel", entityId: "seed-model-missing", field: "heroMediaId" },
        "seed-media-missing-hero",
      ),
    ).resolves.toBe(false);
  });

  it("rejects unknown link tables", async () => {
    const { db } = fakeDb(1);
    await expect(
      linkMedia(db, { table: "nope", entityId: "x", field: "y" }, "z"),
    ).rejects.toThrow("Unsupported media link table");
  });
});

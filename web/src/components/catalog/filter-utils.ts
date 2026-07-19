import type { ModelCardVM } from "@/lib/view-models/model-card";

export type CatalogSegment = "all" | "personal" | "commercial";
export type CatalogSort = "price-asc" | "price-desc" | "name";

export type RangeBucket = "all" | "under300" | "mid" | "high";

export type CatalogFiltersState = {
  segment: CatalogSegment;
  priceMin: number;
  priceMax: number;
  seats: number | null;
  range: RangeBucket;
  sort: CatalogSort;
};

export type CatalogModel = ModelCardVM & {
  seatsNum: number | null;
  rangeKm: number | null;
};

export function parseChipNumber(
  model: ModelCardVM,
  key: "range" | "power" | "seats",
): number | null {
  const chip = model.specChips.find((c) => c.key === key);
  if (!chip || !chip.value || chip.value === "—") return null;
  const n = Number(String(chip.value).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export function toCatalogModel(model: ModelCardVM): CatalogModel {
  return {
    ...model,
    seatsNum: parseChipNumber(model, "seats"),
    rangeKm: parseChipNumber(model, "range"),
  };
}

export function priceBounds(models: CatalogModel[]): {
  min: number;
  max: number;
} {
  const prices = models
    .map((m) => m.priceFromVnd)
    .filter((p): p is number => p != null && Number.isFinite(p));
  if (!prices.length) return { min: 0, max: 0 };
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function uniqueSeats(models: CatalogModel[]): number[] {
  const set = new Set<number>();
  for (const m of models) {
    if (m.seatsNum != null) set.add(m.seatsNum);
  }
  return [...set].sort((a, b) => a - b);
}

export function defaultFilters(
  models: CatalogModel[],
): CatalogFiltersState {
  const { min, max } = priceBounds(models);
  return {
    segment: "all",
    priceMin: min,
    priceMax: max,
    seats: null,
    range: "all",
    sort: "name",
  };
}

function matchesRange(km: number | null, bucket: RangeBucket): boolean {
  if (bucket === "all") return true;
  if (km == null) return false;
  if (bucket === "under300") return km < 300;
  if (bucket === "mid") return km >= 300 && km < 450;
  return km >= 450;
}

export function applyFilters(
  models: CatalogModel[],
  filters: CatalogFiltersState,
): CatalogModel[] {
  const filtered = models.filter((m) => {
    if (filters.segment !== "all" && m.segment !== filters.segment) {
      return false;
    }
    if (m.priceFromVnd != null) {
      if (m.priceFromVnd < filters.priceMin || m.priceFromVnd > filters.priceMax) {
        return false;
      }
    } else if (filters.priceMin > 0 || filters.priceMax > 0) {
      // No price → only keep when range is still at full bounds (handled by caller
      // resetting bounds); treat missing price as failing a narrowed price filter.
      const { min, max } = priceBounds(models);
      if (filters.priceMin > min || filters.priceMax < max) return false;
    }
    if (filters.seats != null && m.seatsNum !== filters.seats) return false;
    if (!matchesRange(m.rangeKm, filters.range)) return false;
    return true;
  });

  const sorted = [...filtered];
  sorted.sort((a, b) => {
    if (filters.sort === "name") {
      return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
    }
    const pa = a.priceFromVnd ?? Number.POSITIVE_INFINITY;
    const pb = b.priceFromVnd ?? Number.POSITIVE_INFINITY;
    return filters.sort === "price-asc" ? pa - pb : pb - pa;
  });
  return sorted;
}

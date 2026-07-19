"use client";

import { useMemo, useState, useTransition } from "react";
import type { Locale } from "@/lib/view-models/common";
import { ModelCard } from "@/components/ui/ModelCard";
import {
  CatalogFilters,
  type CatalogFilterLabels,
} from "./CatalogFilters";
import {
  applyFilters,
  defaultFilters,
  priceBounds,
  uniqueSeats,
  type CatalogModel,
  type CatalogSort,
} from "./filter-utils";
import styles from "./CatalogClient.module.css";

export type CatalogClientLabels = CatalogFilterLabels & {
  resultCount: string;
  resultCountFiltered: string;
  sortLabel: string;
  sortName: string;
  sortPriceAsc: string;
  sortPriceDesc: string;
  empty: string;
  priceFrom: string;
  contactPrice: string;
  viewDetails: string;
  testDrive: string;
  eco: string;
};

type CatalogClientProps = {
  models: CatalogModel[];
  locale: Locale;
  labels: CatalogClientLabels;
};

export function CatalogClient({ models, locale, labels }: CatalogClientProps) {
  const bounds = useMemo(() => priceBounds(models), [models]);
  const seatOptions = useMemo(() => uniqueSeats(models), [models]);
  const [filters, setFilters] = useState(() => defaultFilters(models));
  const [isPending, startTransition] = useTransition();

  const visible = useMemo(
    () => applyFilters(models, filters),
    [models, filters],
  );

  // Honest count: header number === cards rendered (or explicit filtered form).
  const countLabel =
    visible.length === models.length
      ? labels.resultCount.replace("{count}", String(visible.length))
      : labels.resultCountFiltered
          .replace("{count}", String(visible.length))
          .replace("{total}", String(models.length));

  function patch(next: typeof filters) {
    startTransition(() => setFilters(next));
  }

  return (
    <div className={styles.layout}>
      <CatalogFilters
        locale={locale}
        labels={labels}
        value={filters}
        bounds={bounds}
        seatOptions={seatOptions}
        onChange={patch}
        onReset={() => patch(defaultFilters(models))}
      />

      <div className={styles.results}>
        <div className={styles.resultsHead}>
          <p className={styles.count} aria-live="polite">
            {countLabel}
          </p>
          <label className={styles.sort}>
            <span className={styles.sortLabel}>{labels.sortLabel}</span>
            <select
              className={styles.sortSelect}
              value={filters.sort}
              aria-label={labels.sortLabel}
              onChange={(e) =>
                patch({
                  ...filters,
                  sort: e.target.value as CatalogSort,
                })
              }
            >
              <option value="name">{labels.sortName}</option>
              <option value="price-asc">{labels.sortPriceAsc}</option>
              <option value="price-desc">{labels.sortPriceDesc}</option>
            </select>
          </label>
        </div>

        {visible.length === 0 ? (
          <p className={styles.empty} role="status">
            {labels.empty}
          </p>
        ) : (
          <ul
            className={[styles.grid, isPending ? styles.pending : null]
              .filter(Boolean)
              .join(" ")}
          >
            {visible.map((model) => (
              <li key={model.id}>
                <ModelCard
                  model={model}
                  locale={locale}
                  variant="flat"
                  labels={{
                    priceFrom: labels.priceFrom,
                    contactPrice: labels.contactPrice,
                    viewDetails: labels.viewDetails,
                    testDrive: labels.testDrive,
                    eco: labels.eco,
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

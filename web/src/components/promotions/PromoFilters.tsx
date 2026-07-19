"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import type {
  OfferType,
  PromoListingCardVM,
} from "@/lib/view-models/promotion";
import { PromoListingCard } from "./PromoListingCard";
import styles from "./PromoFilters.module.css";

export type OfferFilter = "all" | OfferType;

export type PromoFiltersLabels = {
  toolbarTitle: string;
  filterAll: string;
  offerType: Record<OfferType, string>;
  sortLabel: string;
  sortEndingSoon: string;
  filterEmpty: string;
  clearFilter: string;
  applicableLabel: string;
  listHeading: string;
};

type CountdownLabels = {
  days?: string;
  hours?: string;
  minutes?: string;
  seconds?: string;
  heading?: string;
};

const OFFER_TYPES: OfferType[] = [
  "site_wide",
  "by_model",
  "financing",
  "trade_in",
  "special_group",
];

type PromoFiltersProps = {
  cards: PromoListingCardVM[];
  labels: PromoFiltersLabels;
  countdownLabels?: CountdownLabels;
  /** Between toolbar and grid; hidden when filter excludes its offer type. */
  spotlight?: ReactNode;
  spotlightOfferType?: OfferType;
};

function sortEndingSoon(a: PromoListingCardVM, b: PromoListingCardVM): number {
  return a.endsAtMs - b.endsAtMs;
}

export function PromoFilters({
  cards,
  labels,
  countdownLabels,
  spotlight,
  spotlightOfferType,
}: PromoFiltersProps) {
  const [offerFilter, setOfferFilter] = useState<OfferFilter>("all");

  const visible = useMemo(() => {
    const filtered =
      offerFilter === "all"
        ? cards
        : cards.filter((p) => p.offerType === offerFilter);
    return [...filtered].sort(sortEndingSoon);
  }, [cards, offerFilter]);

  const showSpotlight =
    Boolean(spotlight) &&
    (offerFilter === "all" ||
      (spotlightOfferType != null && offerFilter === spotlightOfferType));

  return (
    <div className={styles.root}>
      <div
        className={styles.toolbar}
        role="region"
        aria-labelledby="promo-filters-label"
      >
        <span id="promo-filters-label" className={styles.srOnly}>
          {labels.toolbarTitle}
        </span>
        <div
          className={styles.pills}
          role="group"
          aria-label={labels.toolbarTitle}
        >
          <button
            type="button"
            className={
              offerFilter === "all" ? styles.pillActive : styles.pill
            }
            aria-pressed={offerFilter === "all"}
            onClick={() => setOfferFilter("all")}
          >
            {labels.filterAll}
          </button>
          {OFFER_TYPES.map((key) => (
            <button
              key={key}
              type="button"
              className={
                offerFilter === key ? styles.pillActive : styles.pill
              }
              aria-pressed={offerFilter === key}
              onClick={() => setOfferFilter(key)}
            >
              {labels.offerType[key]}
            </button>
          ))}
        </div>
        <label className={styles.sort}>
          <span className={styles.sortLabel}>{labels.sortLabel}</span>
          <select
            className={styles.sortSelect}
            value="ending-soon"
            aria-label={labels.sortLabel}
            onChange={() => {
              /* Ending-soon is the only sort — kept as select for design parity */
            }}
          >
            <option value="ending-soon">{labels.sortEndingSoon}</option>
          </select>
        </label>
      </div>

      {showSpotlight ? spotlight : null}

      <section
        className={styles.gridSection}
        aria-labelledby="promo-list-heading"
      >
        <div className={styles.gridInner}>
          <h2 id="promo-list-heading" className={styles.listHeading}>
            {labels.listHeading}
          </h2>
          {visible.length === 0 ? (
            <div className={styles.filterEmpty} role="status">
              <p className={styles.filterEmptyText}>{labels.filterEmpty}</p>
              <Button
                variant="secondary"
                size="md"
                type="button"
                onClick={() => setOfferFilter("all")}
              >
                {labels.clearFilter}
              </Button>
            </div>
          ) : (
            <ul className={styles.grid}>
              {visible.map((promo) => (
                <li key={promo.id}>
                  <PromoListingCard
                    promo={promo}
                    countdownLabels={countdownLabels}
                    applicableLabel={labels.applicableLabel}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

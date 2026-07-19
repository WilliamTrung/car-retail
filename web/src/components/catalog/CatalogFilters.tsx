"use client";

import type { ReactNode } from "react";
import { formatVnd } from "@/lib/format";
import type { Locale } from "@/lib/view-models/common";
import type {
  CatalogFiltersState,
  CatalogSegment,
  RangeBucket,
} from "./filter-utils";
import styles from "./CatalogFilters.module.css";

export type CatalogFilterLabels = {
  filtersTitle: string;
  reset: string;
  segmentLabel: string;
  segmentAll: string;
  segmentPersonal: string;
  segmentCommercial: string;
  priceLabel: string;
  priceMin: string;
  priceMax: string;
  seatsLabel: string;
  seatsAll: string;
  seatsValue: string;
  rangeLabel: string;
  rangeAll: string;
  rangeUnder300: string;
  rangeMid: string;
  rangeHigh: string;
};

type CatalogFiltersProps = {
  locale: Locale;
  labels: CatalogFilterLabels;
  value: CatalogFiltersState;
  bounds: { min: number; max: number };
  seatOptions: number[];
  onChange: (next: CatalogFiltersState) => void;
  onReset: () => void;
};

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={[styles.pill, active ? styles.pillActive : null]
        .filter(Boolean)
        .join(" ")}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

const SEGMENTS: CatalogSegment[] = ["all", "personal", "commercial"];
const RANGES: RangeBucket[] = ["all", "under300", "mid", "high"];

export function CatalogFilters({
  locale,
  labels,
  value,
  bounds,
  seatOptions,
  onChange,
  onReset,
}: CatalogFiltersProps) {
  const segmentLabel = (s: CatalogSegment) => {
    if (s === "all") return labels.segmentAll;
    if (s === "personal") return labels.segmentPersonal;
    return labels.segmentCommercial;
  };

  const rangeLabel = (r: RangeBucket) => {
    if (r === "all") return labels.rangeAll;
    if (r === "under300") return labels.rangeUnder300;
    if (r === "mid") return labels.rangeMid;
    return labels.rangeHigh;
  };

  const span = Math.max(bounds.max - bounds.min, 1);
  const minPct = ((value.priceMin - bounds.min) / span) * 100;
  const maxPct = ((value.priceMax - bounds.min) / span) * 100;

  return (
    <aside className={styles.root} aria-labelledby="catalog-filters-title">
      <div className={styles.head}>
        <h2 id="catalog-filters-title" className={styles.title}>
          {labels.filtersTitle}
        </h2>
        <button type="button" className={styles.reset} onClick={onReset}>
          {labels.reset}
        </button>
      </div>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>{labels.segmentLabel}</legend>
        <div className={styles.pills} role="group">
          {SEGMENTS.map((s) => (
            <Pill
              key={s}
              active={value.segment === s}
              onClick={() => onChange({ ...value, segment: s })}
            >
              {segmentLabel(s)}
            </Pill>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>{labels.priceLabel}</legend>
        <div className={styles.priceReadout}>
          <span>
            {labels.priceMin}: {formatVnd(value.priceMin, locale) || "—"}
          </span>
          <span>
            {labels.priceMax}: {formatVnd(value.priceMax, locale) || "—"}
          </span>
        </div>
        <div className={styles.trackWrap}>
          <div
            className={styles.trackFill}
            style={{ left: `${minPct}%`, width: `${Math.max(maxPct - minPct, 0)}%` }}
            aria-hidden
          />
          <input
            type="range"
            className={styles.rangeInput}
            min={bounds.min}
            max={bounds.max}
            step={Math.max(Math.round(span / 100), 1)}
            value={value.priceMin}
            aria-label={labels.priceMin}
            onChange={(e) => {
              const next = Number(e.target.value);
              onChange({
                ...value,
                priceMin: Math.min(next, value.priceMax),
              });
            }}
          />
          <input
            type="range"
            className={[styles.rangeInput, styles.rangeInputMax].join(" ")}
            min={bounds.min}
            max={bounds.max}
            step={Math.max(Math.round(span / 100), 1)}
            value={value.priceMax}
            aria-label={labels.priceMax}
            onChange={(e) => {
              const next = Number(e.target.value);
              onChange({
                ...value,
                priceMax: Math.max(next, value.priceMin),
              });
            }}
          />
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>{labels.seatsLabel}</legend>
        <div className={styles.pills} role="group">
          <Pill
            active={value.seats == null}
            onClick={() => onChange({ ...value, seats: null })}
          >
            {labels.seatsAll}
          </Pill>
          {seatOptions.map((n) => (
            <Pill
              key={n}
              active={value.seats === n}
              onClick={() => onChange({ ...value, seats: n })}
            >
              {labels.seatsValue.replace("{n}", String(n))}
            </Pill>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>{labels.rangeLabel}</legend>
        <div className={styles.pills} role="group">
          {RANGES.map((r) => (
            <Pill
              key={r}
              active={value.range === r}
              onClick={() => onChange({ ...value, range: r })}
            >
              {rangeLabel(r)}
            </Pill>
          ))}
        </div>
      </fieldset>
    </aside>
  );
}

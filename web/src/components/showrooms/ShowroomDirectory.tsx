"use client";

import { type KeyboardEvent, useMemo, useState } from "react";
import { ShowroomCard } from "@/components/ui/ShowroomCard";
import type { ShowroomVM } from "@/lib/view-models/showroom";
import styles from "./ShowroomDirectory.module.css";

type Props = {
  showrooms: ShowroomVM[];
  cityLabels: Record<string, string>;
  labels: {
    filterLabel: string;
    all: string;
    empty: string;
    directions: string;
    book: string;
  };
};

type CityTab = { key: string; label: string; count: number };

export function ShowroomDirectory({
  showrooms,
  cityLabels,
  labels,
}: Props) {
  const [filter, setFilter] = useState("all");

  const cities = useMemo(() => {
    const map = new Map<string, CityTab>();
    for (const s of showrooms) {
      const key = s.cityKey || "other";
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(key, {
          key,
          label: cityLabels[key] || s.city || key,
          count: 1,
        });
      }
    }
    return [...map.values()];
  }, [showrooms, cityLabels]);

  const visibleCount =
    filter === "all"
      ? showrooms.length
      : showrooms.filter((s) => (s.cityKey || "other") === filter).length;

  const tabKeys = useMemo(
    () => ["all", ...cities.map((city) => city.key)],
    [cities],
  );

  const onTabListKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (tabKeys.length === 0) return;
    const currentIndex = tabKeys.indexOf(filter);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % tabKeys.length;
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + tabKeys.length) % tabKeys.length;
    } else if (e.key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      nextIndex = tabKeys.length - 1;
    } else {
      return;
    }

    const nextKey = tabKeys[nextIndex];
    if (nextKey === undefined) return;
    setFilter(nextKey);
    const tabs = e.currentTarget.querySelectorAll<HTMLButtonElement>(
      '[role="tab"]',
    );
    tabs[nextIndex]?.focus();
  };

  return (
    <section className={styles.section} aria-label={labels.filterLabel}>
      {showrooms.length > 0 ? (
        <div
          className={styles.tabs}
          role="tablist"
          aria-label={labels.filterLabel}
          onKeyDown={onTabListKeyDown}
        >
          <button
            type="button"
            role="tab"
            id="showroom-tab-all"
            aria-selected={filter === "all"}
            aria-controls="showroom-panel"
            tabIndex={filter === "all" ? 0 : -1}
            className={
              filter === "all" ? `${styles.tab} ${styles.tabActive}` : styles.tab
            }
            onClick={() => setFilter("all")}
          >
            {labels.all} ({showrooms.length})
          </button>
          {cities.map((city) => {
            const selected = filter === city.key;
            return (
              <button
                key={city.key}
                type="button"
                role="tab"
                id={`showroom-tab-${city.key}`}
                aria-selected={selected}
                aria-controls="showroom-panel"
                tabIndex={selected ? 0 : -1}
                className={
                  selected ? `${styles.tab} ${styles.tabActive}` : styles.tab
                }
                onClick={() => setFilter(city.key)}
              >
                {city.label} ({city.count})
              </button>
            );
          })}
        </div>
      ) : null}

      <div
        id="showroom-panel"
        role="tabpanel"
        aria-labelledby={
          filter === "all" ? "showroom-tab-all" : `showroom-tab-${filter}`
        }
        className={styles.grid}
        data-filter={filter}
      >
        {showrooms.map((showroom) => {
          const cityKey = showroom.cityKey || "other";
          const hidden = filter !== "all" && cityKey !== filter;
          return (
            <div
              key={showroom.id}
              data-city={cityKey}
              className={hidden ? styles.hidden : undefined}
              aria-hidden={hidden || undefined}
            >
              <ShowroomCard
                showroom={showroom}
                labels={{
                  directions: labels.directions,
                  book: labels.book,
                }}
              />
            </div>
          );
        })}
      </div>

      {visibleCount === 0 ? (
        <p className={styles.empty} role="status">
          {labels.empty}
        </p>
      ) : null}
    </section>
  );
}

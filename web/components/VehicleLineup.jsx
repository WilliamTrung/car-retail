"use client";

import { useMemo, useState } from "react";
import VehicleCard from "./VehicleCard";
import { pickLocale } from "@/lib/attributes";
import styles from "./VehicleLineup.module.css";

/**
 * @param {{
 *   locale: string,
 *   models: any[],
 *   sectionTitle: string,
 * }} props
 */
export default function VehicleLineup({ locale, models, sectionTitle }) {
  const [selectedSegment, setSelectedSegment] = useState("all");

  const segments = useMemo(() => {
    const map = new Map();
    models.forEach((m) => {
      const seg = m.segment;
      if (seg) map.set(seg.key, seg);
    });
    return Array.from(map.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [models]);

  const filteredModels = useMemo(() => {
    if (selectedSegment === "all") return models;
    return models.filter((m) => m.segment?.key === selectedSegment);
  }, [models, selectedSegment]);

  return (
    <section className={styles.section} id="lineup">
      <div className={styles.inner}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{locale === "vi" ? "Danh mục xe" : "Vehicle lineup"}</p>
            <h2 className={styles.title}>{sectionTitle}</h2>
          </div>

          {segments.length > 1 && (
            <div className={styles.tabs} role="tablist" aria-label="Filter by segment">
              <button
                type="button"
                role="tab"
                aria-selected={selectedSegment === "all"}
                onClick={() => setSelectedSegment("all")}
                className={`${styles.tab} ${selectedSegment === "all" ? styles.tabActive : ""}`}
              >
                {locale === "vi" ? "Tất cả" : "All"}
              </button>
              {segments.map((seg) => {
                const isActive = selectedSegment === seg.key;
                return (
                  <button
                    key={seg.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setSelectedSegment(seg.key)}
                    className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
                  >
                    {pickLocale(seg.name, locale)}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {filteredModels.length > 0 ? (
          <div className={styles.trackWrap}>
            <div className={styles.track} key={selectedSegment}>
              {filteredModels.map((model) => (
                <VehicleCard
                  key={model.id}
                  locale={locale}
                  model={model}
                />
              ))}
            </div>
          </div>
        ) : (
          <p className={styles.noVehicles}>
            {locale === "vi" ? "Không có sản phẩm nào thuộc danh mục này." : "No models in this category."}
          </p>
        )}
      </div>
    </section>
  );
}

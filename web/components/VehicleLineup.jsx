"use client";

import { useMemo, useState } from "react";
import VehicleCard from "./VehicleCard";
import { pickLocale } from "@/lib/attributes";
import sectionStyles from "./PageSection.module.css";
import styles from "./VehicleLineup.module.css";

/**
 * @param {{
 *   locale: string,
 *   models: any[],
 *   sectionTitle: string,
 *   priceLabel: string,
 * }} props
 */
export default function VehicleLineup({ locale, models, sectionTitle, priceLabel }) {
  const [selectedLineId, setSelectedLineId] = useState("all");

  // Extract unique lines dynamically from the list of published models
  const uniqueLines = useMemo(() => {
    const linesMap = new Map();
    models.forEach((m) => {
      const line = m.segment?.line;
      if (line) {
        linesMap.set(line.id, line);
      }
    });
    return Array.from(linesMap.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [models]);

  // Filter models based on selection
  const filteredModels = useMemo(() => {
    if (selectedLineId === "all") return models;
    return models.filter((m) => m.segment?.line?.id === selectedLineId);
  }, [models, selectedLineId]);

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2 className={styles.title}>{sectionTitle}</h2>
          
          {/* Horizontal Lineup Tabs (Only show if we have multiple vehicle lines) */}
          {uniqueLines.length > 1 && (
            <div className={styles.tabs} role="tablist" aria-label="Filter vehicles">
              <button
                type="button"
                role="tab"
                aria-selected={selectedLineId === "all"}
                onClick={() => setSelectedLineId("all")}
                className={`${styles.tab} ${selectedLineId === "all" ? styles.tabActive : ""}`}
              >
                {locale === "vi" ? "Tất cả dòng xe" : "All Models"}
              </button>
              
              {uniqueLines.map((line) => {
                const lineName = pickLocale(line.name, locale);
                const isActive = selectedLineId === line.id;
                return (
                  <button
                    key={line.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setSelectedLineId(line.id)}
                    className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
                  >
                    {lineName}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Dynamic vehicle grid */}
        {filteredModels.length > 0 ? (
          <div className={`${sectionStyles.grid} ${sectionStyles.gridCols4} ${styles.gridAnimation}`}>
            {filteredModels.map((model) => (
              <VehicleCard
                key={model.id}
                locale={locale}
                model={model}
                priceLabel={priceLabel}
              />
            ))}
          </div>
        ) : (
          <p className={styles.noVehicles}>
            {locale === "vi" 
              ? "Không có sản phẩm nào thuộc danh mục này." 
              : "No models found in this category."}
          </p>
        )}
      </div>
    </section>
  );
}

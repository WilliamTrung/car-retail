"use client";

import { useId, useMemo, useState } from "react";
import type { Locale } from "@/lib/view-models/common";
import type { ModelCardVM } from "@/lib/view-models/model-card";
import { Button } from "@/components/ui/Button";
import { ModelCard } from "@/components/ui/ModelCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import styles from "./ModelGridSection.module.css";

export type LineupTabKey = "all" | "personal" | "service" | "van";

export type LineupModel = ModelCardVM & {
  lineupKey: Exclude<LineupTabKey, "all">;
};

type ModelGridSectionProps = {
  overline: string;
  title: string;
  locale?: Locale;
  models: LineupModel[];
  /** Index of the card that demos SmartImage error-fallback (null src). */
  demoFallbackIndex?: number;
  tabLabels: Record<LineupTabKey, string>;
  labels: {
    priceFrom: string;
    contactPrice: string;
    viewDetails: string;
    testDrive: string;
    eco: string;
    viewAll: string;
    tabsLabel: string;
  };
  viewAllHref?: string;
  /** Total published count for “View all N models” (may exceed visible grid). */
  totalCount: number;
};

const MOBILE_PREVIEW = 2;

export function ModelGridSection({
  overline,
  title,
  locale = "vi",
  models,
  demoFallbackIndex = 0,
  tabLabels,
  labels,
  viewAllHref = "/models",
  totalCount,
}: ModelGridSectionProps) {
  const titleId = useId();
  const tabsId = useId();
  const [tab, setTab] = useState<LineupTabKey>("all");

  const filtered = useMemo(() => {
    if (tab === "all") return models;
    return models.filter((m) => m.lineupKey === tab);
  }, [models, tab]);

  if (!models.length) return null;

  const tabs: LineupTabKey[] = ["all", "personal", "service", "van"];

  return (
    <section className={styles.root} aria-labelledby={titleId}>
      <div className={styles.inner}>
        <SectionTitle
          overline={overline}
          title={title}
          align="center"
          className={styles.heading}
        />
        {/* SectionTitle h2 has no id — bind aria via visually-hidden id target (not a heading). */}
        <span id={titleId} className={styles.srOnly}>
          {title}
        </span>

        <div
          className={styles.tabs}
          role="tablist"
          aria-label={labels.tabsLabel}
          id={tabsId}
        >
          {tabs.map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              id={`${tabsId}-${key}`}
              aria-selected={tab === key}
              className={styles.tab}
              data-active={tab === key ? "true" : "false"}
              onClick={() => setTab(key)}
            >
              {tabLabels[key]}
            </button>
          ))}
        </div>

        <ul
          className={styles.grid}
          role="tabpanel"
          aria-labelledby={`${tabsId}-${tab}`}
        >
          {filtered.map((model, i) => {
            const demo =
              tab === "all" &&
              demoFallbackIndex >= 0 &&
              i === demoFallbackIndex;
            const cardModel: ModelCardVM = demo
              ? { ...model, imageUrl: null }
              : model;
            return (
              <li
                key={model.id}
                className={styles.card}
                data-mobile-hide={i >= MOBILE_PREVIEW ? "true" : undefined}
              >
                <ModelCard
                  model={cardModel}
                  locale={locale}
                  labels={{
                    priceFrom: labels.priceFrom,
                    contactPrice: labels.contactPrice,
                    viewDetails: labels.viewDetails,
                    testDrive: labels.testDrive,
                    eco: labels.eco,
                  }}
                />
              </li>
            );
          })}
        </ul>

        {filtered.length === 0 ? (
          <p className={styles.empty} role="status">
            —
          </p>
        ) : null}

        <div className={styles.viewAllWrap}>
          <Button
            variant="outline"
            size="lg"
            href={viewAllHref}
            className={styles.viewAll}
          >
            {labels.viewAll.replace("{count}", String(totalCount))}
          </Button>
        </div>
      </div>
    </section>
  );
}

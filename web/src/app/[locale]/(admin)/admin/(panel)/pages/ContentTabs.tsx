"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { FaqDto, PageDto, PolicyDto } from "./actions";
import { FaqSection } from "./FaqSection";
import { PagesSection } from "./PagesSection";
import { PoliciesSection } from "./PoliciesSection";
import styles from "../cms.module.css";

const TABS = ["pages", "policies", "faq"] as const;
type Tab = (typeof TABS)[number];

type Props = {
  pages: PageDto[];
  policies: PolicyDto[];
  faqs: FaqDto[];
  /** mediaId → publicUrl, to preview the current policy PDF when editing. */
  mediaUrls: Record<string, string>;
};

export function ContentTabs({ pages, policies, faqs, mediaUrls }: Props) {
  const t = useTranslations("admin.pages");
  const [tab, setTab] = useState<Tab>("pages");

  return (
    <div>
      <div className={styles.tabs} role="tablist" aria-label={t("title")}>
        {TABS.map((key) => (
          <button
            key={key}
            id={`content-tab-${key}`}
            type="button"
            role="tab"
            aria-selected={tab === key}
            aria-controls={`content-panel-${key}`}
            className={[styles.tab, tab === key && styles.tabActive]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setTab(key)}
          >
            {t(`tab_${key}`)}
          </button>
        ))}
      </div>
      {TABS.map((key) => (
        <div
          key={key}
          id={`content-panel-${key}`}
          role="tabpanel"
          aria-labelledby={`content-tab-${key}`}
          hidden={tab !== key}
        >
          {key === "pages" ? (
            <PagesSection pages={pages} />
          ) : key === "policies" ? (
            <PoliciesSection policies={policies} mediaUrls={mediaUrls} />
          ) : (
            <FaqSection faqs={faqs} />
          )}
        </div>
      ))}
    </div>
  );
}

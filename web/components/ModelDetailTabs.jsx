"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { pickLocale } from "@/lib/attributes";
import HtmlContent from "@/components/HtmlContent";
import ModelFeatureSections from "./ModelFeatureSections";
import styles from "./ModelDetailTabs.module.css";

/**
 * @param {{
 *   locale: string,
 *   description: string | null,
 *   featureSections: object[],
 *   attributes: object[],
 *   units: object[],
 *   faqs: object[],
 * }} props
 */
export default function ModelDetailTabs({
  locale,
  description,
  featureSections,
  attributes,
  units,
  faqs,
}) {
  const t = useTranslations("model");
  const ts = useTranslations("spec");
  const [tab, setTab] = useState("description");

  const hasDescription =
    Boolean(description) || featureSections.length > 0 || faqs.length > 0;
  const hasSpecs = attributes.length > 0;

  if (!hasDescription && !hasSpecs) return null;

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.tabBar} role="tablist">
          {hasDescription ? (
            <button
              type="button"
              role="tab"
              aria-selected={tab === "description"}
              className={`${styles.tab} ${tab === "description" ? styles.tabActive : ""}`}
              onClick={() => setTab("description")}
            >
              {t("tabDescription")}
            </button>
          ) : null}
          {hasSpecs ? (
            <button
              type="button"
              role="tab"
              aria-selected={tab === "specs"}
              className={`${styles.tab} ${tab === "specs" ? styles.tabActive : ""}`}
              onClick={() => setTab("specs")}
            >
              {t("tabSpecs")}
            </button>
          ) : null}
        </div>

        {tab === "description" && hasDescription ? (
          <div className={styles.panel} role="tabpanel">
            {description ? <HtmlContent html={description} className={styles.lead} /> : null}
            {featureSections.length ? (
              <ModelFeatureSections locale={locale} sections={featureSections} embedded />
            ) : null}
            {faqs.length ? (
              <div className={styles.faqBlock}>
                <h3 className={styles.faqTitle}>{t("faqTitle")}</h3>
                {faqs.map((faq) => (
                  <article key={faq.id} className={styles.faqItem}>
                    <h4>{pickLocale(faq.question, locale)}</h4>
                    <p>{pickLocale(faq.answer, locale)}</p>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {tab === "specs" && hasSpecs ? (
          <div className={styles.panel} role="tabpanel">
            <table className={styles.specTable}>
              <tbody>
                {attributes.map((item) => {
                  const unit = item.unit ? units.find((u) => u.key === item.unit) : null;
                  const unitLabel = unit ? pickLocale(unit.value, locale) : "";
                  const value =
                    typeof item.value === "number" && unitLabel
                      ? `${item.value} ${unitLabel}`
                      : String(item.value ?? "");

                  return (
                    <tr key={item.key}>
                      <th scope="row">{ts(item.key)}</th>
                      <td>{value}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { pickLocale } from "@/lib/attributes";
import styles from "./SpecStrip.module.css";

/**
 * @param {{ locale: string, attributes: { key: string, value: unknown, unit?: string }[], units: { key: string, value: { vi: string, en: string } }[], stripKeys?: string[] }} props
 */
export default function SpecStrip({ locale, attributes, units, stripKeys }) {
  const t = useTranslations("spec");
  const keys = stripKeys ?? attributes.map((a) => a.key).slice(0, 4);

  const items = keys
    .map((key) => attributes.find((a) => a.key === key))
    .filter(Boolean);

  if (!items.length) return null;

  return (
    <dl className={styles.strip}>
      {items.map((item) => {
        const unit = item.unit ? units.find((u) => u.key === item.unit) : null;
        const unitLabel = unit ? pickLocale(unit.value, locale) : "";
        const value =
          typeof item.value === "number" && unitLabel
            ? `${item.value} ${unitLabel}`
            : String(item.value ?? "");

        return (
          <div key={item.key} className={styles.item}>
            <dt>{t(item.key)}</dt>
            <dd>{value}</dd>
          </div>
        );
      })}
    </dl>
  );
}

"use client";

import { useState, type ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { FormField } from "@/components/ui/FormField";
import { AdminInput } from "./AdminInput";
import { AdminTextarea } from "./AdminTextarea";
import styles from "./LocalizedField.module.css";

export type LocalizedValue = { vi: string; en: string };

const LOCALES = ["vi", "en"] as const;
type FieldLocale = (typeof LOCALES)[number];

type Props = {
  id: string;
  label: string;
  required?: boolean;
  value: LocalizedValue;
  onChange: (value: LocalizedValue) => void;
  multiline?: boolean;
  error?: string | null;
};

/** VI|EN tabbed pair for `{ vi, en }` JSON fields (vi default). */
export function LocalizedField({
  id,
  label,
  required,
  value,
  onChange,
  multiline = false,
  error,
}: Props) {
  const t = useTranslations("admin.common");
  const [tab, setTab] = useState<FieldLocale>("vi");

  return (
    <FormField id={`${id}-${tab}`} label={label} required={required} error={error}>
      <div className={styles.tabs} role="tablist" aria-label={label}>
        {LOCALES.map((loc) => (
          <button
            key={loc}
            id={`${id}-tab-${loc}`}
            type="button"
            role="tab"
            aria-selected={tab === loc}
            aria-controls={`${id}-panel-${loc}`}
            className={[styles.tab, tab === loc && styles.tabActive]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setTab(loc)}
          >
            {t(loc)}
          </button>
        ))}
      </div>
      {LOCALES.map((loc) => {
        const controlProps = {
          id: `${id}-${loc}`,
          value: value[loc],
          error: tab === loc ? error : undefined,
          onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            onChange({ ...value, [loc]: e.currentTarget.value }),
        };
        return (
          <div
            key={loc}
            id={`${id}-panel-${loc}`}
            role="tabpanel"
            aria-labelledby={`${id}-tab-${loc}`}
            hidden={tab !== loc}
          >
            {multiline ? (
              <AdminTextarea {...controlProps} />
            ) : (
              <AdminInput {...controlProps} />
            )}
          </div>
        );
      })}
    </FormField>
  );
}

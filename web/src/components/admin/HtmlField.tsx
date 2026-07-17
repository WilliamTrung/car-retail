"use client";

import { useState, type ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { FormField } from "@/components/ui/FormField";
import { sanitizeAdminHtml } from "@/lib/html-content";
import { AdminTextarea } from "./AdminTextarea";
import styles from "./HtmlField.module.css";

type Props = {
  id: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  rows?: number;
};

/** Raw-HTML body editor (plain textarea, no WYSIWYG) with sanitized preview. */
export function HtmlField({
  id,
  label,
  required,
  value,
  onChange,
  error,
  rows = 10,
}: Props) {
  const t = useTranslations("admin.common");
  const [preview, setPreview] = useState(false);

  return (
    <FormField
      id={id}
      label={label}
      required={required}
      error={error}
      hint={t("htmlHint")}
    >
      <AdminTextarea
        id={id}
        value={value}
        error={error}
        rows={rows}
        spellCheck={false}
        className={styles.code}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
          onChange(e.currentTarget.value)
        }
      />
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={preview}
        onClick={() => setPreview((p) => !p)}
      >
        {preview ? t("hidePreview") : t("preview")}
      </button>
      {preview ? (
        <div
          className={styles.preview}
          // Preview only — sanitized against script/style/on*/iframe.
          dangerouslySetInnerHTML={{ __html: sanitizeAdminHtml(value) }}
        />
      ) : null}
    </FormField>
  );
}

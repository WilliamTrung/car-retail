"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AdminSelect, AdminTable, ConfirmDelete } from "@/components/admin";
import { adminHref } from "../_lib/nav";
import {
  deleteModelAction,
  setModelPublishedAction,
  type LineDto,
  type ModelDto,
  type SegmentDto,
} from "./actions";
import styles from "./models.module.css";

type Line = LineDto & { segments: SegmentDto[] };

type Props = {
  models: ModelDto[];
  lines: Line[];
  selectedLine: string;
  selectedSegment: string;
};

export function ModelsList({
  models,
  lines,
  selectedLine,
  selectedSegment,
}: Props) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const segments = selectedLine
    ? (lines.find(({ id }) => id === selectedLine)?.segments ?? [])
    : lines.flatMap((line) => line.segments);

  const run = (operation: () => Promise<{ ok: boolean; error?: { message: string } }>) => {
    setError(null);
    startTransition(async () => {
      const result = await operation();
      if (!result.ok) setError(result.error?.message ?? t("common.error"));
      else router.refresh();
    });
  };

  const setFilter = (line: string, segment: string) => {
    const query = new URLSearchParams();
    if (line) query.set("line", line);
    if (segment) query.set("segment", segment);
    router.push(
      `${adminHref(locale, "/admin/models")}${query.size ? `?${query}` : ""}`,
    );
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>{t("models.title")}</h1>
          <p className={styles.muted}>{t("models.description")}</p>
        </div>
        <div className={styles.actions}>
          <Link className={styles.secondaryLink} href={adminHref(locale, "/admin/models/lines")}>
            {t("lines.manage")}
          </Link>
          <Link className={styles.primaryLink} href={adminHref(locale, "/admin/models/new")}>
            {t("models.create")}
          </Link>
        </div>
      </header>

      {error ? <p className={styles.error} role="alert">{error}</p> : null}

      <section className={styles.section}>
        <div className={styles.filters}>
          <label>
            {t("lines.line")}
            <AdminSelect
              id="model-line-filter"
              value={selectedLine}
              onChange={(event) => setFilter(event.currentTarget.value, "")}
            >
              <option value="">{t("models.allLines")}</option>
              {lines.map((line) => (
                <option key={line.id} value={line.id}>{line.name.vi}</option>
              ))}
            </AdminSelect>
          </label>
          <label>
            {t("lines.segment")}
            <AdminSelect
              id="model-segment-filter"
              value={selectedSegment}
              onChange={(event) =>
                setFilter(selectedLine, event.currentTarget.value)
              }
            >
              <option value="">{t("models.allSegments")}</option>
              {segments.map((segment) => (
                <option key={segment.id} value={segment.id}>
                  {segment.name.vi}
                </option>
              ))}
            </AdminSelect>
          </label>
        </div>

        <AdminTable
          headers={[
            t("models.name"),
            t("models.segment"),
            t("models.status"),
            t("models.priceFrom"),
            t("models.actions"),
          ]}
        >
          {models.map((model) => {
            const prices = (model.variants ?? [])
              .filter((variant) => variant.published && variant.price !== null)
              .map((variant) => variant.price as number);
            return (
              <tr key={model.id}>
                <td>
                  <Link href={adminHref(locale, `/admin/models/${model.id}`)}>{model.name.vi}</Link>
                </td>
                <td>{model.segment?.name.vi ?? "—"}</td>
                <td>
                  <label className={styles.checkbox}>
                    <input
                      type="checkbox"
                      checked={model.published}
                      disabled={pending}
                      onChange={(event) =>
                        run(() =>
                          setModelPublishedAction(model.id, {
                            published: event.currentTarget.checked,
                          }),
                        )
                      }
                    />
                    {model.published ? t("common.published") : t("common.draft")}
                  </label>
                </td>
                <td>
                  {prices.length
                    ? new Intl.NumberFormat("vi-VN").format(Math.min(...prices))
                    : "—"}
                </td>
                <td>
                  <div className={styles.rowActions}>
                    <Link href={adminHref(locale, `/admin/models/${model.id}`)}>{t("common.edit")}</Link>
                    <ConfirmDelete
                      message={t("models.confirmDelete", { name: model.name.vi })}
                      onConfirm={() => run(() => deleteModelAction(model.id))}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </AdminTable>
      </section>
    </div>
  );
}

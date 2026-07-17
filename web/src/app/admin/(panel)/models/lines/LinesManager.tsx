"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  AdminInput,
  AdminModal,
  AdminSelect,
  AdminTable,
  ConfirmDelete,
  LocalizedField,
  type LocalizedValue,
} from "@/components/admin";
import { FormField } from "@/components/ui/FormField";
import {
  createLineAction,
  createSegmentAction,
  deleteLineAction,
  deleteSegmentAction,
  updateLineAction,
  updateSegmentAction,
  type LineDto,
  type SegmentDto,
} from "../actions";
import styles from "../models.module.css";

type Line = LineDto & { segments: SegmentDto[] };
type Draft = { key: string; name: LocalizedValue; sortOrder: number };
const EMPTY: Draft = { key: "", name: { vi: "", en: "" }, sortOrder: 0 };

export function LinesManager({ lines }: { lines: Line[] }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [lineModal, setLineModal] = useState<{ id?: string; draft: Draft } | null>(null);
  const [segmentModal, setSegmentModal] = useState<{
    id?: string;
    lineId: string;
    draft: Draft;
  } | null>(null);

  const run = (
    operation: () => Promise<{ ok: boolean; error?: { message: string } }>,
    done?: () => void,
  ) => {
    setError(null);
    startTransition(async () => {
      const result = await operation();
      if (!result.ok) setError(result.error?.message ?? t("common.error"));
      else {
        done?.();
        router.refresh();
      }
    });
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>{t("lines.title")}</h1>
          <p className={styles.muted}>{t("lines.description")}</p>
        </div>
        <div className={styles.actions}>
          <Link className={styles.secondaryLink} href="/admin/models">{t("models.back")}</Link>
          <button type="button" onClick={() => setLineModal({ draft: EMPTY })}>
            {t("lines.addLine")}
          </button>
        </div>
      </header>
      {error ? <p className={styles.error} role="alert">{error}</p> : null}

      {lines.map((line) => (
        <section className={styles.section} key={line.id}>
          <div className={styles.itemHeader}>
            <h2>{line.name.vi} <code>{line.key}</code></h2>
            <div className={styles.rowActions}>
              <button
                type="button"
                onClick={() => setLineModal({
                  id: line.id,
                  draft: { key: line.key, name: line.name, sortOrder: line.sortOrder },
                })}
              >
                {t("common.edit")}
              </button>
              <button
                type="button"
                onClick={() => setSegmentModal({ lineId: line.id, draft: EMPTY })}
              >
                {t("lines.addSegment")}
              </button>
              <ConfirmDelete
                message={t("lines.confirmLine", { name: line.name.vi })}
                onConfirm={() => run(() => deleteLineAction(line.id))}
              />
            </div>
          </div>
          <AdminTable
            headers={[
              t("lines.key"),
              t("lines.name"),
              t("lines.sortOrder"),
              t("models.actions"),
            ]}
          >
            {line.segments.map((segment) => (
              <tr key={segment.id}>
                <td><code>{segment.key}</code></td>
                <td>{segment.name.vi}</td>
                <td>{segment.sortOrder}</td>
                <td>
                  <div className={styles.rowActions}>
                    <button
                      type="button"
                      onClick={() => setSegmentModal({
                        id: segment.id,
                        lineId: segment.lineId,
                        draft: {
                          key: segment.key,
                          name: segment.name,
                          sortOrder: segment.sortOrder,
                        },
                      })}
                    >
                      {t("common.edit")}
                    </button>
                    <ConfirmDelete
                      message={t("lines.confirmSegment", { name: segment.name.vi })}
                      onConfirm={() => run(() => deleteSegmentAction(segment.id))}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </AdminTable>
        </section>
      ))}

      <AdminModal
        open={lineModal !== null}
        onClose={() => setLineModal(null)}
        title={lineModal?.id ? t("lines.editLine") : t("lines.addLine")}
      >
        {lineModal ? (
          <EntityForm
            draft={lineModal.draft}
            pending={pending}
            onChange={(draft) => setLineModal({ ...lineModal, draft })}
            onCancel={() => setLineModal(null)}
            onSave={() =>
              run(
                () => lineModal.id
                  ? updateLineAction(lineModal.id, lineModal.draft)
                  : createLineAction(lineModal.draft),
                () => setLineModal(null),
              )
            }
          />
        ) : null}
      </AdminModal>

      <AdminModal
        open={segmentModal !== null}
        onClose={() => setSegmentModal(null)}
        title={segmentModal?.id ? t("lines.editSegment") : t("lines.addSegment")}
      >
        {segmentModal ? (
          <div className={styles.stack}>
            <FormField id="segment-line" label={t("lines.line")} required>
              <AdminSelect
                id="segment-line"
                value={segmentModal.lineId}
                onChange={(event) =>
                  setSegmentModal({ ...segmentModal, lineId: event.currentTarget.value })
                }
              >
                {lines.map((line) => (
                  <option key={line.id} value={line.id}>{line.name.vi}</option>
                ))}
              </AdminSelect>
            </FormField>
            <EntityForm
              draft={segmentModal.draft}
              pending={pending}
              onChange={(draft) => setSegmentModal({ ...segmentModal, draft })}
              onCancel={() => setSegmentModal(null)}
              onSave={() =>
                run(
                  () => segmentModal.id
                    ? updateSegmentAction(segmentModal.id, {
                        ...segmentModal.draft,
                        lineId: segmentModal.lineId,
                      })
                    : createSegmentAction({
                        ...segmentModal.draft,
                        lineId: segmentModal.lineId,
                      }),
                  () => setSegmentModal(null),
                )
              }
            />
          </div>
        ) : null}
      </AdminModal>
    </div>
  );
}

function EntityForm({
  draft,
  pending,
  onChange,
  onCancel,
  onSave,
}: {
  draft: Draft;
  pending: boolean;
  onChange: (draft: Draft) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const t = useTranslations("admin");
  return (
    <form className={styles.form} onSubmit={(event) => { event.preventDefault(); onSave(); }}>
      <FormField id="entity-key" label={t("lines.key")} required>
        <AdminInput
          id="entity-key"
          required
          value={draft.key}
          onChange={(event) => onChange({ ...draft, key: event.currentTarget.value })}
        />
      </FormField>
      <LocalizedField
        id="entity-name"
        label={t("lines.name")}
        required
        value={draft.name}
        onChange={(name) => onChange({ ...draft, name })}
      />
      <FormField id="entity-order" label={t("lines.sortOrder")}>
        <AdminInput
          id="entity-order"
          type="number"
          value={draft.sortOrder}
          onChange={(event) =>
            onChange({ ...draft, sortOrder: event.currentTarget.valueAsNumber || 0 })
          }
        />
      </FormField>
      <div className={styles.actions}>
        <button type="button" onClick={onCancel}>{t("common.cancel")}</button>
        <button type="submit" disabled={pending}>{t("common.save")}</button>
      </div>
    </form>
  );
}

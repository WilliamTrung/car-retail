"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  AdminInput,
  AdminModal,
  AdminTable,
  ConfirmDelete,
  LocalizedField,
} from "@/components/admin";
import { FormField } from "@/components/ui/FormField";
import {
  createAttributeKeyAction,
  createUnitAction,
  deleteAttributeKeyAction,
  deleteUnitAction,
  updateAttributeKeyAction,
  updateUnitAction,
  type AttributeKeyDto,
  type UnitDto,
} from "./actions";
import styles from "../cms.module.css";

type UnitDraft = {
  key: string;
  value: { vi: string; en: string };
};

type AttributeDraft = {
  key: string;
  groupKey: string;
  sortOrder: number;
};

const EMPTY_UNIT: UnitDraft = { key: "", value: { vi: "", en: "" } };
const EMPTY_ATTRIBUTE: AttributeDraft = {
  key: "",
  groupKey: "",
  sortOrder: 0,
};

type Props = {
  units: UnitDto[];
  attributeKeys: AttributeKeyDto[];
};

export function UnitsManager({ units, attributeKeys }: Props) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [unitModal, setUnitModal] = useState<{
    id?: string;
    draft: UnitDraft;
  } | null>(null);
  const [attributeModal, setAttributeModal] = useState<{
    id?: string;
    draft: AttributeDraft;
  } | null>(null);

  const run = (operation: () => Promise<{ ok: boolean; error?: { message: string } }>, done?: () => void) => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await operation();
        if (!result.ok) {
          setError(result.error?.message ?? t("common.error"));
          return;
        }
        done?.();
        router.refresh();
      } catch {
        setError(t("common.error"));
      }
    });
  };

  const saveUnit = () => {
    if (!unitModal) return;
    run(
      () =>
        unitModal.id
          ? updateUnitAction(unitModal.id, unitModal.draft)
          : createUnitAction(unitModal.draft),
      () => setUnitModal(null),
    );
  };

  const saveAttribute = () => {
    if (!attributeModal) return;
    const input = {
      ...attributeModal.draft,
      groupKey: attributeModal.draft.groupKey.trim() || null,
    };
    run(
      () =>
        attributeModal.id
          ? updateAttributeKeyAction(attributeModal.id, input)
          : createAttributeKeyAction(input),
      () => setAttributeModal(null),
    );
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>{t("attributes.title")}</h1>
          <p className={styles.muted}>{t("attributes.description")}</p>
        </div>
      </header>

      {error ? <p className={styles.error} role="alert">{error}</p> : null}

      <section className={styles.section} aria-labelledby="units-heading">
        <div className={styles.sectionHeader}>
          <h2 id="units-heading">{t("units.title")}</h2>
          <button type="button" className={styles.primary} onClick={() => setUnitModal({ draft: EMPTY_UNIT })}>
            {t("units.create")}
          </button>
        </div>
        <AdminTable
          headers={[
            t("units.key"),
            t("units.valueVi"),
            t("units.valueEn"),
            t("attributes.actions"),
          ]}
        >
          {units.map((unit) => (
            <tr key={unit.id}>
              <td><code>{unit.key}</code></td>
              <td>{unit.value.vi}</td>
              <td>{unit.value.en || "—"}</td>
              <td>
                <div className={styles.rowActions}>
                  <button
                    type="button"
                    onClick={() => setUnitModal({
                      id: unit.id,
                      draft: { key: unit.key, value: unit.value },
                    })}
                  >
                    {t("common.edit")}
                  </button>
                  <ConfirmDelete
                    onConfirm={() => run(() => deleteUnitAction(unit.id))}
                    message={t("units.confirmDelete", { key: unit.key })}
                  />
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      </section>

      <section className={styles.section} aria-labelledby="attributes-heading">
        <div className={styles.sectionHeader}>
          <h2 id="attributes-heading">{t("attributes.keysTitle")}</h2>
          <button type="button" className={styles.primary} onClick={() => setAttributeModal({ draft: EMPTY_ATTRIBUTE })}>
            {t("attributes.create")}
          </button>
        </div>
        <AdminTable
          headers={[
            t("attributes.key"),
            t("attributes.groupKey"),
            t("attributes.sortOrder"),
            t("attributes.actions"),
          ]}
        >
          {attributeKeys.map((attribute) => (
            <tr key={attribute.id}>
              <td><code>{attribute.key}</code></td>
              <td>{attribute.groupKey || "—"}</td>
              <td>{attribute.sortOrder}</td>
              <td>
                <div className={styles.rowActions}>
                  <button
                    type="button"
                    onClick={() => setAttributeModal({
                      id: attribute.id,
                      draft: {
                        key: attribute.key,
                        groupKey: attribute.groupKey ?? "",
                        sortOrder: attribute.sortOrder,
                      },
                    })}
                  >
                    {t("common.edit")}
                  </button>
                  <ConfirmDelete
                    onConfirm={() => run(() => deleteAttributeKeyAction(attribute.id))}
                    message={t("attributes.confirmDelete", { key: attribute.key })}
                  />
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      </section>

      <AdminModal
        open={unitModal !== null}
        onClose={() => setUnitModal(null)}
        title={unitModal?.id ? t("units.edit") : t("units.create")}
      >
        {unitModal ? (
          <form className={styles.form} onSubmit={(event) => { event.preventDefault(); saveUnit(); }}>
            <FormField id="unit-key" label={t("units.key")} required>
              <AdminInput
                id="unit-key"
                required
                value={unitModal.draft.key}
                onChange={(event) => setUnitModal({
                  ...unitModal,
                  draft: { ...unitModal.draft, key: event.currentTarget.value },
                })}
              />
            </FormField>
            <LocalizedField
              id="unit-value"
              label={t("units.value")}
              required
              value={unitModal.draft.value}
              onChange={(value) => setUnitModal({
                ...unitModal,
                draft: { ...unitModal.draft, value },
              })}
            />
            <div className={styles.actions}>
              <button type="button" onClick={() => setUnitModal(null)}>{t("common.cancel")}</button>
              <button type="submit" className={styles.primary} disabled={pending}>{t("common.save")}</button>
            </div>
          </form>
        ) : null}
      </AdminModal>

      <AdminModal
        open={attributeModal !== null}
        onClose={() => setAttributeModal(null)}
        title={attributeModal?.id ? t("attributes.edit") : t("attributes.create")}
      >
        {attributeModal ? (
          <form className={styles.form} onSubmit={(event) => { event.preventDefault(); saveAttribute(); }}>
            <FormField id="attribute-key" label={t("attributes.key")} required>
              <AdminInput
                id="attribute-key"
                required
                value={attributeModal.draft.key}
                onChange={(event) => setAttributeModal({
                  ...attributeModal,
                  draft: { ...attributeModal.draft, key: event.currentTarget.value },
                })}
              />
            </FormField>
            <FormField id="attribute-group" label={t("attributes.groupKey")}>
              <AdminInput
                id="attribute-group"
                value={attributeModal.draft.groupKey}
                onChange={(event) => setAttributeModal({
                  ...attributeModal,
                  draft: { ...attributeModal.draft, groupKey: event.currentTarget.value },
                })}
              />
            </FormField>
            <FormField id="attribute-order" label={t("attributes.sortOrder")}>
              <AdminInput
                id="attribute-order"
                type="number"
                value={attributeModal.draft.sortOrder}
                onChange={(event) => setAttributeModal({
                  ...attributeModal,
                  draft: { ...attributeModal.draft, sortOrder: event.currentTarget.valueAsNumber || 0 },
                })}
              />
            </FormField>
            <div className={styles.actions}>
              <button type="button" onClick={() => setAttributeModal(null)}>{t("common.cancel")}</button>
              <button type="submit" className={styles.primary} disabled={pending}>{t("common.save")}</button>
            </div>
          </form>
        ) : null}
      </AdminModal>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
import type { AttributeKeyDto, UnitDto } from "../units/actions";
import {
  applyTemplateAction,
  createTemplateAction,
  deleteTemplateAction,
  saveAsTemplateAction,
  updateTemplateAction,
  type TemplateDto,
} from "./actions";
import styles from "../cms.module.css";

type ItemDraft = {
  key: string;
  unit: string;
  defaultValue: string;
  showInStrip: boolean;
  sortOrder: number;
  groupKey: string;
};

type TemplateDraft = {
  key: string;
  name: LocalizedValue;
  items: ItemDraft[];
};

type ModelOption = {
  id: string;
  name: LocalizedValue;
};

type Props = {
  templates: TemplateDto[];
  attributeKeys: AttributeKeyDto[];
  units: UnitDto[];
  models: ModelOption[];
};

const EMPTY_NAME = { vi: "", en: "" };

function toDraft(template: TemplateDto): TemplateDraft {
  return {
    key: template.key,
    name: template.name,
    items: template.items.map((item) => ({
      key: item.key,
      unit: item.unit,
      defaultValue:
        item.defaultValue === null || item.defaultValue === undefined
          ? ""
          : String(item.defaultValue),
      showInStrip: item.showInStrip ?? false,
      sortOrder: item.sortOrder ?? 0,
      groupKey: item.groupKey ?? "",
    })),
  };
}

export function TemplatesManager({
  templates,
  attributeKeys,
  units,
  models,
}: Props) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<{
    kind: "error" | "success";
    text: string;
  } | null>(null);
  const [modal, setModal] = useState<{
    id?: string;
    draft: TemplateDraft;
  } | null>(null);
  const [apply, setApply] = useState({
    modelId: models[0]?.id ?? "",
    templateId: templates[0]?.id ?? "",
    mode: "replace" as "merge" | "replace",
  });
  const [saveAs, setSaveAs] = useState({
    modelId: models[0]?.id ?? "",
    key: "",
    name: EMPTY_NAME,
  });

  const run = (
    operation: () => Promise<{ ok: boolean; error?: { message: string } }>,
    success: string,
    done?: () => void,
  ) => {
    setNotice(null);
    startTransition(async () => {
      try {
        const result = await operation();
        if (!result.ok) {
          setNotice({
            kind: "error",
            text: result.error?.message ?? t("common.error"),
          });
          return;
        }
        setNotice({ kind: "success", text: success });
        done?.();
        router.refresh();
      } catch {
        setNotice({ kind: "error", text: t("common.error") });
      }
    });
  };

  const addItem = () => {
    if (!modal || !attributeKeys[0] || !units[0]) return;
    setModal({
      ...modal,
      draft: {
        ...modal.draft,
        items: [
          ...modal.draft.items,
          {
            key: attributeKeys[0].key,
            unit: units[0].key,
            defaultValue: "",
            showInStrip: false,
            sortOrder: modal.draft.items.length,
            groupKey: "",
          },
        ],
      },
    });
  };

  const updateItem = (index: number, patch: Partial<ItemDraft>) => {
    if (!modal) return;
    setModal({
      ...modal,
      draft: {
        ...modal.draft,
        items: modal.draft.items.map((item, itemIndex) =>
          itemIndex === index ? { ...item, ...patch } : item,
        ),
      },
    });
  };

  const saveTemplate = () => {
    if (!modal) return;
    const input = {
      key: modal.draft.key,
      name: modal.draft.name,
      items: modal.draft.items.map((item) => ({
        ...item,
        groupKey: item.groupKey.trim() || null,
      })),
    };
    run(
      () =>
        modal.id
          ? updateTemplateAction(modal.id, input)
          : createTemplateAction(input),
      t("templates.saved"),
      () => setModal(null),
    );
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>{t("templates.title")}</h1>
          <p className={styles.muted}>{t("templates.description")}</p>
        </div>
        <button
          type="button"
          className={styles.primary}
          onClick={() =>
            setModal({ draft: { key: "", name: EMPTY_NAME, items: [] } })
          }
        >
          {t("templates.create")}
        </button>
      </header>

      {notice ? (
        <p
          className={notice.kind === "error" ? styles.error : styles.success}
          role={notice.kind === "error" ? "alert" : "status"}
        >
          {notice.text}
        </p>
      ) : null}

      <section className={styles.section} aria-labelledby="templates-heading">
        <div className={styles.sectionHeader}>
          <h2 id="templates-heading">{t("templates.list")}</h2>
        </div>
        <AdminTable
          headers={[
            t("templates.key"),
            t("templates.name"),
            t("templates.items"),
            t("attributes.actions"),
          ]}
        >
          {templates.map((template) => (
            <tr key={template.id}>
              <td><code>{template.key}</code></td>
              <td>{template.name.vi}</td>
              <td>{template.items.length}</td>
              <td>
                <div className={styles.rowActions}>
                  <button
                    type="button"
                    onClick={() =>
                      setModal({ id: template.id, draft: toDraft(template) })
                    }
                  >
                    {t("common.edit")}
                  </button>
                  <ConfirmDelete
                    onConfirm={() =>
                      run(
                        () => deleteTemplateAction(template.id),
                        t("templates.deleted"),
                      )
                    }
                    message={t("templates.confirmDelete", {
                      key: template.key,
                    })}
                  />
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      </section>

      <section className={styles.section} aria-labelledby="apply-heading">
        <div className={styles.sectionHeader}>
          <h2 id="apply-heading">{t("templates.applyTitle")}</h2>
          <p className={styles.muted}>{t("templates.applyDescription")}</p>
        </div>
        <form
          className={styles.grid}
          onSubmit={(event) => {
            event.preventDefault();
            run(
              () => applyTemplateAction(apply),
              t("templates.applied"),
            );
          }}
        >
          <FormField id="apply-model" label={t("templates.model")} required>
            <AdminSelect
              id="apply-model"
              required
              value={apply.modelId}
              onChange={(event) =>
                setApply({ ...apply, modelId: event.currentTarget.value })
              }
            >
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name.vi}
                </option>
              ))}
            </AdminSelect>
          </FormField>
          <FormField id="apply-template" label={t("templates.template")} required>
            <AdminSelect
              id="apply-template"
              required
              value={apply.templateId}
              onChange={(event) =>
                setApply({ ...apply, templateId: event.currentTarget.value })
              }
            >
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name.vi}
                </option>
              ))}
            </AdminSelect>
          </FormField>
          <FormField id="apply-mode" label={t("templates.mode")} required>
            <AdminSelect
              id="apply-mode"
              value={apply.mode}
              onChange={(event) =>
                setApply({
                  ...apply,
                  mode: event.currentTarget.value as "merge" | "replace",
                })
              }
            >
              <option value="merge">{t("templates.merge")}</option>
              <option value="replace">{t("templates.replace")}</option>
            </AdminSelect>
          </FormField>
          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.primary}
              disabled={pending || !apply.modelId || !apply.templateId}
            >
              {t("templates.apply")}
            </button>
          </div>
        </form>
      </section>

      <section className={styles.section} aria-labelledby="save-as-heading">
        <div className={styles.sectionHeader}>
          <h2 id="save-as-heading">{t("templates.saveAsTitle")}</h2>
          <p className={styles.muted}>{t("templates.saveAsDescription")}</p>
        </div>
        <form
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault();
            run(
              () => saveAsTemplateAction(saveAs),
              t("templates.saved"),
              () =>
                setSaveAs({
                  modelId: saveAs.modelId,
                  key: "",
                  name: EMPTY_NAME,
                }),
            );
          }}
        >
          <div className={styles.grid}>
            <FormField id="save-model" label={t("templates.model")} required>
              <AdminSelect
                id="save-model"
                required
                value={saveAs.modelId}
                onChange={(event) =>
                  setSaveAs({ ...saveAs, modelId: event.currentTarget.value })
                }
              >
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name.vi}
                  </option>
                ))}
              </AdminSelect>
            </FormField>
            <FormField id="save-key" label={t("templates.key")} required>
              <AdminInput
                id="save-key"
                required
                value={saveAs.key}
                onChange={(event) =>
                  setSaveAs({ ...saveAs, key: event.currentTarget.value })
                }
              />
            </FormField>
          </div>
          <LocalizedField
            id="save-name"
            label={t("templates.name")}
            required
            value={saveAs.name}
            onChange={(name) => setSaveAs({ ...saveAs, name })}
          />
          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.primary}
              disabled={pending || !saveAs.modelId}
            >
              {t("templates.saveAs")}
            </button>
          </div>
        </form>
      </section>

      <AdminModal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal?.id ? t("templates.edit") : t("templates.create")}
      >
        {modal ? (
          <form
            className={styles.form}
            onSubmit={(event) => {
              event.preventDefault();
              saveTemplate();
            }}
          >
            <FormField id="template-key" label={t("templates.key")} required>
              <AdminInput
                id="template-key"
                required
                value={modal.draft.key}
                onChange={(event) =>
                  setModal({
                    ...modal,
                    draft: {
                      ...modal.draft,
                      key: event.currentTarget.value,
                    },
                  })
                }
              />
            </FormField>
            <LocalizedField
              id="template-name"
              label={t("templates.name")}
              required
              value={modal.draft.name}
              onChange={(name) =>
                setModal({
                  ...modal,
                  draft: { ...modal.draft, name },
                })
              }
            />
            <div className={styles.itemHeader}>
              <h3>{t("templates.items")}</h3>
              <button
                type="button"
                onClick={addItem}
                disabled={!attributeKeys.length || !units.length}
              >
                {t("templates.addItem")}
              </button>
            </div>
            <div className={styles.items}>
              {modal.draft.items.map((item, index) => (
                <div className={styles.item} key={`${index}-${item.key}`}>
                  <div className={styles.itemHeader}>
                    <strong>{t("templates.item", { number: index + 1 })}</strong>
                    <button
                      type="button"
                      className={styles.danger}
                      onClick={() =>
                        setModal({
                          ...modal,
                          draft: {
                            ...modal.draft,
                            items: modal.draft.items.filter(
                              (_, itemIndex) => itemIndex !== index,
                            ),
                          },
                        })
                      }
                    >
                      {t("templates.removeItem")}
                    </button>
                  </div>
                  <div className={styles.grid}>
                    <FormField
                      id={`item-key-${index}`}
                      label={t("attributes.key")}
                      required
                    >
                      <AdminSelect
                        id={`item-key-${index}`}
                        value={item.key}
                        onChange={(event) =>
                          updateItem(index, {
                            key: event.currentTarget.value,
                          })
                        }
                      >
                        {attributeKeys.map((attribute) => (
                          <option key={attribute.id} value={attribute.key}>
                            {attribute.key}
                          </option>
                        ))}
                      </AdminSelect>
                    </FormField>
                    <FormField
                      id={`item-unit-${index}`}
                      label={t("templates.unit")}
                      required
                    >
                      <AdminSelect
                        id={`item-unit-${index}`}
                        value={item.unit}
                        onChange={(event) =>
                          updateItem(index, {
                            unit: event.currentTarget.value,
                          })
                        }
                      >
                        {units.map((unit) => (
                          <option key={unit.id} value={unit.key}>
                            {unit.key} — {unit.value.vi}
                          </option>
                        ))}
                      </AdminSelect>
                    </FormField>
                    <FormField
                      id={`item-default-${index}`}
                      label={t("templates.defaultValue")}
                    >
                      <AdminInput
                        id={`item-default-${index}`}
                        value={item.defaultValue}
                        onChange={(event) =>
                          updateItem(index, {
                            defaultValue: event.currentTarget.value,
                          })
                        }
                      />
                    </FormField>
                    <FormField
                      id={`item-group-${index}`}
                      label={t("attributes.groupKey")}
                    >
                      <AdminInput
                        id={`item-group-${index}`}
                        value={item.groupKey}
                        onChange={(event) =>
                          updateItem(index, {
                            groupKey: event.currentTarget.value,
                          })
                        }
                      />
                    </FormField>
                    <FormField
                      id={`item-order-${index}`}
                      label={t("attributes.sortOrder")}
                    >
                      <AdminInput
                        id={`item-order-${index}`}
                        type="number"
                        value={item.sortOrder}
                        onChange={(event) =>
                          updateItem(index, {
                            sortOrder: event.currentTarget.valueAsNumber || 0,
                          })
                        }
                      />
                    </FormField>
                    <label className={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={item.showInStrip}
                        onChange={(event) =>
                          updateItem(index, {
                            showInStrip: event.currentTarget.checked,
                          })
                        }
                      />
                      {t("templates.showInStrip")}
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.actions}>
              <button type="button" onClick={() => setModal(null)}>
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                className={styles.primary}
                disabled={pending}
              >
                {t("common.save")}
              </button>
            </div>
          </form>
        ) : null}
      </AdminModal>
    </div>
  );
}

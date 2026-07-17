"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
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
import type {
  ShowroomCreateInput,
  ShowroomDto,
} from "@/server/modules/showrooms";
import {
  createShowroomAction,
  deleteShowroomAction,
  updateShowroomAction,
} from "./actions";
import styles from "./showrooms.module.css";

type Draft = {
  name: LocalizedValue;
  address: LocalizedValue;
  city: string;
  phone: string;
  hours: LocalizedValue;
  typeTag: string;
  lat: string;
  lng: string;
  sortOrder: string;
  published: boolean;
};

const EMPTY_DRAFT: Draft = {
  name: { vi: "", en: "" },
  address: { vi: "", en: "" },
  city: "",
  phone: "",
  hours: { vi: "", en: "" },
  typeTag: "",
  lat: "",
  lng: "",
  sortOrder: "0",
  published: true,
};

function toDraft(showroom: ShowroomDto): Draft {
  return {
    name: showroom.name,
    address: showroom.address,
    city: showroom.city,
    phone: showroom.phone ?? "",
    hours: showroom.hours ?? { vi: "", en: "" },
    typeTag: showroom.typeTag ?? "",
    lat: showroom.lat?.toString() ?? "",
    lng: showroom.lng?.toString() ?? "",
    sortOrder: showroom.sortOrder.toString(),
    published: showroom.published,
  };
}

function toInput(draft: Draft): ShowroomCreateInput {
  const hours =
    draft.hours.vi || draft.hours.en
      ? { vi: draft.hours.vi.trim(), en: draft.hours.en.trim() }
      : null;

  return {
    name: { vi: draft.name.vi.trim(), en: draft.name.en.trim() },
    address: { vi: draft.address.vi.trim(), en: draft.address.en.trim() },
    city: draft.city.trim(),
    phone: draft.phone.trim() || null,
    hours,
    typeTag: draft.typeTag || null,
    lat: draft.lat === "" ? null : Number(draft.lat),
    lng: draft.lng === "" ? null : Number(draft.lng),
    sortOrder: Number(draft.sortOrder || 0),
    published: draft.published,
  };
}

export function ShowroomsManager({
  showrooms,
}: {
  showrooms: ShowroomDto[];
}) {
  const t = useTranslations("admin.showrooms");
  const common = useTranslations("admin.common");
  const router = useRouter();
  const [editing, setEditing] = useState<ShowroomDto | null | undefined>();
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const modalOpen = editing !== undefined;

  function openCreate() {
    setDraft(EMPTY_DRAFT);
    setEditing(null);
    setError(undefined);
  }

  function openEdit(showroom: ShowroomDto) {
    setDraft(toDraft(showroom));
    setEditing(showroom);
    setError(undefined);
  }

  function closeModal() {
    if (!pending) setEditing(undefined);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    startTransition(async () => {
      const input = toInput(draft);
      const result = editing
        ? await updateShowroomAction(editing.id, input)
        : await createShowroomAction(input);
      if (!result.ok) {
        setError(result.error.message);
        return;
      }
      setEditing(undefined);
      router.refresh();
    });
  }

  function mutate(
    action: () => ReturnType<typeof updateShowroomAction>,
  ): Promise<void> {
    return new Promise((resolve) => {
      setError(undefined);
      startTransition(async () => {
        const result = await action();
        if (!result.ok) setError(result.error.message);
        else router.refresh();
        resolve();
      });
    });
  }

  function remove(id: string): Promise<void> {
    return new Promise((resolve) => {
      setError(undefined);
      startTransition(async () => {
        const result = await deleteShowroomAction(id);
        if (!result.ok) setError(result.error.message);
        else router.refresh();
        resolve();
      });
    });
  }

  return (
    <section className={styles.page}>
      <div className={styles.heading}>
        <div>
          <h1>{t("title")}</h1>
          <p>{t("description")}</p>
        </div>
        <button type="button" className={styles.primary} onClick={openCreate}>
          {t("add")}
        </button>
      </div>

      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      <AdminTable
        headers={[
          t("name"),
          t("city"),
          t("typeTag"),
          t("phone"),
          t("sortOrder"),
          t("status"),
          t("actions"),
        ]}
      >
        {showrooms.map((showroom) => (
          <tr key={showroom.id}>
            <td>
              <strong>{showroom.name.vi}</strong>
              {showroom.name.en ? (
                <span className={styles.secondary}>{showroom.name.en}</span>
              ) : null}
            </td>
            <td>{showroom.city}</td>
            <td>{showroom.typeTag ?? "—"}</td>
            <td>{showroom.phone ?? "—"}</td>
            <td>{showroom.sortOrder}</td>
            <td>
              <button
                type="button"
                role="switch"
                aria-checked={showroom.published}
                disabled={pending}
                onClick={() =>
                  void mutate(() =>
                    updateShowroomAction(showroom.id, {
                      published: !showroom.published,
                    }),
                  )
                }
              >
                {showroom.published ? common("published") : common("draft")}
              </button>
            </td>
            <td>
              <div className={styles.rowActions}>
                <button type="button" onClick={() => openEdit(showroom)}>
                  {common("edit")}
                </button>
                <ConfirmDelete onConfirm={() => remove(showroom.id)} />
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>

      <AdminModal
        open={modalOpen}
        onClose={closeModal}
        title={editing ? t("editTitle") : t("createTitle")}
      >
        <form className={styles.form} onSubmit={submit}>
          <LocalizedField
            id="showroom-name"
            label={t("name")}
            required
            value={draft.name}
            onChange={(name) => setDraft((value) => ({ ...value, name }))}
          />
          <LocalizedField
            id="showroom-address"
            label={t("address")}
            required
            multiline
            value={draft.address}
            onChange={(address) =>
              setDraft((value) => ({ ...value, address }))
            }
          />
          <LocalizedField
            id="showroom-hours"
            label={t("hours")}
            value={draft.hours}
            onChange={(hours) => setDraft((value) => ({ ...value, hours }))}
          />
          <div className={styles.grid}>
            <FormField id="showroom-city" label={t("city")} required>
              <AdminInput
                id="showroom-city"
                required
                value={draft.city}
                onChange={(event) =>
                  setDraft((value) => ({
                    ...value,
                    city: event.currentTarget.value,
                  }))
                }
              />
            </FormField>
            <FormField id="showroom-phone" label={t("phone")}>
              <AdminInput
                id="showroom-phone"
                type="tel"
                value={draft.phone}
                onChange={(event) =>
                  setDraft((value) => ({
                    ...value,
                    phone: event.currentTarget.value,
                  }))
                }
              />
            </FormField>
            <FormField id="showroom-type" label={t("typeTag")}>
              <AdminSelect
                id="showroom-type"
                value={draft.typeTag}
                onChange={(event) =>
                  setDraft((value) => ({
                    ...value,
                    typeTag: event.currentTarget.value,
                  }))
                }
              >
                <option value="">{common("empty")}</option>
                <option value="1S">1S</option>
                <option value="2S">2S</option>
                <option value="3S">3S</option>
              </AdminSelect>
            </FormField>
            <FormField id="showroom-sort-order" label={t("sortOrder")}>
              <AdminInput
                id="showroom-sort-order"
                type="number"
                step="1"
                value={draft.sortOrder}
                onChange={(event) =>
                  setDraft((value) => ({
                    ...value,
                    sortOrder: event.currentTarget.value,
                  }))
                }
              />
            </FormField>
            <FormField id="showroom-lat" label={t("latitude")}>
              <AdminInput
                id="showroom-lat"
                type="number"
                step="any"
                value={draft.lat}
                onChange={(event) =>
                  setDraft((value) => ({
                    ...value,
                    lat: event.currentTarget.value,
                  }))
                }
              />
            </FormField>
            <FormField id="showroom-lng" label={t("longitude")}>
              <AdminInput
                id="showroom-lng"
                type="number"
                step="any"
                value={draft.lng}
                onChange={(event) =>
                  setDraft((value) => ({
                    ...value,
                    lng: event.currentTarget.value,
                  }))
                }
              />
            </FormField>
          </div>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={draft.published}
              onChange={(event) =>
                setDraft((value) => ({
                  ...value,
                  published: event.currentTarget.checked,
                }))
              }
            />
            {common("published")}
          </label>
          {error ? (
            <p className={styles.error} role="alert">
              {error}
            </p>
          ) : null}
          <div className={styles.formActions}>
            <button type="button" disabled={pending} onClick={closeModal}>
              {common("cancel")}
            </button>
            <button className={styles.primary} type="submit" disabled={pending}>
              {pending ? t("saving") : common("save")}
            </button>
          </div>
        </form>
      </AdminModal>
    </section>
  );
}

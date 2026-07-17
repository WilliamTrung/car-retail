"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  AdminInput,
  AdminModal,
  AdminSelect,
  AdminTable,
  ConfirmDelete,
  LocalizedField,
  useAdminForm,
  type LocalizedValue,
} from "@/components/admin";
import { FormField } from "@/components/ui/FormField";
import {
  createHotlineAction,
  deleteHotlineAction,
  updateHotlineAction,
  type HotlineCreateInput,
  type HotlineDto,
} from "./actions";
import styles from "./navigation.module.css";

export type ShowroomOption = { id: string; label: string };

type Props = {
  hotlines: HotlineDto[];
  showrooms: ShowroomOption[];
};

export function HotlinesSection({ hotlines, showrooms }: Props) {
  const t = useTranslations("admin.navigation");
  const tc = useTranslations("admin.common");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<HotlineDto | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const close = () => {
    setOpen(false);
    setEditing(null);
  };

  const remove = async (id: string) => {
    const res = await deleteHotlineAction(id);
    if (!res.ok) setDeleteError(res.error.message);
    else router.refresh();
  };

  const showroomLabel = (id: string | null) =>
    showrooms.find((s) => s.id === id)?.label ?? "—";

  return (
    <section className={styles.section}>
      <div className={styles.toolbar}>
        <h2 className={styles.heading}>{t("hotlinesTitle")}</h2>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          {t("hotlineAdd")}
        </button>
      </div>
      {deleteError ? <p role="alert">{deleteError}</p> : null}
      <AdminTable
        headers={[
          t("hotlineLabel"),
          t("phone"),
          t("showroom"),
          t("sortOrder"),
          t("actions"),
        ]}
      >
        {hotlines.map((h) => (
          <tr key={h.id}>
            <td>{h.label.vi}</td>
            <td>{h.phone}</td>
            <td>{showroomLabel(h.showroomId)}</td>
            <td>{h.sortOrder}</td>
            <td className={styles.rowActions}>
              <button
                type="button"
                onClick={() => {
                  setEditing(h);
                  setOpen(true);
                }}
              >
                {tc("edit")}
              </button>
              <ConfirmDelete onConfirm={() => remove(h.id)} />
            </td>
          </tr>
        ))}
      </AdminTable>
      <AdminModal
        open={open}
        onClose={close}
        title={editing ? t("hotlineEditTitle") : t("hotlineCreateTitle")}
      >
        <HotlineForm
          key={editing?.id ?? "new"}
          hotline={editing}
          showrooms={showrooms}
          onDone={close}
        />
      </AdminModal>
    </section>
  );
}

function HotlineForm({
  hotline,
  showrooms,
  onDone,
}: {
  hotline: HotlineDto | null;
  showrooms: ShowroomOption[];
  onDone: () => void;
}) {
  const t = useTranslations("admin.navigation");
  const tc = useTranslations("admin.common");
  const router = useRouter();
  const [label, setLabel] = useState<LocalizedValue>({
    vi: hotline?.label.vi ?? "",
    en: hotline?.label.en ?? "",
  });
  const [phone, setPhone] = useState(hotline?.phone ?? "");
  const [showroomId, setShowroomId] = useState(hotline?.showroomId ?? "");
  const [sortOrder, setSortOrder] = useState(String(hotline?.sortOrder ?? 0));

  const { state, submit, pending } = useAdminForm(
    (input: HotlineCreateInput) =>
      hotline
        ? updateHotlineAction(hotline.id, input)
        : createHotlineAction(input),
    {
      onSuccess: () => {
        router.refresh();
        onDone();
      },
    },
  );

  const errors = state.fieldErrors ?? {};

  return (
    <form
      className={styles.modalForm}
      onSubmit={(e) => {
        e.preventDefault();
        submit({
          label,
          phone,
          showroomId: showroomId || null,
          sortOrder: Number(sortOrder) || 0,
        });
      }}
    >
      <LocalizedField
        id="hotline-label"
        label={t("hotlineLabel")}
        required
        value={label}
        onChange={setLabel}
        error={errors.label}
      />
      <FormField
        id="hotline-phone"
        label={t("phone")}
        required
        error={errors.phone}
      >
        <AdminInput
          id="hotline-phone"
          value={phone}
          required
          error={errors.phone}
          onChange={(e) => setPhone(e.currentTarget.value)}
        />
      </FormField>
      <FormField
        id="hotline-showroom"
        label={t("showroom")}
        error={errors.showroomId}
      >
        <AdminSelect
          id="hotline-showroom"
          value={showroomId}
          error={errors.showroomId}
          onChange={(e) => setShowroomId(e.currentTarget.value)}
        >
          <option value="">{t("noShowroom")}</option>
          {showrooms.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </AdminSelect>
      </FormField>
      <FormField
        id="hotline-sortOrder"
        label={t("sortOrder")}
        error={errors.sortOrder}
      >
        <AdminInput
          id="hotline-sortOrder"
          type="number"
          value={sortOrder}
          error={errors.sortOrder}
          onChange={(e) => setSortOrder(e.currentTarget.value)}
        />
      </FormField>
      {state.status === "error" && !state.fieldErrors ? (
        <p role="alert">{state.message ?? tc("error")}</p>
      ) : null}
      <div className={styles.modalActions}>
        <button type="button" onClick={onDone}>
          {tc("cancel")}
        </button>
        <button type="submit" disabled={pending}>
          {tc("save")}
        </button>
      </div>
    </form>
  );
}

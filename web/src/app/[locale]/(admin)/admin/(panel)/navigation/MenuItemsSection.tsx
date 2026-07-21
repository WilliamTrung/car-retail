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
  createMenuItemAction,
  deleteMenuItemAction,
  updateMenuItemAction,
  type MenuItemCreateInput,
  type MenuItemDto,
} from "./actions";
import styles from "./navigation.module.css";

const PLACEMENTS = ["HEADER", "FOOTER"] as const;
type Placement = (typeof PLACEMENTS)[number];

type Props = {
  menuItems: MenuItemDto[];
};

export function MenuItemsSection({ menuItems }: Props) {
  const t = useTranslations("admin.navigation");
  const tc = useTranslations("admin.common");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItemDto | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const close = () => {
    setOpen(false);
    setEditing(null);
  };

  const remove = async (id: string) => {
    const res = await deleteMenuItemAction(id);
    if (!res.ok) setDeleteError(res.error.message);
    else router.refresh();
  };

  const placementLabel = (p: Placement) =>
    p === "HEADER" ? t("placementHeader") : t("placementFooter");

  return (
    <section className={styles.section}>
      <div className={styles.toolbar}>
        <h2 className={styles.heading}>{t("menuTitle")}</h2>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          {t("menuAdd")}
        </button>
      </div>
      {deleteError ? <p role="alert">{deleteError}</p> : null}
      <AdminTable
        headers={[
          t("menuLabel"),
          t("routeKey"),
          t("placement"),
          t("visible"),
          t("sortOrder"),
          t("actions"),
        ]}
      >
        {menuItems.map((m) => (
          <tr key={m.id}>
            <td>{m.label.vi}</td>
            <td>{m.routeKey}</td>
            <td>{placementLabel(m.placement)}</td>
            <td>{m.visible ? t("visibleYes") : t("visibleNo")}</td>
            <td>{m.sortOrder}</td>
            <td className={styles.rowActions}>
              <button
                type="button"
                onClick={() => {
                  setEditing(m);
                  setOpen(true);
                }}
              >
                {tc("edit")}
              </button>
              <ConfirmDelete onConfirm={() => remove(m.id)} />
            </td>
          </tr>
        ))}
      </AdminTable>
      <AdminModal
        open={open}
        onClose={close}
        title={editing ? t("menuEditTitle") : t("menuCreateTitle")}
      >
        <MenuItemForm
          key={editing?.id ?? "new"}
          menuItem={editing}
          onDone={close}
        />
      </AdminModal>
    </section>
  );
}

function MenuItemForm({
  menuItem,
  onDone,
}: {
  menuItem: MenuItemDto | null;
  onDone: () => void;
}) {
  const t = useTranslations("admin.navigation");
  const tc = useTranslations("admin.common");
  const router = useRouter();
  const [label, setLabel] = useState<LocalizedValue>({
    vi: menuItem?.label.vi ?? "",
    en: menuItem?.label.en ?? "",
  });
  const [routeKey, setRouteKey] = useState(menuItem?.routeKey ?? "");
  const [placement, setPlacement] = useState<Placement>(
    menuItem?.placement ?? "HEADER",
  );
  const [visible, setVisible] = useState(menuItem?.visible ?? true);
  const [sortOrder, setSortOrder] = useState(String(menuItem?.sortOrder ?? 0));

  const { state, submit, pending } = useAdminForm(
    (input: MenuItemCreateInput) =>
      menuItem
        ? updateMenuItemAction(menuItem.id, input)
        : createMenuItemAction(input),
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
          routeKey,
          placement,
          visible,
          sortOrder: Number(sortOrder) || 0,
        });
      }}
    >
      <LocalizedField
        id="menu-label"
        label={t("menuLabel")}
        required
        value={label}
        onChange={setLabel}
        error={errors.label}
      />
      <FormField
        id="menu-routeKey"
        label={t("routeKey")}
        required
        error={errors.routeKey}
      >
        <AdminInput
          id="menu-routeKey"
          value={routeKey}
          required
          error={errors.routeKey}
          onChange={(e) => setRouteKey(e.currentTarget.value)}
        />
      </FormField>
      <FormField
        id="menu-placement"
        label={t("placement")}
        error={errors.placement}
      >
        <AdminSelect
          id="menu-placement"
          value={placement}
          error={errors.placement}
          onChange={(e) => setPlacement(e.currentTarget.value as Placement)}
        >
          {PLACEMENTS.map((p) => (
            <option key={p} value={p}>
              {p === "HEADER" ? t("placementHeader") : t("placementFooter")}
            </option>
          ))}
        </AdminSelect>
      </FormField>
      <label className={styles.checkbox}>
        <input
          type="checkbox"
          checked={visible}
          onChange={(e) => setVisible(e.currentTarget.checked)}
        />
        {t("visible")}
      </label>
      <FormField
        id="menu-sortOrder"
        label={t("sortOrder")}
        error={errors.sortOrder}
      >
        <AdminInput
          id="menu-sortOrder"
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

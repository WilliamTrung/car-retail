"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { AdminModal } from "./AdminModal";
import styles from "./ConfirmDelete.module.css";

type Props = {
  onConfirm: () => void | Promise<void>;
  /** Trigger button label; defaults to admin.common.delete. */
  label?: string;
  /** Confirmation body text; defaults to admin.common.confirmDeleteMessage. */
  message?: string;
  className?: string;
};

/** Delete trigger + confirm dialog for destructive actions. */
export function ConfirmDelete({ onConfirm, label, message, className }: Props) {
  const t = useTranslations("admin.common");
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <button
        type="button"
        className={[styles.trigger, className].filter(Boolean).join(" ")}
        onClick={() => setOpen(true)}
      >
        {label ?? t("delete")}
      </button>
      <AdminModal
        open={open}
        onClose={() => setOpen(false)}
        title={t("confirmDelete")}
      >
        <p className={styles.message}>{message ?? t("confirmDeleteMessage")}</p>
        <div className={styles.actions}>
          <button type="button" onClick={() => setOpen(false)}>
            {t("cancel")}
          </button>
          <button
            type="button"
            className={styles.danger}
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await onConfirm();
                setOpen(false);
              })
            }
          >
            {t("delete")}
          </button>
        </div>
      </AdminModal>
    </>
  );
}

"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import styles from "./AdminModal.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

/**
 * Accessible dialog.
 * ponytail: native <dialog>.showModal() provides focus trap + Esc + backdrop;
 * ceiling: replace with a headless dialog lib if nested/stacked modals arrive.
 */
export function AdminModal({ open, onClose, title, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-modal="true"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        // Backdrop click — the dialog element itself is the click target.
        if (e.target === ref.current) onClose();
      }}
    >
      <div className={styles.body}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        {children}
      </div>
    </dialog>
  );
}

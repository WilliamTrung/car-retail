"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
} from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/navigation";
import { Icon } from "@/components/ui/Icon";
import type { SiteChromeVM } from "@/lib/view-models";
import styles from "./MobileNav.module.css";

type NavItem = SiteChromeVM["nav"][number];

type Props = {
  open: boolean;
  onClose: () => void;
  nav: NavItem[];
  hotline: SiteChromeVM["hotline"];
  zaloUrl: string;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function MobileNav({ open, onClose, nav, hotline, zaloUrl }: Props) {
  const t = useTranslations("chrome");
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== "Tab" || !panelRef.current) return;
      const nodes = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);
      if (nodes.length === 0) return;
      const first = nodes[0]!;
      const last = nodes[nodes.length - 1]!;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [],
  );

  if (!open) return null;

  return (
    <div className={styles.root}>
      <button
        type="button"
        className={styles.backdrop}
        aria-label={t("menuClose")}
        onClick={onClose}
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={onKeyDown}
      >
        <div className={styles.panelHead}>
          <p id={titleId} className={styles.panelTitle}>
            {t("menuTitle")}
          </p>
          <button
            ref={closeBtnRef}
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label={t("menuClose")}
          >
            <Icon name="close" size={22} />
          </button>
        </div>
        <nav className={styles.nav} aria-label={t("mainNav")}>
          <ul className={styles.list}>
            {nav.map((item) => (
              <li key={`${item.href}-${item.label}`}>
                <Link
                  href={item.href as "/"}
                  className={styles.link}
                  onClick={onClose}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.actions}>
          {zaloUrl ? (
            <a
              href={zaloUrl}
              className={styles.zalo}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
            >
              <Icon name="zalo" size={18} />
              {t("chatZalo")}
            </a>
          ) : null}
          {hotline.tel ? (
            <a href={hotline.tel} className={styles.call} onClick={onClose}>
              <Icon name="phone" size={18} />
              {hotline.display || t("call")}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

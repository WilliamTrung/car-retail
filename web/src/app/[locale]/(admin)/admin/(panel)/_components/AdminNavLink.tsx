"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./AdminNav.module.css";

type Props = {
  href: string;
  label: string;
  /** Dashboard: exact match so `/admin/settings` is not marked active. */
  exact?: boolean;
};

/** Client leaf so the server-rendered nav gets active-link styling. */
export function AdminNavLink({ href, label, exact }: Props) {
  const pathname = usePathname();
  const active = exact
    ? pathname === href || pathname === `${href}/`
    : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={[styles.link, active && styles.active].filter(Boolean).join(" ")}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Link>
  );
}

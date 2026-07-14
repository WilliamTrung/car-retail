"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { canAccess } from "@/lib/admin/roles";
import { a } from "@/lib/admin/strings";
import LogoutButton from "./LogoutButton";
import styles from "./AdminNav.module.css";

const NAV = [
  { href: "/admin", label: a.nav.dashboard, module: "dashboard" },
  { href: "/admin/settings", label: a.nav.settings, module: "settings" },
  { href: "/admin/navigation", label: a.nav.navigation, module: "navigation" },
  { href: "/admin/units", label: a.nav.units, module: "units" },
  { href: "/admin/templates", label: a.nav.templates, module: "templates" },
  { href: "/admin/models", label: a.nav.models, module: "models" },
  { href: "/admin/media", label: a.nav.media, module: "media" },
  { href: "/admin/homepage", label: a.nav.homepage, module: "homepage" },
  { href: "/admin/news", label: a.nav.news, module: "news" },
  { href: "/admin/pages", label: a.nav.pages, module: "pages" },
  { href: "/admin/showrooms", label: a.nav.showrooms, module: "showrooms" },
  { href: "/admin/leads", label: a.nav.leads, module: "leads" },
];

/** @param {{ session: { email: string, role: string, name?: string | null } }} props */
export default function AdminNav({ session }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = NAV.filter((item) => canAccess(session.role, item.module));

  const isActive = (href) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <>
      <div className={styles.mobileHeader}>
        <Link href="/admin" className={styles.mobileBrand}>
          {a.brand}
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className={styles.mobileToggle}
          aria-expanded={mobileOpen}
          aria-label={a.menuToggle}
        >
          <span className={`${styles.hamburger} ${mobileOpen ? styles.hamburgerOpen : ""}`} />
        </button>
      </div>

      <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.sidebarHeader}>
          <Link href="/admin" className={styles.brand}>
            {a.brand}
          </Link>
          <span className={styles.brandSub}>{a.brandSub}</span>
        </div>

        <nav className={styles.nav}>
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className={styles.userFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userName} title={session.name || session.email}>
              👤 {session.name || session.email}
            </div>
            <div className={styles.userRole}>{session.role}</div>
          </div>
          <div className={styles.logoutWrapper}>
            <LogoutButton />
          </div>
        </div>
      </aside>

      {mobileOpen ? <div className={styles.backdrop} onClick={() => setMobileOpen(false)} /> : null}
    </>
  );
}

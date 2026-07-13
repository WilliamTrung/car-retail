"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { canAccess } from "@/lib/admin/roles";
import LogoutButton from "./LogoutButton";
import styles from "./AdminNav.module.css";

const NAV = [
  { href: "/admin", label: "📊 Dashboard", module: "dashboard" },
  { href: "/admin/settings", label: "⚙️ Site settings", module: "settings" },
  { href: "/admin/navigation", label: "🔀 Navigation Menu", module: "navigation" },
  { href: "/admin/units", label: "📏 Units Catalog", module: "units" },
  { href: "/admin/templates", label: "📋 Spec Templates", module: "templates" },
  { href: "/admin/models", label: "🚗 Vehicles Catalog", module: "models" },
  { href: "/admin/media", label: "🖼️ Media Library", module: "media" },
  { href: "/admin/homepage", label: "🏠 Homepage CMS", module: "homepage" },
  { href: "/admin/news", label: "📰 News Posts", module: "news" },
  { href: "/admin/pages", label: "📄 Pages & FAQ", module: "pages" },
  { href: "/admin/showrooms", label: "🏪 Showrooms", module: "showrooms" },
  { href: "/admin/leads", label: "📥 Leads Inbox", module: "leads" },
];

/** @param {{ session: { email: string, role: string, name?: string | null } }} props */
export default function AdminNav({ session }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = NAV.filter((item) => canAccess(session.role, item.module));

  // Determine if a link path is active
  const isActive = (href) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Top Header */}
      <div className={styles.mobileHeader}>
        <Link href="/admin" className={styles.mobileBrand}>
          Car Retail Admin
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className={styles.mobileToggle}
          aria-expanded={mobileOpen}
          aria-label="Toggle navigation menu"
        >
          <span className={`${styles.hamburger} ${mobileOpen ? styles.hamburgerOpen : ""}`} />
        </button>
      </div>

      {/* Main Sidebar (Drawer on mobile) */}
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.sidebarHeader}>
          <Link href="/admin" className={styles.brand}>
            Car Retail Admin
          </Link>
          <span className={styles.brandSub}>Dealership CMS</span>
        </div>

        {/* Scrollable menu content */}
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

        {/* User Details & Logout footer */}
        <div className={styles.userFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userName} title={session.name || session.email}>
              👤 {session.name || session.email}
            </div>
            <div className={styles.userRole}>
              {session.role}
            </div>
          </div>
          <div className={styles.logoutWrapper}>
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div className={styles.backdrop} onClick={() => setMobileOpen(false)} />
      )}
    </>
  );
}

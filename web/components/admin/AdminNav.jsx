import Link from "next/link";
import { canAccess } from "@/lib/admin/roles";
import LogoutButton from "./LogoutButton";
import styles from "./AdminNav.module.css";

const NAV = [
  { href: "/admin", label: "Dashboard", module: "dashboard" },
  { href: "/admin/settings", label: "Site settings", module: "settings" },
  { href: "/admin/navigation", label: "Navigation", module: "navigation" },
  { href: "/admin/units", label: "Units", module: "units" },
  { href: "/admin/templates", label: "Templates", module: "templates" },
  { href: "/admin/models", label: "Vehicles", module: "models" },
  { href: "/admin/media", label: "Media", module: "media" },
  { href: "/admin/homepage", label: "Homepage", module: "homepage" },
  { href: "/admin/news", label: "News", module: "news" },
  { href: "/admin/pages", label: "Pages & FAQ", module: "pages" },
  { href: "/admin/showrooms", label: "Showrooms", module: "showrooms" },
  { href: "/admin/leads", label: "Leads", module: "leads" },
];

/** @param {{ session: { email: string, role: string, name?: string | null } }} props */
export default function AdminNav({ session }) {
  const items = NAV.filter((item) => canAccess(session.role, item.module));

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <Link href="/admin">Car Retail Admin</Link>
      </div>
      <nav className={styles.nav}>
        {items.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className={styles.user}>
        <span>{session.name || session.email}</span>
        <span className={styles.role}>{session.role}</span>
        <LogoutButton />
      </div>
    </header>
  );
}

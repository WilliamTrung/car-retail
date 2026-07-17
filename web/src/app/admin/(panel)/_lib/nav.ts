import type { AdminModule } from "@/server/auth/rbac";

export type AdminNavItem = {
  module: AdminModule;
  href: string;
  /** Key inside the `admin.nav` messages namespace. */
  labelKey: string;
};

/** Admin panel nav registry — filtered per role via `canAccess`. */
export const NAV_ITEMS: readonly AdminNavItem[] = [
  { module: "dashboard", href: "/admin", labelKey: "dashboard" },
  { module: "settings", href: "/admin/settings", labelKey: "settings" },
  { module: "navigation", href: "/admin/navigation", labelKey: "navigation" },
  { module: "units", href: "/admin/units", labelKey: "units" },
  { module: "templates", href: "/admin/templates", labelKey: "templates" },
  { module: "models", href: "/admin/models", labelKey: "models" },
  { module: "homepage", href: "/admin/homepage", labelKey: "homepage" },
  { module: "news", href: "/admin/news", labelKey: "news" },
  { module: "pages", href: "/admin/pages", labelKey: "pages" },
  { module: "showrooms", href: "/admin/showrooms", labelKey: "showrooms" },
  { module: "media", href: "/admin/media", labelKey: "media" },
  { module: "leads", href: "/admin/leads", labelKey: "leads" },
];

import { getLocale, getTranslations } from "next-intl/server";
import { canAccess, type AdminRole } from "@/server/auth/rbac";
import { adminHref, NAV_ITEMS } from "../_lib/nav";
import { AdminNavLink } from "./AdminNavLink";
import styles from "./AdminNav.module.css";

type Props = {
  role: AdminRole;
};

/** Sidebar nav — renders only the modules `role` may access. */
export async function AdminNav({ role }: Props) {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("admin.nav"),
  ]);
  const items = NAV_ITEMS.filter((item) => canAccess(role, item.module));

  return (
    <nav className={styles.nav} aria-label={t("title")}>
      <p className={styles.brand}>{t("title")}</p>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.module}>
            <AdminNavLink
              href={adminHref(locale, item.href)}
              label={t(item.labelKey)}
              exact={item.href === "/admin"}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}

"use client";

import { Link, usePathname } from "@/lib/i18n/navigation";
import { Icon } from "@/components/ui/Icon";
import type { SiteChromeVM } from "@/lib/view-models";
import styles from "./SiteHeader.module.css";

type NavItem = SiteChromeVM["nav"][number];

type Props = {
  nav: NavItem[];
  allProductsLabel: string;
};

function isProductsNav(item: NavItem): boolean {
  const href = item.href.toLowerCase();
  const label = item.label.toLowerCase();
  return (
    href.includes("model") ||
    label.includes("sản phẩm") ||
    label.includes("product") ||
    label.includes("dòng xe")
  );
}

function isActiveHref(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Client island: marks the active header nav target (e.g. /showrooms). */
export function HeaderNav({ nav, allProductsLabel }: Props) {
  const pathname = usePathname();

  return (
    <ul className={styles.navList}>
      {nav.map((item) => {
        const products = isProductsNav(item);
        const active = isActiveHref(pathname, item.href);
        return (
          <li
            key={`${item.href}-${item.label}`}
            className={products ? styles.hasDropdown : undefined}
          >
            <Link
              href={item.href as "/"}
              className={styles.navLink}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
              {products ? (
                <Icon name="chevron" size={14} className={styles.chevron} />
              ) : null}
            </Link>
            {products ? (
              <div className={styles.dropdown} role="menu">
                <Link
                  href={item.href as "/"}
                  className={styles.dropdownLink}
                  role="menuitem"
                >
                  {allProductsLabel}
                </Link>
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

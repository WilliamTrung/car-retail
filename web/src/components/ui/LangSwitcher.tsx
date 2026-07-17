"use client";

import type { ComponentProps } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, Link } from "@/lib/i18n/navigation";
import styles from "./LangSwitcher.module.css";

type Props = {
  className?: string;
};

type AppHref = ComponentProps<typeof Link>["href"];

/** VI/EN pill — preserves localized pathname via next-intl Link. */
export function LangSwitcher({ className }: Props) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("chrome");
  // Dynamic routes (e.g. /models/[slug]) are valid runtime hrefs; next-intl's
  // typed Link omits param-bearing pathnames from the union without params.
  const href = pathname as AppHref;

  return (
    <div
      className={[styles.switcher, className].filter(Boolean).join(" ")}
      role="group"
      aria-label={t("langSwitcher")}
    >
      <Link
        href={href}
        locale="vi"
        className={[styles.pill, locale === "vi" && styles.active]
          .filter(Boolean)
          .join(" ")}
        aria-current={locale === "vi" ? "true" : undefined}
        hrefLang="vi"
      >
        VI
      </Link>
      <Link
        href={href}
        locale="en"
        className={[styles.pill, locale === "en" && styles.active]
          .filter(Boolean)
          .join(" ")}
        aria-current={locale === "en" ? "true" : undefined}
        hrefLang="en"
      >
        EN
      </Link>
    </div>
  );
}

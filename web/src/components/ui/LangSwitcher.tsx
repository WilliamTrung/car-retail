"use client";

import type { ComponentProps } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, Link } from "@/lib/i18n/navigation";
import styles from "./LangSwitcher.module.css";

type Props = {
  className?: string;
};

type AppHref = ComponentProps<typeof Link>["href"];

const DYNAMIC_SLUG_ROUTES = new Set(["/models/[slug]", "/news/[slug]"]);

/** VI/EN pill — preserves localized pathname via next-intl Link. */
export function LangSwitcher({ className }: Props) {
  const locale = useLocale();
  const pathname = usePathname();
  const params = useParams();
  const t = useTranslations("chrome");
  // usePathname() returns the internal template (e.g. "/models/[slug]") on
  // dynamic routes — interpolate params via an object href so Link resolves
  // the real path instead of shipping a literal "[slug]".
  const href = (
    DYNAMIC_SLUG_ROUTES.has(pathname) && typeof params.slug === "string"
      ? { pathname, params: { slug: params.slug } }
      : pathname
  ) as AppHref;

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

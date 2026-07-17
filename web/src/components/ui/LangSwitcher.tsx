"use client";

import type { ComponentProps } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, Link } from "@/lib/i18n/navigation";
import { useSlugAlternates } from "./SlugAlternates";
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
  const alternates = useSlugAlternates();
  const t = useTranslations("chrome");
  // usePathname() returns the internal template (e.g. "/models/[slug]") on
  // dynamic routes — interpolate params via an object href so Link resolves
  // the real path instead of shipping a literal "[slug]".
  // News slugs differ per locale (models share one slug): the news detail
  // page registers each locale's slug via <SlugAlternates>. Until that
  // registration lands, link to the news index so we never render (or
  // prefetch) a mismatched slug that would 404.
  const hrefFor = (target: "vi" | "en"): AppHref => {
    if (DYNAMIC_SLUG_ROUTES.has(pathname)) {
      const slug = alternates?.[target] ?? params.slug;
      if (pathname === "/news/[slug]" && !alternates?.[target]) {
        return "/news" as AppHref;
      }
      if (typeof slug === "string") {
        return { pathname, params: { slug } } as AppHref;
      }
    }
    return pathname as AppHref;
  };

  return (
    <div
      className={[styles.switcher, className].filter(Boolean).join(" ")}
      role="group"
      aria-label={t("langSwitcher")}
    >
      <Link
        href={hrefFor("vi")}
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
        href={hrefFor("en")}
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

import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createLocalizeHref } from "@/lib/i18n/localize-href";
import { Link } from "@/lib/i18n/navigation";
import { ShowroomCtaBand } from "@/components/showrooms/ShowroomCtaBand";
import { ShowroomDirectory } from "@/components/showrooms/ShowroomDirectory";
import { getHotlines, getShowrooms, getSiteSettings } from "@/lib/queries/public";
import {
  formatHotlineDisplay,
  toShowroomVM,
  toTelHref,
  type Locale,
} from "@/lib/view-models";
import { buildPageMetadata, resolveOgImageUrl } from "@/lib/seo";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "showrooms" });
  const settings = await getSiteSettings();
  const ogImageUrl = await resolveOgImageUrl(
    locale,
    settings?.seoDefaults,
    null,
  );
  const base = buildPageMetadata(
    locale,
    "/showrooms",
    null,
    settings?.seoDefaults,
    ogImageUrl,
  );
  return {
    ...base,
    title: t("title"),
    description: t("subtitleZero"),
  };
}

export default async function ShowroomsPage({ params }: Props) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  setRequestLocale(locale);

  const t = await getTranslations("showrooms");
  const localizeHref = createLocalizeHref(locale);
  const [rows, hotlines] = await Promise.all([
    getShowrooms(),
    getHotlines(),
  ]);

  const showrooms = rows.map((row) => toShowroomVM(row, locale, localizeHref));
  const count = showrooms.length;

  const cityLabels: Record<string, string> = {};
  for (const s of showrooms) {
    const key = s.cityKey || "other";
    if (cityLabels[key]) continue;
    if (key === "hcm") cityLabels[key] = t("cityHcm");
    else if (key === "binh-duong") cityLabels[key] = t("cityBinhDuong");
    else cityLabels[key] = s.city || key;
  }

  const primaryPhone =
    [...hotlines].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))[0]
      ?.phone ??
    showrooms[0]?.hotline ??
    "";
  const hotlineDisplay = primaryPhone
    ? formatHotlineDisplay(primaryPhone)
    : "";
  const hotlineTel = primaryPhone ? toTelHref(primaryPhone) : "";

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/" className={styles.crumbLink}>
              {t("breadcrumbHome")}
            </Link>
            <span className={styles.crumbSep} aria-hidden>
              /
            </span>
            <span className={styles.crumbCurrent}>
              {t("breadcrumbCurrent")}
            </span>
          </nav>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>
            {count > 0 ? t("subtitle", { count }) : t("subtitleZero")}
          </p>
        </div>
      </header>

      <ShowroomDirectory
        showrooms={showrooms}
        cityLabels={cityLabels}
        labels={{
          filterLabel: t("filterLabel"),
          all: t("all"),
          empty: t("empty"),
          directions: t("directions"),
          book: t("bookBranch"),
        }}
      />

      <ShowroomCtaBand
        title={t("ctaTitle")}
        subtitle={t("ctaSub")}
        hotlineDisplay={hotlineDisplay}
        hotlineTel={hotlineTel}
        callLabel={t("callHotline", {
          phone: hotlineDisplay || primaryPhone,
        })}
      />
    </div>
  );
}

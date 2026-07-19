import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CatalogClient, toCatalogModel } from "@/components/catalog";
import { createLocalizeHref } from "@/lib/i18n/localize-href";
import { Link } from "@/lib/i18n/navigation";
import {
  getPublishedModels,
  getSiteSettings,
  getUnits,
} from "@/lib/queries/public";
import { buildPageMetadata, resolveOgImageUrl } from "@/lib/seo";
import {
  toModelCardVM,
  unitsToMap,
  type Locale,
} from "@/lib/view-models";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "catalog" });
  const settings = await getSiteSettings();
  const ogImageUrl = await resolveOgImageUrl(
    locale,
    settings?.seoDefaults,
    null,
  );
  const base = buildPageMetadata(
    locale,
    "/models",
    null,
    settings?.seoDefaults,
    ogImageUrl,
  );
  return {
    ...base,
    title: t("title"),
    description: t("subtitle"),
  };
}

export default async function ModelsCatalogPage({ params }: Props) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  setRequestLocale(locale);

  const t = await getTranslations("catalog");
  const tc = await getTranslations("common");
  const tPrice = await getTranslations("price");
  const tSpec = await getTranslations("spec");
  const localizeHref = createLocalizeHref(locale);

  const [models, units] = await Promise.all([
    getPublishedModels(),
    getUnits(),
  ]);

  const unitsMap = unitsToMap(units);
  const specT = (key: string) => tSpec(key);

  const catalogModels = models
    .map((m) => toModelCardVM(m, unitsMap, specT, locale, localizeHref))
    .map(toCatalogModel);

  const total = catalogModels.length;

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
          <p className={styles.subtitle}>{t("subtitle")}</p>
          <p className={styles.bandCount}>
            {t("bandCount").replace("{count}", String(total))}
          </p>
        </div>
      </header>

      <section className={styles.main} aria-labelledby="catalog-heading">
        <div className={styles.mainInner}>
          <h2 id="catalog-heading" className={styles.srOnly}>
            {t("listHeading")}
          </h2>
          <CatalogClient
            models={catalogModels}
            locale={locale}
            labels={{
              filtersTitle: t("filtersTitle"),
              reset: t("reset"),
              segmentLabel: t("segmentLabel"),
              segmentAll: t("segmentAll"),
              segmentPersonal: t("segmentPersonal"),
              segmentCommercial: t("segmentCommercial"),
              priceLabel: t("priceLabel"),
              priceMin: t("priceMin"),
              priceMax: t("priceMax"),
              seatsLabel: t("seatsLabel"),
              seatsAll: t("seatsAll"),
              seatsValue: t("seatsValue"),
              rangeLabel: t("rangeLabel"),
              rangeAll: t("rangeAll"),
              rangeUnder300: t("rangeUnder300"),
              rangeMid: t("rangeMid"),
              rangeHigh: t("rangeHigh"),
              resultCount: t("resultCount"),
              resultCountFiltered: t("resultCountFiltered"),
              sortLabel: t("sortLabel"),
              sortName: t("sortName"),
              sortPriceAsc: t("sortPriceAsc"),
              sortPriceDesc: t("sortPriceDesc"),
              empty: t("empty"),
              priceFrom: tc("priceFrom"),
              contactPrice: tPrice("contactFallback"),
              viewDetails: tc("viewDetails"),
              testDrive: tc("testDriveConsult"),
              eco: tc("ecoChip"),
            }}
          />
        </div>
      </section>
    </div>
  );
}

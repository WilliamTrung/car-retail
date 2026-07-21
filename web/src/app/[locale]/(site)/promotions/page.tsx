import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LeadFormBand, resolveHotline } from "@/components/home";
import { LeadForm } from "@/components/leads";
import {
  PromoEmptyState,
  PromoFilters,
  SpotlightPromo,
} from "@/components/promotions";
import { createLocalizeHref } from "@/lib/i18n/localize-href";
import { Link } from "@/lib/i18n/navigation";
import {
  getHeroSlides,
  getHotlines,
  getPublishedModels,
  getSiteSettings,
} from "@/lib/queries/public";
import { buildPageMetadata, resolveOgImageUrl } from "@/lib/seo";
import { resolveLocalized, type Locale } from "@/lib/view-models/common";
import {
  PROMOTIONS,
  toPromoListVM,
  type OfferType,
} from "@/lib/view-models/promotion";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "promotions" });
  const settings = await getSiteSettings();
  const ogImageUrl = await resolveOgImageUrl(
    locale,
    settings?.seoDefaults,
    null,
  );
  const base = buildPageMetadata(
    locale,
    "/promotions",
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

/**
 * Promotions LISTING — Electric Ink v3 multi-offer page.
 * Seed-backed (no backend Promotion module). Client islands: PromoFilters,
 * CountdownTimer (via PromoCountdown), LeadForm.
 */
export default async function PromotionsPage({ params }: Props) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  setRequestLocale(locale);

  const t = await getTranslations("promotions");
  const tc = await getTranslations("common");
  const th = await getTranslations("home");
  const localizeHref = createLocalizeHref(locale);

  const [heroSlides, models, hotlines] = await Promise.all([
    getHeroSlides(),
    getPublishedModels(),
    getHotlines(),
  ]);

  const offerType: Record<OfferType, string> = {
    site_wide: t("offerType.site_wide"),
    by_model: t("offerType.by_model"),
    financing: t("offerType.financing"),
    trade_in: t("offerType.trade_in"),
    special_group: t("offerType.special_group"),
  };

  const listMessages = {
    offerType,
    allModels: t("allModels"),
    conditionsLabel: t("conditionsLabel"),
    claimCta: t("claimCta"),
    detailCta: t("detailCta"),
    validUntil: t("validUntil"),
  };

  const heroImage =
    heroSlides.find((s) => s.imageMedia?.publicUrl)?.imageMedia ?? null;
  const heroAlt =
    resolveLocalized(heroImage?.altText, locale) || t("title");

  const { cards, spotlight } = toPromoListVM(
    PROMOTIONS,
    locale,
    listMessages,
    {
      url: heroImage?.publicUrl ?? null,
      alt: heroAlt,
    },
  );

  const countdownLabels = {
    days: tc("countdownDays"),
    hours: tc("countdownHours"),
    minutes: tc("countdownMinutes"),
    seconds: tc("countdownSeconds"),
    heading: tc("countdownHeading"),
  };

  const primaryPhone =
    [...hotlines].sort((a, b) => a.sortOrder - b.sortOrder)[0]?.phone ?? "";
  const hotline = resolveHotline(primaryPhone);
  const leadModels = models.map((m) => ({
    id: m.id,
    name: resolveLocalized(m.name, locale),
  }));

  const activeCount = cards.length;

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
          <p className={styles.overline}>{t("pageOverline")}</p>
          <h1 className={styles.title}>{t("title")}</h1>
          <p className={styles.subtitle}>{t("subtitle")}</p>
          <p className={styles.bandCount}>
            {t("activeCount").replace("{count}", String(activeCount))}
          </p>
        </div>
      </header>

      {cards.length === 0 ? (
        <section
          className={styles.emptySection}
          aria-labelledby="promo-empty-title"
        >
          <div className={styles.emptyInner}>
            <PromoEmptyState
              title={t("emptyTitle")}
              body={t("empty")}
              primaryCta={{
                label: t("emptyCtaModels"),
                href: localizeHref("/models"),
              }}
              secondaryCta={{
                label: t("emptyCtaHome"),
                href: localizeHref("/"),
              }}
            />
          </div>
        </section>
      ) : (
        <PromoFilters
          cards={cards}
          countdownLabels={countdownLabels}
          spotlightOfferType={spotlight?.offerType}
          spotlight={
            spotlight ? (
              <SpotlightPromo
                promo={spotlight}
                overline={t("spotlightOverline")}
                countdownLabels={countdownLabels}
              />
            ) : null
          }
          labels={{
            toolbarTitle: t("filtersTitle"),
            filterAll: t("filterAll"),
            offerType,
            sortLabel: t("sortLabel"),
            sortEndingSoon: t("sort.endingSoon"),
            applicableLabel: t("applicableLabel"),
            filterEmpty: t("filterEmpty"),
            clearFilter: t("clearFilter"),
            listHeading: t("listHeading"),
          }}
        />
      )}

      <div id="promo-lead">
        <LeadFormBand
          overline={t("leadOverline")}
          title={t("leadTitle")}
          subtitle={t("leadSubtitle")}
          hotline={hotline}
          hotlineHint={th("leadHotlineHint")}
          form={
            <LeadForm
              preset="consult"
              locale={locale}
              models={leadModels}
              hotlineDisplay={hotline.display}
              hotlineTel={hotline.tel}
              showTitle={false}
            />
          }
        />
      </div>
    </div>
  );
}

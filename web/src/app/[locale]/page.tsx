import { createLocalizeHref } from "@/lib/i18n/localize-href";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  BenefitStrip,
  CtaBand,
  DeliveryGallery,
  HeroCarousel,
  LeadFormBand,
  ModelGridSection,
  NewsTeaser,
  PromoSection,
  classifyLineupKey,
  resolveHotline,
  toDeliveryItemVM,
  toHeroSlideVM,
  toNewsTeaserVM,
  toPromoVM,
  type LineupModel,
} from "@/components/home";
import { LeadForm } from "@/components/leads/LeadForm";
import {
  getDeliveryPhotos,
  getFeaturedNews,
  getHeroSlides,
  getHotlines,
  getPublishedModels,
  getServiceBlocks,
  getShowrooms,
  getSiteSettings,
  getUnits,
} from "@/lib/queries/public";
import {
  toModelCardVM,
  unitsToMap,
  type Locale,
} from "@/lib/view-models";
import type { DeliveryItemVM } from "@/lib/view-models/home";
import { resolveLocalized } from "@/lib/view-models/common";
import styles from "./page.module.css";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const tc = await getTranslations("common");
  const tPrice = await getTranslations("price");
  const tPromo = await getTranslations("promo");
  const tSpec = await getTranslations("spec");

  const [
    settings,
    slides,
    models,
    services,
    news,
    units,
    hotlines,
    deliveryPhotos,
    showrooms,
  ] = await Promise.all([
    getSiteSettings(),
    getHeroSlides(),
    getPublishedModels(),
    getServiceBlocks(),
    getFeaturedNews(3),
    getUnits(),
    getHotlines(),
    getDeliveryPhotos(),
    getShowrooms(),
  ]);

  const unitsMap = unitsToMap(units);
  const localizeHref = createLocalizeHref(locale);
  const bookHref = localizeHref("/book-test-drive");
  const modelsHref = localizeHref("/models");
  const promotionsHref = localizeHref("/promotions");

  const specT = (key: string) => {
    try {
      return tSpec(key);
    } catch {
      return key;
    }
  };

  const heroSlides = slides.map((slide) =>
    toHeroSlideVM(
      slide,
      locale,
      {
        primaryLabel: t("heroPrimaryCta"),
        secondaryLabel: t("heroSecondaryCta"),
        primaryHref: "/book-test-drive",
        secondaryHref: modelsHref,
        imageAltFallback: t("heroImageAlt"),
      },
      localizeHref,
    ),
  );

  const emptyFallback = {
    id: "fallback",
    promoChip: t("heroPromoChip"),
    title: t("heroTitle"),
    subtitle: t("heroSubtitle"),
    primaryCta: { label: t("heroPrimaryCta"), href: bookHref },
    secondaryCta: { label: t("heroSecondaryCta"), href: modelsHref },
    imageUrl: null,
    imageAlt: t("heroImageAlt"),
  };

  if (heroSlides[0] && !heroSlides[0].promoChip) {
    heroSlides[0] = { ...heroSlides[0], promoChip: t("heroPromoChip") };
  }

  const lineupModels: LineupModel[] = models.map((m) => {
    const card = toModelCardVM(m, unitsMap, specT, locale, localizeHref);
    return { ...card, lineupKey: classifyLineupKey(m) };
  });

  // Cap grid density: prefer up to 3 per lineup tab, but keep full list for All.
  const lineupPreview = lineupModels.slice(0, 9);

  const benefits = services.slice(0, 4).map((block) => ({
    id: block.id,
    title: resolveLocalized(block.title, locale),
    text: resolveLocalized(block.description, locale),
    iconKey: block.iconKey,
  }));

  const promoBullets = [
    t("promoBullet1"),
    t("promoBullet2"),
    t("promoBullet3"),
    t("promoBullet4"),
  ].filter(Boolean);

  const promo = toPromoVM(settings?.promoCountdown, locale, {
    overline: t("promoOverline"),
    titleFallback: t("promoTitle"),
    bullets: promoBullets,
    dateRangeNote: t("promoDateRange"),
    validUntil: tPromo("validUntil"),
    ctaLabel: t("promoCta"),
    ctaHref: promotionsHref,
  });

  const newsItems = news.map((post) =>
    toNewsTeaserVM(post, locale, t("newsTag"), localizeHref),
  );

  const modelNames = models
    .map((m) => resolveLocalized(m.name, locale))
    .filter(Boolean);
  const branchNames = showrooms
    .map((s) => resolveLocalized(s.name, locale))
    .filter(Boolean);

  const deliveries: DeliveryItemVM[] = deliveryPhotos.map((photo, i) =>
    toDeliveryItemVM(
      photo,
      locale,
      { models: modelNames, branches: branchNames },
      i,
    ),
  );

  const primaryPhone =
    [...hotlines].sort((a, b) => a.sortOrder - b.sortOrder)[0]?.phone ?? "";
  const hotline = resolveHotline(primaryPhone);

  const zaloUrl =
    settings?.socialLinks?.find(
      (s) => (s.platform ?? "").toLowerCase() === "zalo",
    )?.url ?? "https://zalo.me/";

  const leadModels = models.map((m) => ({
    id: m.id,
    name: resolveLocalized(m.name, locale),
  }));

  const trustStats = [
    { value: t("heroTrustDeliveriesValue"), label: t("heroTrustDeliveriesLabel") },
    { value: t("heroTrustShowroomsValue"), label: t("heroTrustShowroomsLabel") },
    { value: t("heroTrustWarrantyValue"), label: t("heroTrustWarrantyLabel") },
  ];

  return (
    <main className={styles.main}>
      <HeroCarousel
        slides={heroSlides}
        emptyFallback={emptyFallback}
        trustStats={trustStats}
        labels={{
          carousel: t("carouselLabel"),
          previous: t("carouselPrev"),
          next: t("carouselNext"),
          goToSlide: t.raw("carouselGoTo"),
          pause: t("carouselPause"),
          play: t("carouselPlay"),
        }}
      />

      <BenefitStrip items={benefits} sectionLabel={t("benefitsLabel")} />

      <ModelGridSection
        overline={t("modelsOverline")}
        title={t("modelsTitle")}
        locale={locale}
        models={lineupPreview}
        demoFallbackIndex={1}
        totalCount={models.length}
        tabLabels={{
          all: t("segmentAll"),
          personal: t("segmentPersonal"),
          service: t("segmentService"),
          van: t("segmentVan"),
        }}
        labels={{
          priceFrom: tc("priceFrom"),
          contactPrice: tPrice("contactFallback"),
          viewDetails: tc("viewDetails"),
          testDrive: tc("testDriveConsult"),
          eco: tc("ecoChip"),
          viewAll: t.raw("viewAllModels"),
          tabsLabel: t("lineupTabsLabel"),
        }}
        viewAllHref={modelsHref}
      />

      <CtaBand
        title={t("ctaBandTitle")}
        subtitle={t("ctaBandSubtitle")}
        hotline={hotline}
        zaloUrl={zaloUrl}
        zaloLabel={t("ctaBandZalo")}
      />

      {promo ? (
        <PromoSection
          promo={promo}
          countdownLabels={{
            days: tc("countdownDays"),
            hours: tc("countdownHours"),
            minutes: tc("countdownMinutes"),
            seconds: tc("countdownSeconds"),
            heading: tc("countdownHeading"),
          }}
        />
      ) : null}

      <DeliveryGallery
        overline={t("deliveryOverline")}
        title={t("deliveryTitle")}
        items={deliveries}
      />

      <NewsTeaser
        overline={t("newsOverline")}
        title={t("newsTitle")}
        items={newsItems}
        viewDetailsLabel={t("newsViewDetails")}
        moreLabel={t("newsMore")}
        moreHref={localizeHref("/news")}
      />

      <LeadFormBand
        overline={t("leadOverline")}
        title={t("leadTitle")}
        subtitle={t("leadSubtitle")}
        hotline={hotline}
        hotlineHint={t("leadHotlineHint")}
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
    </main>
  );
}

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
  resolveHotline,
  toHeroSlideVM,
  toNewsTeaserVM,
  toPromoVM,
} from "@/components/home";
import { LeadForm } from "@/components/leads/LeadForm";
import {
  getDeliveryPhotos,
  getFeaturedNews,
  getHeroSlides,
  getHotlines,
  getPublishedModels,
  getServiceBlocks,
  getSiteSettings,
  getUnits,
} from "@/lib/queries/public";
import {
  toModelCardVM,
  unitsToMap,
  type Locale,
  type ModelCardVM,
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
  const tSpec = await getTranslations("spec");

  const [settings, slides, models, services, news, units, hotlines, deliveryPhotos] =
    await Promise.all([
      getSiteSettings(),
      getHeroSlides(),
      getPublishedModels(),
      getServiceBlocks(),
      getFeaturedNews(3),
      getUnits(),
      getHotlines(),
      getDeliveryPhotos(),
    ]);

  const unitsMap = unitsToMap(units);
  const localizeHref = createLocalizeHref(locale);
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
        secondaryHref: localizeHref("/"),
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
    primaryCta: { label: t("heroPrimaryCta"), href: localizeHref("/book-test-drive") },
    secondaryCta: { label: t("heroSecondaryCta"), href: localizeHref("/") },
    imageUrl: null,
    imageAlt: t("heroImageAlt"),
  };

  // Enrich empty-fallback promo chip onto first CMS slide when CMS has no chip field
  if (heroSlides[0] && !heroSlides[0].promoChip) {
    heroSlides[0] = { ...heroSlides[0], promoChip: t("heroPromoChip") };
  }

  const modelCards: ModelCardVM[] = models.map((m) =>
    toModelCardVM(m, unitsMap, specT, locale, localizeHref),
  );

  const personal = modelCards.filter((m) => m.segment === "personal").slice(0, 3);
  const commercial = modelCards
    .filter((m) => m.segment === "commercial")
    .slice(0, 3);

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
    ctaLabel: t("promoCta"),
    ctaHref: localizeHref("/book-test-drive"),
  });

  const newsItems = news.map((post) =>
    toNewsTeaserVM(post, locale, t("newsTag"), localizeHref),
  );

  const deliveries: DeliveryItemVM[] = deliveryPhotos.map((photo) => ({
    id: photo.id,
    imageUrl: photo.imageUrl,
    caption: resolveLocalized(photo.caption, locale),
  }));

  const primaryPhone =
    [...hotlines].sort((a, b) => a.sortOrder - b.sortOrder)[0]?.phone ?? "";
  const hotline = resolveHotline(primaryPhone);

  const zaloUrl =
    settings?.socialLinks?.find(
      (s) => (s.platform ?? "").toLowerCase() === "zalo",
    )?.url ?? "https://zalo.me/";

  const mobileSecondary = hotline.tel
    ? {
        label: t("heroCallCta", { phone: hotline.display || primaryPhone }),
        href: hotline.tel,
      }
    : null;

  const leadModels = models.map((m) => ({
    id: m.id,
    name: resolveLocalized(m.name, locale),
  }));

  return (
    <main className={styles.main}>
      <HeroCarousel
        slides={heroSlides}
        emptyFallback={emptyFallback}
        labels={{
          carousel: t("carouselLabel"),
          previous: t("carouselPrev"),
          next: t("carouselNext"),
          // raw: component interpolates {n} per dot via .replace
          goToSlide: t.raw("carouselGoTo"),
          pause: t("carouselPause"),
          play: t("carouselPlay"),
        }}
        mobileSecondary={mobileSecondary}
      />

      <BenefitStrip items={benefits} />

      <ModelGridSection
        overline={t("modelsOverline")}
        title={t("modelsTitle")}
        segments={[
          { key: "personal", title: t("segmentPersonal"), models: personal },
          {
            key: "commercial",
            title: t("segmentCommercial"),
            models: commercial,
          },
        ]}
        labels={{
          priceFrom: tc("priceFrom"),
          viewDetails: tc("viewDetails"),
          testDrive: tc("testDriveConsult"),
          eco: tc("ecoChip"),
          // raw: component interpolates {count} via .replace
          viewAll: t.raw("viewAllModels"),
        }}
        viewAllHref={localizeHref("/")}
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

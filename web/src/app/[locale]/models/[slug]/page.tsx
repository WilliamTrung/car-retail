import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  FeatureSections,
  GalleryHero,
  ModelFaqs,
  RelatedModels,
  SpecStrip,
  VariantSelector,
} from "@/components/models";
import { createLocalizeHref } from "@/lib/i18n/localize-href";
import { Link, getPathname } from "@/lib/i18n/navigation";
import { routing } from "@/lib/i18n/routing";
import {
  getHotlines,
  getModelBySlug,
  getModelWithDetails,
  getPublishedModels,
  getSiteSettings,
  getUnits,
} from "@/lib/queries/public";
import { buildPageMetadata, resolveOgImageUrl } from "@/lib/seo";
import type { Locale } from "@/lib/view-models";
import {
  toModelDetailVM,
  toTelHref,
  unitsToMap,
} from "@/lib/view-models";
import { pickLocale } from "@/lib/attributes";
import styles from "./model-detail.module.css";

export async function generateStaticParams() {
  const models = await getPublishedModels();
  return routing.locales.flatMap((locale) =>
    models.map((model) => ({
      locale,
      slug: pickLocale(model.slug, locale),
    })),
  );
}

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const model = await getModelBySlug(locale, slug);
  if (!model) return {};

  const [settings, details] = await Promise.all([
    getSiteSettings(),
    getModelWithDetails(model.id),
  ]);

  const name = pickLocale(model.name, locale);
  const ogFromMeta = await resolveOgImageUrl(
    locale,
    settings?.seoDefaults,
    model.meta,
  );
  const ogFromHero = details?.heroMedia?.publicUrl ?? null;
  const ogImageUrl = ogFromMeta || ogFromHero;

  return buildPageMetadata(
    locale,
    `/models/${slug}`,
    model.meta ?? {
      [locale]: { title: name, description: pickLocale(model.tagline, locale) },
    },
    settings?.seoDefaults,
    ogImageUrl,
  );
}

export default async function ModelPage({ params }: Props) {
  const { locale: localeParam, slug } = await params;
  setRequestLocale(localeParam);
  const locale = localeParam as Locale;

  const tModel = await getTranslations("model");
  const tCommon = await getTranslations("common");
  const tPrice = await getTranslations("price");
  const tSpec = await getTranslations("spec");
  const tChrome = await getTranslations("chrome");

  const model = await getModelBySlug(locale, slug);
  if (!model) notFound();

  const [details, unitsRows, hotlines, settings, allModels] = await Promise.all([
    getModelWithDetails(model.id),
    getUnits(),
    getHotlines(),
    getSiteSettings(),
    getPublishedModels(),
  ]);
  if (!details) notFound();

  const units = unitsToMap(unitsRows);
  const relatedSources = allModels
    .filter((m) => m.id !== model.id)
    .slice(0, 3);

  const localizeHref = createLocalizeHref(locale);

  const vm = toModelDetailVM(
    details,
    units,
    (key) => {
      try {
        return tSpec(key);
      } catch {
        return key;
      }
    },
    locale,
    relatedSources,
    localizeHref,
  );

  // Ensure selectable thumbnail strip even when CMS gallery is empty
  const galleryThumbs =
    vm.gallery.thumbs.length > 0
      ? vm.gallery.thumbs
      : [1, 2, 3, 4, 5].map(
          (n) =>
            `https://placehold.co/800x600/png?text=${encodeURIComponent(`${vm.name}-${n}`)}`,
        );
  const gallery = {
    mainUrl: vm.gallery.mainUrl ?? galleryThumbs[0] ?? null,
    thumbs: galleryThumbs.slice(0, 5),
    alt: vm.gallery.alt,
  };

  // Promo callout — STATIC badge only (no live countdown on model detail)
  const promo =
    vm.promo && vm.promo.bullets.length > 0
      ? {
          bullets: vm.promo.bullets.slice(0, 3),
          dateRange: vm.promo.dateRange,
        }
      : {
          bullets: [
            tModel("promoBullet1"),
            tModel("promoBullet2"),
            tModel("promoBullet3"),
          ],
          dateRange: tModel("promoDateRange"),
        };

  const fallbackTags = [
    [tModel("featureTurningTag1"), tModel("featureTurningTag2")],
    [tModel("featureInfotainmentTag1"), tModel("featureInfotainmentTag2")],
    [tModel("featureSafetyTag1"), tModel("featureSafetyTag2")],
  ] as const;

  const featureSectionsBase =
    vm.featureSections.length > 0
      ? vm.featureSections
      : [
          {
            title: tModel("featureTurningTitle"),
            body: tModel("featureTurningBody"),
            imageUrl: null as string | null,
            imageLeft: false,
          },
          {
            title: tModel("featureInfotainmentTitle"),
            body: tModel("featureInfotainmentBody"),
            imageUrl: null as string | null,
            imageLeft: true,
          },
          {
            title: tModel("featureSafetyTitle"),
            body: tModel("featureSafetyBody"),
            imageUrl: null as string | null,
            imageLeft: false,
          },
        ];

  const featureSections = featureSectionsBase.slice(0, 3).map((fs, i) => ({
    ...fs,
    imageUrl: fs.imageUrl ?? gallery.thumbs[i] ?? gallery.thumbs[0] ?? null,
    imageLeft: fs.imageLeft ?? i % 2 === 1,
    tags: [...(fallbackTags[i] ?? fallbackTags[0]!)],
  }));

  const primaryPhone = hotlines[0]?.phone ?? "";
  const callHref = primaryPhone ? toTelHref(primaryPhone) : null;
  const zaloFromSettings =
    settings?.socialLinks?.find(
      (l) => (l.platform ?? "").toLowerCase() === "zalo",
    )?.url ?? null;
  const zaloUrl = zaloFromSettings || "https://zalo.me/";

  const testDrivePath = getPathname({
    locale,
    href: "/book-test-drive",
  });
  const depositPath = getPathname({
    locale,
    href: "/deposit",
  });

  const segmentName = details.segment
    ? pickLocale(details.segment.name, locale)
    : "";

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/">{tModel("breadcrumbHome")}</Link>
        <span aria-hidden="true">›</span>
        <Link href="/models">{tModel("breadcrumbProducts")}</Link>
        {segmentName ? (
          <>
            <span aria-hidden="true">›</span>
            <span>{segmentName}</span>
          </>
        ) : null}
        <span aria-hidden="true">›</span>
        <span className={styles.breadcrumbCurrent}>{vm.name}</span>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroGrid}>
          <GalleryHero
            gallery={gallery}
            colorSwatches={vm.colorSwatches}
            priority
            labels={{
              gallery: tModel("galleryLabel"),
              thumbs: tModel("thumbsLabel"),
              swatches: tModel("swatchesLabel"),
            }}
          />
          <VariantSelector
            model={{ ...vm, promo }}
            locale={locale}
            paths={{
              testDrive: testDrivePath,
              deposit: depositPath,
              call: callHref,
              zalo: zaloUrl,
            }}
            labels={{
              testDrive: tModel("testDriveCta"),
              deposit: tModel("depositCta"),
              call: tModel("callCta"),
              zalo: tChrome("chatZalo"),
              contactPrice: tPrice("contactFallback"),
              priceFrom: tCommon("priceFrom"),
              variantsLabel: tModel("variantsTitle"),
              promoLabel: tModel("promoLabel"),
              eco: tCommon("ecoChip"),
              ratingAria: tModel("ratingAria"),
              ratingValue: tModel("ratingValue"),
            }}
          />
        </div>
      </section>

      <SpecStrip cells={vm.specStrip} label={tModel("tabSpecs")} />

      <FeatureSections
        sections={featureSections}
        sectionLabel={tModel("featuresTitle")}
      />

      <RelatedModels
        models={vm.related}
        title={tModel("relatedTitle")}
        locale={locale}
        labels={{
          priceFrom: tCommon("priceFrom"),
          contactPrice: tPrice("contactFallback"),
          viewDetails: tCommon("viewDetails"),
          testDrive: tCommon("testDriveConsult"),
          eco: tCommon("ecoChip"),
        }}
      />

      <ModelFaqs faqs={vm.faqs} title={tModel("faqTitle")} />
    </div>
  );
}

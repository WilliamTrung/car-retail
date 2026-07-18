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

  // T-0050: ensure selectable thumbnail strip even when CMS gallery is empty
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

  // T-0051: promo callout between price and variants (i18n fallback if CMS empty)
  const promo =
    vm.promo && vm.promo.bullets.length > 0
      ? vm.promo
      : {
          bullets: [
            tModel("promoBullet1"),
            tModel("promoBullet2"),
            tModel("promoBullet3"),
          ],
          dateRange: tModel("promoDateRange"),
        };

  // T-0052: storytelling blocks in addition to spec strip
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
  const featureSections = featureSectionsBase.map((fs, i) => ({
    ...fs,
    imageUrl: fs.imageUrl ?? gallery.thumbs[i] ?? gallery.thumbs[0] ?? null,
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
        <span>{tModel("breadcrumbProducts")}</span>
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
              placeholder: tCommon("imagePlaceholder", { name: vm.name }),
            }}
          />
          <VariantSelector
            model={{ ...vm, promo }}
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
              contactPrice: tCommon("contactPrice"),
              variantsLabel: tModel("variantsTitle"),
              promoLabel: tModel("promoLabel"),
              eco: tCommon("ecoChip"),
            }}
          />
        </div>
      </section>

      <FeatureSections
        sections={featureSections}
        placeholderCaption={tCommon("imagePlaceholder", { name: vm.name })}
      />

      <SpecStrip cells={vm.specStrip} label={tModel("tabSpecs")} />

      <RelatedModels
        models={vm.related}
        title={tModel("relatedTitle")}
        labels={{
          priceFrom: tCommon("priceFrom"),
          viewDetails: tCommon("viewDetails"),
          testDrive: tCommon("testDriveConsult"),
          eco: tCommon("ecoChip"),
        }}
      />

      <ModelFaqs faqs={vm.faqs} title={tModel("faqTitle")} />
    </div>
  );
}

import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pickLocale } from "@/lib/attributes";
import { formatCardPrice, formatPriceFrom } from "@/lib/format";
import ModelGallery from "@/components/ModelGallery";
import ModelDetailTabs from "@/components/ModelDetailTabs";
import { Link } from "@/lib/i18n/navigation";
import { routing } from "@/lib/i18n/routing";
import {
  getModelBySlug,
  getModelWithDetails,
  getPublishedModels,
  getSiteSettings,
  getHotlines,
  getUnits,
} from "@/lib/queries/public";
import { buildPageMetadata, resolveOgImageUrl } from "@/lib/seo";
import { isUsableDescription } from "@/lib/marketing-copy";
import styles from "./model-detail.module.css";

const HIGHLIGHT_KEYS = ["torque", "range", "seats", "power", "battery"];

/**
 * @param {string} key
 * @param {unknown} value
 * @param {string} locale
 */
function formatHighlightLine(key, value, locale) {
  const vi = locale === "vi";
  const labels = {
    torque: vi ? "Mô men xoắn cực đại" : "Max torque",
    range: vi ? "Quãng đường đi" : "Range",
    seats: vi ? "Số ghế" : "Seats",
    power: vi ? "Công suất" : "Power",
    battery: vi ? "Pin" : "Battery",
  };
  const suffix = {
    torque: "Nm",
    range: "km",
    seats: vi ? " ghế" : " seats",
    power: "kW",
    battery: "kWh",
  };
  const label = labels[key] || key;
  const unit = suffix[key] || "";
  if (key === "seats") return `${label}: ${value}${unit}.`;
  return `${label}: ${value}${unit}.`;
}

/** @param {object | null | undefined} media @param {string} locale @param {string} fallbackName */
function toGallerySlide(media, locale, fallbackName) {
  if (!media?.publicUrl) return null;
  return {
    id: media.id,
    url: media.publicUrl,
    alt: media.altText ? pickLocale(media.altText, locale) : fallbackName,
  };
}

/** @param {object} details @param {string} locale @param {string} name */
function buildGallerySlides(details, locale, name) {
  const slides = [];
  const seen = new Set();

  function push(media) {
    const slide = toGallerySlide(media, locale, name);
    if (!slide || seen.has(slide.url)) return;
    seen.add(slide.url);
    slides.push(slide);
  }

  const galleryMedia = details.galleryMedia ?? [];
  if (galleryMedia.length > 0) {
    for (const media of galleryMedia) {
      push(media);
    }
    return slides;
  }

  push(details.heroMedia);
  for (const section of details.featureSections ?? []) {
    push(section.imageMedia);
  }

  return slides;
}

export async function generateStaticParams() {
  const models = await getPublishedModels();
  return routing.locales.flatMap((locale) =>
    models.map((model) => ({
      locale,
      slug: pickLocale(model.slug, locale),
    }))
  );
}

/** @param {{ params: Promise<{ locale: string, slug: string }> }} props */
export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const model = await getModelBySlug(locale, slug);
  if (!model) return {};
  const [settings, details] = await Promise.all([
    getSiteSettings(),
    getModelWithDetails(model.id),
  ]);

  const name = pickLocale(model.name, locale);
  const modelMeta = /** @type {{ vi?: { title?: string, description?: string, ogImageMediaId?: string }, en?: { title?: string, description?: string, ogImageMediaId?: string } } | null | undefined} */ (
    model.meta
  );
  const ogFromMeta = await resolveOgImageUrl(locale, settings?.seoDefaults, modelMeta);
  const ogFromHero = details?.heroMedia?.publicUrl ?? null;
  const ogImageUrl = ogFromMeta || ogFromHero;

  return buildPageMetadata(
    locale,
    `/models/${slug}`,
    modelMeta ?? { [locale]: { title: name, description: pickLocale(model.tagline, locale) } },
    settings?.seoDefaults,
    ogImageUrl
  );
}

export default async function ModelPage({ params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("model");
  const model = await getModelBySlug(locale, slug);
  if (!model) notFound();

  const [details, units, hotlines] = await Promise.all([
    getModelWithDetails(model.id),
    getUnits(),
    getHotlines(),
  ]);
  if (!details) notFound();

  const name = pickLocale(details.name, locale);
  const tagline = pickLocale(details.tagline, locale);
  const description = pickLocale(details.description, locale);
  const showDescription = isUsableDescription(description, tagline);
  const attributes = Array.isArray(details.attributes) ? details.attributes : [];
  const segmentName = details.segment ? pickLocale(details.segment.name, locale) : "";
  const gallerySlides = buildGallerySlides(details, locale, name);
  const primaryPhone = hotlines[0]?.phone ?? "";
  const cleanPhone = primaryPhone.replace(/\D/g, "");

  const prices = details.variants.map((v) => v.price).filter(Boolean);
  const minPrice = prices.length
    ? prices.reduce((a, b) => (Number(a) < Number(b) ? a : b))
    : null;
  const displayPrice = minPrice ? formatCardPrice(minPrice, locale) : null;
  const stickyPrice = minPrice ? formatPriceFrom(minPrice, locale) : null;

  const highlights = HIGHLIGHT_KEYS.map((key) => attributes.find((a) => a.key === key))
    .filter(Boolean)
    .slice(0, 5)
    .map((item) => formatHighlightLine(item.key, item.value, locale));

  const variantLines = details.variants
    .filter((v) => v.price)
    .map((v) => ({
      id: v.id,
      label: pickLocale(v.name, locale),
      price: formatCardPrice(v.price, locale),
    }));

  return (
    <div className={styles.modelPageRoot}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/">{t("breadcrumbHome")}</Link>
        <span aria-hidden="true">›</span>
        <span>{t("breadcrumbProducts")}</span>
        {segmentName ? (
          <>
            <span aria-hidden="true">›</span>
            <span>{segmentName}</span>
          </>
        ) : null}
        <span aria-hidden="true">›</span>
        <span className={styles.breadcrumbCurrent}>{name}</span>
      </nav>

      <section className={styles.productSection}>
        <div className={styles.productGrid}>
          <ModelGallery slides={gallerySlides} />

          <div className={styles.productInfo}>
            <h1 className={styles.productTitle}>{name}</h1>
            {tagline ? <p className={styles.productTagline}>{tagline}</p> : null}

            {displayPrice ? (
              <p className={styles.productPrice}>{displayPrice}</p>
            ) : null}

            {(highlights.length > 0 || variantLines.length > 0) && (
              <ul className={styles.highlights}>
                {highlights.map((line) => (
                  <li key={line}>{line}</li>
                ))}
                {variantLines.map((variant) => (
                  <li key={variant.id}>
                    {variant.label}: <strong>{variant.price}</strong>
                  </li>
                ))}
              </ul>
            )}

            <div className={styles.ctaStack}>
              <Link
                href={{ pathname: "/deposit", query: { model: details.id } }}
                className={styles.ctaQuote}
              >
                {t("quoteCta")}
              </Link>
              {cleanPhone ? (
                <a href={`tel:${cleanPhone}`} className={styles.ctaCall}>
                  <span className={styles.ctaCallIcon} aria-hidden="true">📞</span>
                  {t("callCta")}
                </a>
              ) : null}
              <Link
                href={{ pathname: "/book-test-drive", query: { model: details.id } }}
                className={styles.ctaTestDrive}
              >
                {t("testDriveCta")}
              </Link>
            </div>

            {segmentName ? (
              <p className={styles.category}>
                {t("categoryLabel")}: <span>{segmentName}</span>
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <ModelDetailTabs
        locale={locale}
        description={showDescription ? description : null}
        featureSections={details.featureSections}
        attributes={attributes}
        units={units}
        faqs={details.faqs}
      />

      <div className={styles.stickyBar}>
        <div className={styles.stickyInner}>
          <div className={styles.stickyInfo}>
            <span className={styles.stickyName}>{name}</span>
            {stickyPrice ? <span className={styles.stickyPrice}>{stickyPrice}</span> : null}
          </div>
          <div className={styles.stickyActions}>
            <Link
              href={{ pathname: "/book-test-drive", query: { model: details.id } }}
              className={styles.stickyPrimary}
            >
              {t("testDriveCta")}
            </Link>
            <Link
              href={{ pathname: "/deposit", query: { model: details.id } }}
              className={styles.stickySecondary}
            >
              {t("depositCta")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

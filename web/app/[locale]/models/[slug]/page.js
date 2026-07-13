import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pickLocale } from "@/lib/attributes";
import { formatPriceFrom } from "@/lib/format";
import SpecStrip from "@/components/SpecStrip";
import PageSection from "@/components/PageSection";
import VariantCards from "@/components/VariantCards";
import ModelFeatureSections from "@/components/ModelFeatureSections";
import { Link } from "@/lib/i18n/navigation";
import { routing } from "@/lib/i18n/routing";
import {
  getModelBySlug,
  getModelWithDetails,
  getPublishedModels,
  getSiteSettings,
  getUnits,
} from "@/lib/queries/public";
import { buildPageMetadata, resolveOgImageUrl } from "@/lib/seo";
import styles from "../../page.module.css";

/** Skip footer/nav scrape noise in model descriptions. */
function isUsableDescription(description, tagline) {
  if (!description?.trim()) return false;
  if (description.trim() === tagline?.trim()) return false;
  if (/THÔNG\s+TIN\s+LIÊN\s+HỆ|HỖ TRỢ KHÁCH HÀNG|SHOWROOM NETWORK|QUICK LINKS|HOTLINES/i.test(description)) {
    return false;
  }
  return true;
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

  const [details, units] = await Promise.all([
    getModelWithDetails(model.id),
    getUnits(),
  ]);
  if (!details) notFound();

  const name = pickLocale(details.name, locale);
  const tagline = pickLocale(details.tagline, locale);
  const description = pickLocale(details.description, locale);
  const showDescription = isUsableDescription(description, tagline);
  const heroUrl = details.heroMedia?.publicUrl;
  const heroAlt = details.heroMedia?.altText
    ? pickLocale(details.heroMedia.altText, locale)
    : name;
  const attributes = Array.isArray(details.attributes) ? details.attributes : [];
  const segmentName = details.segment ? pickLocale(details.segment.name, locale) : "";

  const prices = details.variants.map((v) => v.price).filter(Boolean);
  const minPrice = prices.length
    ? prices.reduce((a, b) => (Number(a) < Number(b) ? a : b))
    : null;
  const startingPrice = minPrice ? formatPriceFrom(minPrice, locale) : null;

  return (
    <div className={styles.modelPageRoot}>
      <header className={styles.modelHeroDealer}>
        <div className={styles.modelHeroGrid}>
          <div className={styles.modelHeroCopy}>
            {segmentName ? <span className={styles.modelHeroSegment}>{segmentName}</span> : null}
            <h1>{name}</h1>
            {tagline ? <p className={styles.modelHeroTaglineDealer}>{tagline}</p> : null}
            {startingPrice ? (
              <p className={styles.modelHeroPriceDealer}>
                <span className={styles.modelHeroPriceLabel}>
                  {locale === "vi" ? "Giá từ" : "From"}
                </span>
                {startingPrice}
              </p>
            ) : null}
            <div className={styles.ctaRowDealer}>
              <Link
                href={{ pathname: "/book-test-drive", query: { model: details.id } }}
                className={styles.ctaPrimaryDealer}
              >
                {t("testDriveCta")}
              </Link>
              <Link
                href={{ pathname: "/deposit", query: { model: details.id } }}
                className={styles.ctaSecondaryDealer}
              >
                {t("depositCta")}
              </Link>
            </div>
          </div>

          <div className={styles.modelHeroStage}>
            {heroUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={heroUrl} alt={heroAlt} className={styles.modelHeroImage} />
            ) : (
              <div className={styles.modelHeroPlaceholder} aria-hidden="true" />
            )}
          </div>
        </div>
      </header>

      {showDescription || attributes.length ? (
        <section className={styles.modelIntro}>
          {showDescription ? <p className={styles.modelDescription}>{description}</p> : null}
          <SpecStrip locale={locale} attributes={attributes} units={units} />
        </section>
      ) : null}

      {details.variants.length ? (
        <PageSection
          title={t("variantsTitle")}
          variant="dealer"
          eyebrow={locale === "vi" ? "Phiên bản & giá" : "Variants & pricing"}
        >
          <VariantCards
            locale={locale}
            modelId={details.id}
            variants={details.variants}
            testDriveLabel={t("testDriveCta")}
            depositLabel={t("depositCta")}
          />
        </PageSection>
      ) : null}

      {details.featureSections.length ? (
        <section className={styles.featuresWrap}>
          <div className={styles.featuresHeading}>
            <p className={styles.featuresEyebrow}>
              {locale === "vi" ? "Điểm nổi bật" : "Highlights"}
            </p>
            <h2>{t("featuresTitle")}</h2>
          </div>
          <ModelFeatureSections locale={locale} sections={details.featureSections} />
        </section>
      ) : null}

      {details.faqs.length ? (
        <PageSection title={t("faqTitle")}>
          {details.faqs.map((faq) => (
            <article key={faq.id} className={styles.faqItem}>
              <h3>{pickLocale(faq.question, locale)}</h3>
              <p>{pickLocale(faq.answer, locale)}</p>
            </article>
          ))}
        </PageSection>
      ) : null}

      <div className={styles.stickyBar}>
        <div className={styles.stickyInner}>
          <div className={styles.stickyInfo}>
            <span className={styles.stickyName}>{name}</span>
            {startingPrice ? <span className={styles.stickyPrice}>{startingPrice}</span> : null}
          </div>
          <div className={styles.stickyActions}>
            <Link
              href={{ pathname: "/book-test-drive", query: { model: details.id } }}
              className={styles.ctaPrimary}
            >
              {t("testDriveCta")}
            </Link>
            <Link
              href={{ pathname: "/deposit", query: { model: details.id } }}
              className={styles.stickyDeposit}
            >
              {t("depositCta")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

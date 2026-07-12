import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pickLocale } from "@/lib/attributes";
import { formatPriceFrom, formatVnd } from "@/lib/format";
import SpecStrip from "@/components/SpecStrip";
import PageSection from "@/components/PageSection";
import sectionStyles from "@/components/PageSection.module.css";
import { Link } from "@/lib/i18n/navigation";
import { routing } from "@/lib/i18n/routing";
import {
  getModelBySlug,
  getModelWithDetails,
  getPublishedModels,
  getSiteSettings,
  getUnits,
} from "@/lib/queries/public";
import { buildPageMetadata, resolveMediaUrl, resolveOgImageUrl } from "@/lib/seo";
import styles from "../../page.module.css";

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
  const heroUrl = details.heroMedia?.publicUrl;
  const attributes = Array.isArray(details.attributes) ? details.attributes : [];
  const segmentName = details.segment ? pickLocale(details.segment.name, locale) : "";

  const prices = details.variants.map((v) => v.price).filter(Boolean);
  const minPrice = prices.length
    ? prices.reduce((a, b) => (Number(a) < Number(b) ? a : b))
    : null;
  const startingPrice = minPrice ? formatPriceFrom(minPrice, locale) : null;

  return (
    <>
      <header
        className={styles.modelHero}
        data-has-image={heroUrl ? "true" : "false"}
        style={heroUrl ? { backgroundImage: `url(${heroUrl})` } : undefined}
      >
        <div className={styles.modelHeroOverlay} />
        <div className={styles.modelHeroInner}>
          {segmentName ? <span className={styles.modelHeroSegment}>{segmentName}</span> : null}
          <h1>{name}</h1>
          {tagline ? <p className={styles.modelHeroTagline}>{tagline}</p> : null}
          {startingPrice ? <p className={styles.modelHeroPrice}>{startingPrice}</p> : null}
          <div className={styles.ctaRow}>
            <Link
              href={{ pathname: "/book-test-drive", query: { model: details.id } }}
              className={styles.ctaPrimary}
            >
              {t("testDriveCta")}
            </Link>
            <Link
              href={{ pathname: "/deposit", query: { model: details.id } }}
              className={styles.ctaSecondary}
            >
              {t("depositCta")}
            </Link>
          </div>
        </div>
      </header>

      {description || attributes.length ? (
        <section className={styles.modelIntro}>
          {description ? <p className={styles.modelDescription}>{description}</p> : null}
          <SpecStrip locale={locale} attributes={attributes} units={units} />
        </section>
      ) : null}

      {details.variants.length ? (
        <PageSection title={t("variantsTitle")}>
          <table className={styles.variantTable}>
            <thead>
              <tr>
                <th>{locale === "vi" ? "Phiên bản" : "Variant"}</th>
                <th>{locale === "vi" ? "Giá" : "Price"}</th>
              </tr>
            </thead>
            <tbody>
              {details.variants.map((variant) => (
                <tr key={variant.id}>
                  <td>{pickLocale(variant.name, locale)}</td>
                  <td>
                    {variant.price
                      ? formatPriceFrom(variant.price, locale)
                      : formatVnd(variant.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </PageSection>
      ) : null}

      {details.featureSections.length ? (
        <PageSection title={t("featuresTitle")}>
          <div className={sectionStyles.grid}>
            {details.featureSections.map((section) => (
              <article key={section.id} className={styles.featureBlock}>
                {section.imageMedia?.publicUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={section.imageMedia.publicUrl}
                    alt={pickLocale(section.imageMedia.altText, locale) || pickLocale(section.title, locale)}
                    className={styles.featureImage}
                  />
                ) : null}
                <h3>{pickLocale(section.title, locale)}</h3>
                <p>{pickLocale(section.body, locale)}</p>
              </article>
            ))}
          </div>
        </PageSection>
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
    </>
  );
}

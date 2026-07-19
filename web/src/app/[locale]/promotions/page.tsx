import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { toPromoVM } from "@/components/home";
import { PromoCard, type PromoCardVM } from "@/components/promotions";
import { createLocalizeHref } from "@/lib/i18n/localize-href";
import { Link } from "@/lib/i18n/navigation";
import { getHeroSlides, getSiteSettings } from "@/lib/queries/public";
import { buildPageMetadata, resolveOgImageUrl } from "@/lib/seo";
import { resolveLocalized, type Locale } from "@/lib/view-models/common";
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
 * Promotions listing — Electric Ink listing fidelity (no dedicated Penpot frame).
 *
 * ponytail: ceiling = home promoCountdown + message copy (+ hero image for card media).
 * Upgrade path = backend CMS promotions module (CRUD + published list service) consumed
 * via lib/queries — do NOT invent that contract in the frontend lane.
 */
export default async function PromotionsPage({ params }: Props) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  setRequestLocale(locale);

  const t = await getTranslations("promotions");
  const tHome = await getTranslations("home");
  const tc = await getTranslations("common");
  const tPromo = await getTranslations("promo");
  const localizeHref = createLocalizeHref(locale);

  const [settings, heroSlides] = await Promise.all([
    getSiteSettings(),
    getHeroSlides(),
  ]);

  const promoBullets = [
    tHome("promoBullet1"),
    tHome("promoBullet2"),
    tHome("promoBullet3"),
    tHome("promoBullet4"),
  ].filter(Boolean);

  const basePromo = toPromoVM(settings?.promoCountdown, locale, {
    overline: tHome("promoOverline"),
    titleFallback: tHome("promoTitle"),
    bullets: promoBullets,
    dateRangeNote: tHome("promoDateRange"),
    validUntil: tPromo("validUntil"),
    ctaLabel: t("cardCta"),
    ctaHref: localizeHref("/book-test-drive"),
  });

  const heroImage =
    heroSlides.find((s) => s.imageMedia?.publicUrl)?.imageMedia ?? null;
  const imageAlt =
    resolveLocalized(heroImage?.altText, locale) ||
    (basePromo?.title ?? t("title"));

  const items: PromoCardVM[] = basePromo
    ? [
        {
          ...basePromo,
          id: "home-promo",
          imageUrl: heroImage?.publicUrl ?? null,
          imageAlt,
        },
      ]
    : [];

  const countdownLabels = {
    days: tc("countdownDays"),
    hours: tc("countdownHours"),
    minutes: tc("countdownMinutes"),
    seconds: tc("countdownSeconds"),
    heading: tc("countdownHeading"),
  };

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
        </div>
      </header>

      <section className={styles.main} aria-labelledby="promotions-heading">
        <div className={styles.mainInner}>
          <h2 id="promotions-heading" className={styles.visuallyHidden}>
            {t("listHeading")}
          </h2>
          {items.length === 0 ? (
            <p className={styles.empty}>{t("empty")}</p>
          ) : (
            <ul className={styles.list}>
              {items.map((promo) => (
                <li key={promo.id}>
                  <PromoCard promo={promo} countdownLabels={countdownLabels} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

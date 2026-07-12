import { getTranslations, setRequestLocale } from "next-intl/server";
import { pickLocale } from "@/lib/attributes";
import HeroCarousel from "@/components/HeroCarousel";
import PromoCountdown from "@/components/PromoCountdown";
import NewsCard from "@/components/NewsCard";
import PageSection from "@/components/PageSection";
import sectionStyles from "@/components/PageSection.module.css";
import VehicleLineup from "@/components/VehicleLineup";
import PromoModal from "@/components/PromoModal";
import { Link } from "@/lib/i18n/navigation";
import {
  getFeaturedNews,
  getHeroSlides,
  getPublishedModels,
  getServiceBlocks,
  getSiteSettings,
} from "@/lib/queries/public";
import styles from "./page.module.css";

const privilegesVi = [
  {
    icon: "🎁",
    title: "Chính Sách Ưu Đãi Mới",
    desc: "Giảm trực tiếp giá bán, tặng bảo hiểm vật chất và gói phụ kiện cao cấp chính hãng.",
  },
  {
    icon: "🏦",
    title: "Hỗ Trợ Trả Góp Lên Tới 80%",
    desc: "Thủ tục nhanh gọn, lãi suất ưu đãi cố định, thời hạn vay linh hoạt lên đến 8 năm.",
  },
  {
    icon: "⚡",
    title: "Đặc Quyền Lái Thử Miễn Phí",
    desc: "Hỗ trợ lái thử tận nhà miễn phí 24/7, trải nghiệm thực tế khả năng vận hành vượt trội.",
  },
  {
    icon: "🔄",
    title: "Thu Cũ Đổi Mới Xe Điện",
    desc: "Hỗ trợ thu mua xe xăng cũ giá cao và đổi sang xe điện với trợ giá lên đến 30 triệu.",
  },
];

const privilegesEn = [
  {
    icon: "🎁",
    title: "Exclusive Campaign Incentives",
    desc: "Direct price discounts, free material insurance, and premium original accessories package.",
  },
  {
    icon: "🏦",
    title: "Installment Support Up To 80%",
    desc: "Quick procedures, guaranteed fixed low interest rates, flexible loan terms up to 8 years.",
  },
  {
    icon: "⚡",
    title: "Free Test Drive At Home",
    desc: "Complimentary home test drive 24/7. Experience next-gen electric mobility firsthand.",
  },
  {
    icon: "🔄",
    title: "Trade-in Bonus Program",
    desc: "High-value trade-in for gasoline cars with up to 30 million VND voucher bonus for new electric models.",
  },
];

/** @param {string} ctaRouteKey @param {string} locale @param {object[]} models */
function resolveSlideCta(ctaRouteKey, locale, models) {
  if (!ctaRouteKey) return undefined;
  if (ctaRouteKey.startsWith("/book-test-drive") || ctaRouteKey === "/book-test-drive") {
    return "/book-test-drive";
  }
  if (ctaRouteKey.startsWith("/deposit") || ctaRouteKey === "/deposit") {
    return "/deposit";
  }
  const slug = ctaRouteKey.replace(/^\//, "");
  const model = models.find((m) => pickLocale(m.slug, locale) === slug);
  if (model) {
    return { pathname: "/models/[slug]", params: { slug: pickLocale(model.slug, locale) } };
  }
  return "/";
}

export default async function HomePage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const tc = await getTranslations("common");

  const [settings, slides, models, services, news] = await Promise.all([
    getSiteSettings(),
    getHeroSlides(),
    getPublishedModels(),
    getServiceBlocks(),
    getFeaturedNews(3),
  ]);

  const heroSlides = slides.map((slide) => ({
    id: slide.id,
    title: pickLocale(slide.title, locale),
    subtitle: slide.subtitle ? pickLocale(slide.subtitle, locale) : undefined,
    ctaLabel: slide.ctaLabel ? pickLocale(slide.ctaLabel, locale) : undefined,
    ctaHref: slide.ctaRouteKey ? resolveSlideCta(slide.ctaRouteKey, locale, models) : undefined,
    imageUrl: slide.imageMedia?.publicUrl,
  }));

  const tradeIn = /** @type {{ vi?: { title?: string, body?: string }, en?: { title?: string, body?: string } }} */ (
    settings?.tradeInBlock
  );
  const tradeInLocale = tradeIn?.[locale] ?? tradeIn?.vi;
  const tradeInTitle = tradeInLocale?.title || t("tradeInTitle");
  const tradeInBody = tradeInLocale?.body || t("tradeInDefault");

  const promo = /** @type {{ enabled?: boolean, endAt?: string, label?: { vi?: string, en?: string } }} */ (
    settings?.promoCountdown
  );
  const showPromo = promo?.enabled && promo?.endAt && new Date(promo.endAt) > new Date();

  const dealerName = settings ? pickLocale(settings.dealerName, locale) : "";
  const privileges = locale === "vi" ? privilegesVi : privilegesEn;

  return (
    <>
      {showPromo ? (
        <PromoCountdown
          endAt={promo.endAt}
          label={pickLocale(promo.label, locale)}
        />
      ) : null}
      
      {/* Hero Header Slides */}
      <HeroCarousel slides={heroSlides} />

      {/* Dynamic Lineup Showcase with Category Filter Tabs */}
      <VehicleLineup
        locale={locale}
        models={models}
        sectionTitle={t("lineupTitle")}
        priceLabel={tc("viewDetails")}
      />

      {/* Buyer Privileges Section */}
      <section className={styles.privilegesSection}>
        <div className={styles.tradeInInner}>
          <h2 className={styles.privilegesHeading}>
            {locale === "vi" ? `ĐẶC QUYỀN MUA XE TẠI ${(dealerName || "").toUpperCase()}`.trim() : "PURCHASE PRIVILEGES"}
          </h2>
          <div className={styles.privilegesGrid}>
            {privileges.map((item, idx) => (
              <div key={idx} className={styles.privilegeCard}>
                <span className={styles.privilegeIcon}>{item.icon}</span>
                <h4 className={styles.privilegeTitle}>{item.title}</h4>
                <p className={styles.privilegeDesc}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Showcase */}
      <PageSection title={t("servicesTitle")}>
        <div className={`${sectionStyles.grid} ${sectionStyles.gridCols4}`}>
          {services.map((block) => (
            <article key={block.id} className={styles.serviceCard}>
              <h3>{pickLocale(block.title, locale)}</h3>
              {block.description ? (
                <p>{pickLocale(block.description, locale)}</p>
              ) : null}
              {block.linkRouteKey ? (
                <Link href={block.linkRouteKey}>{tc("learnMore")}</Link>
              ) : null}
            </article>
          ))}
        </div>
      </PageSection>

      {/* News Teaser Section */}
      {news.length ? (
        <PageSection title={t("newsTitle")}>
          <div className={`${sectionStyles.grid} ${sectionStyles.gridCols3}`}>
            {news.map((post) => (
              <NewsCard key={post.id} locale={locale} post={post} ctaLabel={tc("viewDetails")} />
            ))}
          </div>
          <p className={styles.moreLink}>
            <Link href="/news">{tc("news")}</Link>
          </p>
        </PageSection>
      ) : null}

      {/* Trade-in Campaign Section */}
      <section className={styles.tradeIn}>
        <div className={styles.tradeInInner}>
          <h2>{tradeInTitle}</h2>
          <p>{tradeInBody}</p>
        </div>
      </section>

      {/* Automatic Promotional Overlay Modal Popup */}
      <PromoModal locale={locale} models={models} badge={pickLocale(promo?.label, locale) || undefined} />
    </>
  );
}

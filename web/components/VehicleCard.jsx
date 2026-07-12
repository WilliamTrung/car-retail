import { Link } from "@/lib/i18n/navigation";
import { pickLocale } from "@/lib/attributes";
import { formatPriceFrom } from "@/lib/format";
import styles from "./VehicleCard.module.css";

/**
 * @param {{ locale: string, model: object, priceLabel: string }} props
 */
export default function VehicleCard({ locale, model, priceLabel }) {
  const name = pickLocale(model.name, locale);
  const tagline = pickLocale(model.tagline, locale);
  const slug = pickLocale(model.slug, locale);
  const imageUrl = model.heroMedia?.publicUrl;
  const alt = model.heroMedia?.altText
    ? pickLocale(model.heroMedia.altText, locale)
    : name;

  const prices = model.variants.map((v) => v.price).filter(Boolean);
  const minPrice = prices.length ? prices.reduce((a, b) => (Number(a) < Number(b) ? a : b)) : null;

  // Format Starting Price
  const startingPriceText = minPrice
    ? (locale === "vi" 
       ? `Giá chỉ từ: ${formatPriceFrom(minPrice, locale)}` 
       : `Price from: ${formatPriceFrom(minPrice, locale)}`)
    : null;

  // Parse attributes dynamically from JSON field
  let attributes = [];
  try {
    attributes = typeof model.attributes === "string" 
      ? JSON.parse(model.attributes) 
      : (model.attributes ?? []);
  } catch {
    attributes = [];
  }

  // Extract core specifications for grid list
  const rangeAttr = attributes.find((a) => a.key === "range");
  const seatsAttr = attributes.find((a) => a.key === "seats");
  const batteryAttr = attributes.find((a) => a.key === "battery");

  return (
    <article className={styles.card}>
      {/* Zoom-on-hover Image Wrapper */}
      <div className={styles.imageWrapper}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={alt} className={styles.image} loading="lazy" />
        ) : (
          <div className={styles.placeholder} aria-hidden="true" />
        )}
      </div>

      <div className={styles.info}>
        <h3 className={styles.name}>{name}</h3>
        {tagline ? <p className={styles.tagline}>{tagline}</p> : null}
        
        {startingPriceText ? <p className={styles.price}>{startingPriceText}</p> : null}
        
        {/* Specifications strip inside card */}
        {(rangeAttr || seatsAttr || batteryAttr) && (
          <div className={styles.specStrip}>
            {seatsAttr && (
              <span className={styles.specItem} title="Số chỗ ngồi">
                💺 {seatsAttr.value} {locale === "vi" ? "chỗ" : "seats"}
              </span>
            )}
            {rangeAttr && (
              <span className={styles.specItem} title="Quãng đường đi được">
                ⚡ {rangeAttr.value} km
              </span>
            )}
            {batteryAttr && (
              <span className={styles.specItem} title="Dung lượng pin">
                🔋 {batteryAttr.value} kWh
              </span>
            )}
          </div>
        )}
      </div>

      {/* Double CTA Buttons */}
      <div className={styles.ctaRow}>
        <Link
          href={{ pathname: "/models/[slug]", params: { slug } }}
          className={styles.btnSecondary}
        >
          {priceLabel}
        </Link>
        <Link
          href={{ pathname: "/deposit", query: { model: model.id } }}
          className={styles.btnPrimary}
        >
          {locale === "vi" ? "Đặt cọc" : "Deposit"}
        </Link>
      </div>
    </article>
  );
}

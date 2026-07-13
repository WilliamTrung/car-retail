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

  let attributes = [];
  try {
    attributes =
      typeof model.attributes === "string"
        ? JSON.parse(model.attributes)
        : (model.attributes ?? []);
  } catch {
    attributes = [];
  }

  const rangeAttr = attributes.find((a) => a.key === "range");
  const seatsAttr = attributes.find((a) => a.key === "seats");

  return (
    <article className={styles.card}>
      <Link href={{ pathname: "/models/[slug]", params: { slug } }} className={styles.imageLink}>
        <div className={styles.imageStage}>
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={alt} className={styles.image} loading="lazy" />
          ) : (
            <div className={styles.placeholder} aria-hidden="true" />
          )}
        </div>
      </Link>

      <div className={styles.body}>
        <Link href={{ pathname: "/models/[slug]", params: { slug } }} className={styles.nameLink}>
          <h3 className={styles.name}>{name}</h3>
        </Link>
        {tagline ? <p className={styles.tagline}>{tagline}</p> : null}

        {minPrice ? (
          <p className={styles.price}>
            <span className={styles.priceLabel}>{locale === "vi" ? "Giá từ" : "From"}</span>
            {formatPriceFrom(minPrice, locale)}
          </p>
        ) : null}

        {(rangeAttr || seatsAttr) && (
          <ul className={styles.specs}>
            {rangeAttr ? (
              <li>
                <span className={styles.specKey}>{locale === "vi" ? "Quãng đường" : "Range"}</span>
                <span className={styles.specVal}>{rangeAttr.value} km</span>
              </li>
            ) : null}
            {seatsAttr ? (
              <li>
                <span className={styles.specKey}>{locale === "vi" ? "Chỗ ngồi" : "Seats"}</span>
                <span className={styles.specVal}>{seatsAttr.value}</span>
              </li>
            ) : null}
          </ul>
        )}
      </div>

      <div className={styles.ctaRow}>
        <Link
          href={{ pathname: "/book-test-drive", query: { model: model.id } }}
          className={styles.btnPrimary}
        >
          {locale === "vi" ? "Lái thử" : "Test drive"}
        </Link>
        <Link href={{ pathname: "/models/[slug]", params: { slug } }} className={styles.btnSecondary}>
          {priceLabel}
        </Link>
      </div>
    </article>
  );
}

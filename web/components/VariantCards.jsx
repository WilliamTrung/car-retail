import { Link } from "@/lib/i18n/navigation";
import { pickLocale } from "@/lib/attributes";
import { formatPriceFrom } from "@/lib/format";
import styles from "./VariantCards.module.css";

/**
 * @param {{ locale: string, modelId: string, variants: object[], testDriveLabel: string, depositLabel: string }} props
 */
export default function VariantCards({ locale, modelId, variants, testDriveLabel, depositLabel }) {
  if (!variants.length) return null;

  return (
    <div className={styles.grid}>
      {variants.map((variant) => (
        <article key={variant.id} className={styles.card}>
          <h3 className={styles.name}>{pickLocale(variant.name, locale)}</h3>
          <p className={styles.price}>
            {variant.price
              ? formatPriceFrom(variant.price, locale)
              : locale === "vi"
                ? "Liên hệ"
                : "Contact us"}
          </p>
          <div className={styles.actions}>
            <Link
              href={{ pathname: "/book-test-drive", query: { model: modelId, variant: variant.id } }}
              className={styles.primary}
            >
              {testDriveLabel}
            </Link>
            <Link
              href={{ pathname: "/deposit", query: { model: modelId, variant: variant.id } }}
              className={styles.secondary}
            >
              {depositLabel}
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

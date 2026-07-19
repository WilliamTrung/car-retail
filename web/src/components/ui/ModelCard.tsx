import type { Locale } from "@/lib/view-models/common";
import type { ModelCardVM } from "@/lib/view-models/model-card";
import { Button } from "./Button";
import { Chip, EcoChip } from "./Chip";
import { PriceText } from "./PriceText";
import { SmartImage } from "./SmartImage";
import styles from "./ModelCard.module.css";

type ModelCardProps = {
  model: ModelCardVM;
  locale?: Locale;
  /** `flat` = shadowless catalog grid cards (Electric Ink dense grids). */
  variant?: "default" | "flat";
  labels?: {
    priceFrom?: string;
    contactPrice?: string;
    viewDetails?: string;
    testDrive?: string;
    eco?: string;
  };
  className?: string;
};

export function ModelCard({
  model,
  locale = "vi",
  variant = "default",
  labels,
  className,
}: ModelCardProps) {
  return (
    <article
      className={[
        styles.card,
        variant === "flat" ? styles.flat : null,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <SmartImage
        src={model.imageUrl}
        alt={model.imageAlt}
        aspectRatio="4 / 3"
        sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={styles.media}
      />
      <div className={styles.body}>
        <div className={styles.meta}>
          {model.isEv ? (
            <EcoChip>{labels?.eco ?? "⚡ 100% Điện"}</EcoChip>
          ) : null}
          {model.taglineOverline ? (
            <span className={styles.overline}>{model.taglineOverline}</span>
          ) : null}
        </div>
        <h3 className={styles.name}>{model.name}</h3>
        <ul className={styles.specs}>
          {model.specChips.map((chip) => (
            <li key={chip.key}>
              <Chip variant="spec" className={styles.specChip}>
                <span className={styles.chipIcon} aria-hidden>
                  {chip.icon}
                </span>
                <span className={styles.chipValue}>{chip.value}</span>
                {chip.unit ? (
                  <span className={styles.chipUnit}>{chip.unit}</span>
                ) : null}
              </Chip>
            </li>
          ))}
        </ul>
        <p className={styles.priceRow}>
          <span className={styles.priceFrom}>
            {labels?.priceFrom ?? "Giá từ"}
          </span>{" "}
          <PriceText
            amount={model.priceFromVnd}
            locale={locale}
            size="base"
            contactLabel={labels?.contactPrice}
          />
        </p>
        {model.promoLine ? (
          <p className={styles.promo}>{model.promoLine}</p>
        ) : null}
        <div className={styles.actions}>
          <Button variant="outline" href={model.detailHref} size="md">
            {labels?.viewDetails ?? "Xem chi tiết"}
          </Button>
          <Button variant="primary" href={model.leadHref} size="md">
            {labels?.testDrive ?? "Lái thử / Tư vấn"}
          </Button>
        </div>
      </div>
    </article>
  );
}

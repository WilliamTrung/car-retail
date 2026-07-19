import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { PromoCountdown } from "@/components/ui/PromoCountdown";
import type { PromoListingCardVM } from "@/lib/view-models/promotion";
import styles from "./PromoListingCard.module.css";

type CountdownLabels = {
  days?: string;
  hours?: string;
  minutes?: string;
  seconds?: string;
  heading?: string;
};

type PromoListingCardProps = {
  promo: PromoListingCardVM;
  countdownLabels?: CountdownLabels;
  applicableLabel: string;
};

/**
 * Flat, imageless listing card — text/badge-led.
 * Do NOT reuse image-led home PromoCard here.
 */
export function PromoListingCard({
  promo,
  countdownLabels,
  applicableLabel,
}: PromoListingCardProps) {
  const titleId = `promo-card-${promo.id}-title`;

  return (
    <article
      id={`promo-${promo.id}`}
      className={styles.card}
      aria-labelledby={titleId}
    >
      <div className={styles.meta}>
        <Chip variant="promo">{promo.offerTypeLabel}</Chip>
        <PromoCountdown
          timing={promo.timing}
          labels={countdownLabels}
          className={
            promo.timing.mode === "live" ? styles.liveTimer : undefined
          }
        />
      </div>

      <h3 id={titleId} className={styles.title}>
        {promo.title}
      </h3>
      <p className={styles.summary}>{promo.summary}</p>

      <div className={styles.models}>
        <span className={styles.modelsLabel}>{applicableLabel}</span>
        <ul className={styles.chips}>
          {promo.applicableModels.map((label) => (
            <li key={label}>
              <Chip variant="spec">{label}</Chip>
            </li>
          ))}
        </ul>
      </div>

      {promo.conditionsHref ? (
        <a href={promo.conditionsHref} className={styles.conditions}>
          {promo.conditionsLabel}
        </a>
      ) : null}

      <div className={styles.actions}>
        <Button variant="primary" size="md" href={promo.primaryCta.href}>
          {promo.primaryCta.label}
        </Button>
        <Button variant="ghost" size="md" href={promo.secondaryCta.href}>
          {promo.secondaryCta.label}
        </Button>
      </div>
    </article>
  );
}

import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { PromoCountdown } from "@/components/ui/PromoCountdown";
import { SmartImage } from "@/components/ui/SmartImage";
import type { SpotlightPromoVM } from "@/lib/view-models/promotion";
import styles from "./SpotlightPromo.module.css";

type CountdownLabels = {
  days?: string;
  hours?: string;
  minutes?: string;
  seconds?: string;
  heading?: string;
};

type SpotlightPromoProps = {
  promo: SpotlightPromoVM;
  overline: string;
  countdownLabels?: CountdownLabels;
  headingId?: string;
};

/** Ink/800 focal band — sole image-led promo on the listing. */
export function SpotlightPromo({
  promo,
  overline,
  countdownLabels,
  headingId = "promo-spotlight-title",
}: SpotlightPromoProps) {
  return (
    <section
      className={styles.root}
      aria-labelledby={headingId}
    >
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.overline}>{overline}</p>
          <Chip variant="promo">{promo.offerTypeLabel}</Chip>
          <h2 id={headingId} className={styles.title}>
            {promo.title}
          </h2>
          <p className={styles.summary}>{promo.summary}</p>
          {promo.bullets.length ? (
            <ul className={styles.bullets}>
              {promo.bullets.map((b) => (
                <li key={b}>
                  <Icon name="check" size={18} className={styles.bulletIcon} />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          ) : null}
          <PromoCountdown
            timing={promo.timing}
            labels={countdownLabels}
            className={styles.timer}
          />
          <div className={styles.actions}>
            <Button variant="primary" size="lg" href={promo.primaryCta.href}>
              {promo.primaryCta.label}
            </Button>
            <Button
              variant="dark-outline"
              size="lg"
              href={promo.secondaryCta.href}
            >
              {promo.secondaryCta.label}
            </Button>
          </div>
        </div>
        <div className={styles.media}>
          <SmartImage
            src={promo.imageUrl}
            alt={promo.imageAlt}
            aspectRatio="16 / 9"
            sizes="(max-width: 900px) 100vw, 560px"
            priority
          />
        </div>
      </div>
    </section>
  );
}

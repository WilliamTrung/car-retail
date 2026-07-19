import type { PromoVM } from "@/lib/view-models/home";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { PromoCountdown } from "@/components/ui/PromoCountdown";
import { SmartImage } from "@/components/ui/SmartImage";
import styles from "./PromoCard.module.css";

export type PromoCardVM = PromoVM & {
  id: string;
  imageUrl: string | null;
  imageAlt: string;
};

type PromoCardProps = {
  promo: PromoCardVM;
  countdownLabels: {
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
    heading: string;
  };
};

export function PromoCard({ promo, countdownLabels }: PromoCardProps) {
  return (
    <article className={styles.card} aria-labelledby={`promo-${promo.id}-title`}>
      <div className={styles.media}>
        <SmartImage
          src={promo.imageUrl}
          alt={promo.imageAlt}
          aspectRatio="16 / 9"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 560px"
        />
      </div>
      <div className={styles.body}>
        {promo.overline ? (
          <p className={styles.overline}>{promo.overline}</p>
        ) : null}
        <h2 id={`promo-${promo.id}-title`} className={styles.title}>
          {promo.title}
        </h2>
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
        {promo.dateRangeNote ? (
          <p className={styles.dateNote}>{promo.dateRangeNote}</p>
        ) : null}
        <div className={styles.actions}>
          <Button variant="primary" size="lg" href={promo.ctaHref}>
            {promo.ctaLabel}
          </Button>
        </div>
      </div>
    </article>
  );
}

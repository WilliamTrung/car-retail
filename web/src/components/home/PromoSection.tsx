import type { PromoVM } from "@/lib/view-models/home";
import { Button } from "@/components/ui/Button";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { Icon } from "@/components/ui/Icon";
import styles from "./PromoSection.module.css";

type PromoSectionProps = {
  promo: PromoVM;
  countdownLabels: {
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
    heading: string;
  };
};

export function PromoSection({ promo, countdownLabels }: PromoSectionProps) {
  return (
    <section className={styles.root} aria-labelledby="home-promo-title">
      <div className={styles.inner}>
        <div className={styles.copy}>
          {promo.overline ? (
            <p className={styles.overline}>{promo.overline}</p>
          ) : null}
          <h2 id="home-promo-title" className={styles.title}>
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
          {promo.dateRangeNote ? (
            <p className={styles.dateNote}>{promo.dateRangeNote}</p>
          ) : null}
        </div>

        <div className={styles.panel}>
          {promo.endsAt ? (
            <CountdownTimer
              endsAt={promo.endsAt}
              labels={countdownLabels}
              className={styles.timer}
            />
          ) : null}
          <Button variant="primary" size="lg" href={promo.ctaHref}>
            {promo.ctaLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}

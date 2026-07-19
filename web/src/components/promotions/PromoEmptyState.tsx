import { Button } from "@/components/ui/Button";
import styles from "./PromoEmptyState.module.css";

type PromoEmptyStateProps = {
  title: string;
  body: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

export function PromoEmptyState({
  title,
  body,
  primaryCta,
  secondaryCta,
}: PromoEmptyStateProps) {
  return (
    <div className={styles.root} role="status">
      <div className={styles.glyph} aria-hidden="true">
        <svg viewBox="0 0 64 64" width="48" height="48" focusable="false">
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="currentColor"
            opacity="0.12"
          />
          <path
            fill="currentColor"
            d="M20 38c0-6.6 5.4-12 12-12s12 5.4 12 12v2H20v-2zm12-14a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"
            opacity="0.55"
          />
        </svg>
      </div>
      <h2 id="promo-empty-title" className={styles.title}>
        {title}
      </h2>
      <p className={styles.body}>{body}</p>
      <div className={styles.actions}>
        <Button variant="primary" size="md" href={primaryCta.href}>
          {primaryCta.label}
        </Button>
        {secondaryCta ? (
          <Button variant="ghost" size="md" href={secondaryCta.href}>
            {secondaryCta.label}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

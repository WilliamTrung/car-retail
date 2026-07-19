import styles from "./DateBadge.module.css";

type DateBadgeProps = {
  label: string;
  className?: string;
};

/** Static promo validity badge — no JS timer. */
export function DateBadge({ label, className }: DateBadgeProps) {
  if (!label) return null;
  return (
    <p className={[styles.badge, className].filter(Boolean).join(" ")}>
      {label}
    </p>
  );
}

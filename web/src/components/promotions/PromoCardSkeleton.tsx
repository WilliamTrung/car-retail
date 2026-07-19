import styles from "./PromoCardSkeleton.module.css";

type PromoCardSkeletonProps = {
  count?: number;
};

export function PromoCardSkeleton({ count = 4 }: PromoCardSkeletonProps) {
  return (
    <ul className={styles.grid} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className={styles.card}>
          <div className={styles.meta}>
            <span className={styles.chip} />
            <span className={[styles.line, styles.lineShort].join(" ")} />
          </div>
          <div className={styles.line} />
          <div className={[styles.line, styles.lineMid].join(" ")} />
          <div className={styles.chips}>
            <span className={styles.chip} />
            <span className={styles.chip} />
          </div>
          <div className={styles.actions}>
            <span className={styles.btn} />
            <span className={styles.btnGhost} />
          </div>
        </li>
      ))}
    </ul>
  );
}

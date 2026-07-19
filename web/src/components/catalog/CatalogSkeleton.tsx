import styles from "./CatalogSkeleton.module.css";

type CatalogSkeletonProps = {
  count?: number;
};

export function CatalogSkeleton({ count = 6 }: CatalogSkeletonProps) {
  return (
    <ul className={styles.grid} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className={styles.card}>
          <div className={styles.media} />
          <div className={styles.body}>
            <div className={styles.line} />
            <div className={[styles.line, styles.lineShort].join(" ")} />
            <div className={styles.chips}>
              <span className={styles.chip} />
              <span className={styles.chip} />
              <span className={styles.chip} />
            </div>
            <div className={[styles.line, styles.linePrice].join(" ")} />
          </div>
        </li>
      ))}
    </ul>
  );
}

import { PromoCardSkeleton } from "@/components/promotions";
import styles from "./page.module.css";

/** Route-level loading UI while /promotions streams. */
export default function PromotionsLoading() {
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.bandCountSkeleton} style={{ width: "8rem" }} />
          <div
            className={styles.bandCountSkeleton}
            style={{ width: "18rem", height: 44 }}
          />
          <div
            className={styles.bandCountSkeleton}
            style={{ width: "28rem", height: 20 }}
          />
        </div>
      </header>
      <div className={styles.spotlightSkeleton} aria-hidden />
      <section className={styles.skeletonMain}>
        <div className={styles.skeletonInner}>
          <PromoCardSkeleton count={4} />
        </div>
      </section>
    </div>
  );
}

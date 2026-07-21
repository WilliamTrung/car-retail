import { CatalogSkeleton } from "@/components/catalog";
import styles from "./page.module.css";

/** Route-level loading UI — skeleton grid while /models streams. */
export default function ModelsCatalogLoading() {
  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.bandCountSkeleton} style={{ width: "8rem" }} />
          <div
            className={styles.bandCountSkeleton}
            style={{ width: "16rem", height: 40 }}
          />
          <div
            className={styles.bandCountSkeleton}
            style={{ width: "24rem", height: 20 }}
          />
        </div>
      </header>
      <section className={styles.main}>
        <div className={styles.mainInner}>
          <div className={styles.fallbackLayout}>
            <div className={styles.fallbackSidebar} />
            <div className={styles.fallbackResults}>
              <div className={styles.fallbackHead} />
              <CatalogSkeleton count={6} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

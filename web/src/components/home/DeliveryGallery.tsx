import type { DeliveryItemVM } from "@/lib/view-models/home";
import { DeliveryCard } from "@/components/ui/DeliveryCard";
import { SectionTitle } from "@/components/ui/SectionTitle";
import styles from "./DeliveryGallery.module.css";

type DeliveryGalleryProps = {
  overline: string;
  title: string;
  items: DeliveryItemVM[];
};

export function DeliveryGallery({ overline, title, items }: DeliveryGalleryProps) {
  if (!items.length) return null;

  return (
    <section className={styles.root} aria-labelledby="home-delivery-title">
      <div className={styles.inner}>
        <SectionTitle overline={overline} title={title} align="center" />
        <span id="home-delivery-title" className={styles.srOnly}>
          {title}
        </span>
        <div className={styles.scroller}>
          <ul className={styles.track}>
            {items.map((item) => (
              <li key={item.id} className={styles.slide}>
                <DeliveryCard item={item} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

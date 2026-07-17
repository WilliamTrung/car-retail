import type { DeliveryItemVM } from "@/lib/view-models/home";
import { SmartImage } from "./SmartImage";
import styles from "./DeliveryCard.module.css";

type DeliveryCardProps = {
  item: DeliveryItemVM;
  className?: string;
};

export function DeliveryCard({ item, className }: DeliveryCardProps) {
  return (
    <figure className={[styles.card, className].filter(Boolean).join(" ")}>
      <SmartImage
        src={item.imageUrl}
        alt={item.caption}
        aspectRatio="4 / 3"
        sizes="(max-width: 640px) 50vw, 20vw"
        placeholderCaption={item.caption || "Ảnh bàn giao"}
      />
      <figcaption className={styles.caption}>{item.caption}</figcaption>
    </figure>
  );
}

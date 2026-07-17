import type { NewsTeaserVM } from "@/lib/view-models/home";
import { Chip } from "./Chip";
import { SmartImage } from "./SmartImage";
import styles from "./NewsCard.module.css";

type NewsCardProps = {
  item: NewsTeaserVM;
  viewDetailsLabel?: string;
  className?: string;
};

export function NewsCard({
  item,
  viewDetailsLabel = "Xem chi tiết →",
  className,
}: NewsCardProps) {
  const chipVariant =
    item.tagKind === "promo"
      ? "promo"
      : item.tagKind === "service"
        ? "tag"
        : "tag";

  return (
    <article className={[styles.card, className].filter(Boolean).join(" ")}>
      <SmartImage
        src={item.imageUrl}
        alt={item.title}
        aspectRatio="16 / 9"
        sizes="(max-width: 900px) 100vw, 33vw"
        placeholderCaption={`Ảnh ${item.title}`}
      />
      <div className={styles.body}>
        <div className={styles.meta}>
          <Chip variant={chipVariant}>{item.tag}</Chip>
          <time className={styles.date} dateTime={item.date}>
            {item.date}
          </time>
        </div>
        <h3 className={styles.title}>{item.title}</h3>
        <a className={styles.link} href={item.href}>
          {viewDetailsLabel}
        </a>
      </div>
    </article>
  );
}

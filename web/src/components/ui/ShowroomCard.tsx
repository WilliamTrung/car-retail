import type { ShowroomVM } from "@/lib/view-models/showroom";
import { toTelHref } from "@/lib/view-models/mappers";
import { Button } from "./Button";
import { Chip } from "./Chip";
import { Icon } from "./Icon";
import { SmartImage } from "./SmartImage";
import styles from "./ShowroomCard.module.css";

type ShowroomCardProps = {
  showroom: ShowroomVM;
  labels?: {
    directions?: string;
    book?: string;
  };
  className?: string;
};

export function ShowroomCard({
  showroom,
  labels,
  className,
}: ShowroomCardProps) {
  const tel = showroom.hotline ? toTelHref(showroom.hotline) : undefined;

  return (
    <article className={[styles.card, className].filter(Boolean).join(" ")}>
      <SmartImage
        src={showroom.imageUrl}
        alt={showroom.name}
        aspectRatio="4 / 3"
        sizes="(max-width: 900px) 100vw, 33vw"
        placeholderCaption={`Ảnh ${showroom.name}`}
        className={styles.media}
      />
      <div className={styles.body}>
        <div className={styles.titleRow}>
          <h3 className={styles.name}>{showroom.name}</h3>
          <Chip variant="tag">{showroom.typeTag}</Chip>
        </div>
        {showroom.address ? (
          <p className={styles.row}>
            <Icon name="pin" size={16} />
            <span>{showroom.address}</span>
          </p>
        ) : null}
        {showroom.hours ? (
          <p className={styles.row}>
            <Icon name="clock" size={16} />
            <span>{showroom.hours}</span>
          </p>
        ) : null}
        {showroom.hotline && tel ? (
          <p className={styles.row}>
            <Icon name="phone" size={16} />
            <a href={tel} className={styles.tel}>
              {showroom.hotline}
            </a>
          </p>
        ) : null}
        <div className={styles.actions}>
          <Button
            variant="outline"
            size="md"
            href={showroom.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {labels?.directions ?? "Chỉ đường"}
          </Button>
          <Button variant="primary" size="md" href={showroom.bookHref}>
            {labels?.book ?? "Đăng ký lái thử"}
          </Button>
        </div>
      </div>
    </article>
  );
}

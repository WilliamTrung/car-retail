import type { ModelCardVM } from "@/lib/view-models/model-card";
import { Button } from "./Button";
import { Chip, EcoChip } from "./Chip";
import { PriceText } from "./PriceText";
import { SmartImage } from "./SmartImage";
import styles from "./ModelCard.module.css";

type ModelCardProps = {
  model: ModelCardVM;
  labels?: {
    priceFrom?: string;
    viewDetails?: string;
    testDrive?: string;
    eco?: string;
  };
  className?: string;
};

export function ModelCard({ model, labels, className }: ModelCardProps) {
  return (
    <article className={[styles.card, className].filter(Boolean).join(" ")}>
      <SmartImage
        src={model.imageUrl}
        alt={model.imageAlt}
        aspectRatio="4 / 3"
        sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
        placeholderCaption={`Ảnh ${model.name}`}
        className={styles.media}
      />
      <div className={styles.body}>
        <div className={styles.meta}>
          {model.isEv ? (
            <EcoChip>{labels?.eco ?? "⚡ 100% Điện"}</EcoChip>
          ) : null}
          {model.taglineOverline ? (
            <span className={styles.overline}>{model.taglineOverline}</span>
          ) : null}
        </div>
        <h3 className={styles.name}>{model.name}</h3>
        <ul className={styles.specs}>
          {model.specChips.map((chip) => (
            <li key={chip}>
              <Chip variant="spec">{chip}</Chip>
            </li>
          ))}
        </ul>
        <p className={styles.priceRow}>
          <span className={styles.priceFrom}>
            {labels?.priceFrom ?? "Giá từ"}
          </span>{" "}
          <PriceText amount={model.priceFromVnd} size="base" />
        </p>
        {model.promoLine ? (
          <p className={styles.promo}>{model.promoLine}</p>
        ) : null}
        <div className={styles.actions}>
          <Button variant="outline" href={model.detailHref} size="md">
            {labels?.viewDetails ?? "Xem chi tiết"}
          </Button>
          <Button variant="primary" href={model.leadHref} size="md">
            {labels?.testDrive ?? "Lái thử / Tư vấn"}
          </Button>
        </div>
      </div>
    </article>
  );
}

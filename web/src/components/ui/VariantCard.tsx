import type { VariantVM } from "@/lib/view-models/model-detail";
import { Chip } from "./Chip";
import { PriceText } from "./PriceText";
import styles from "./VariantCard.module.css";

type VariantCardProps = {
  variant: VariantVM;
  selected?: boolean;
  name?: string;
  onSelect?: () => void;
  className?: string;
};

/**
 * Presentational radio-style card. Selection lives in a client parent island;
 * this file stays server-compatible (no hooks).
 */
export function VariantCard({
  variant,
  selected = false,
  name = "variant",
  onSelect,
  className,
}: VariantCardProps) {
  return (
    <label
      className={[
        styles.card,
        selected && styles.selected,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <input
        className={styles.input}
        type="radio"
        name={name}
        value={variant.id}
        checked={selected}
        onChange={onSelect}
      />
      <div className={styles.body}>
        <div className={styles.row}>
          <span className={styles.name}>{variant.name}</span>
          <PriceText amount={variant.priceVnd} size="base" />
        </div>
        {variant.chips.length > 0 ? (
          <ul className={styles.chips}>
            {variant.chips.map((chip) => (
              <li key={chip}>
                <Chip variant="spec">{chip}</Chip>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </label>
  );
}

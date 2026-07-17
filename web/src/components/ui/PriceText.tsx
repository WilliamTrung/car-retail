import { formatVnd } from "@/lib/format";
import styles from "./PriceText.module.css";

type PriceTextProps = {
  amount: number | null | undefined;
  size?: "lg" | "base";
  contactLabel?: string;
  className?: string;
};

export function PriceText({
  amount,
  size = "base",
  contactLabel = "Liên hệ",
  className,
}: PriceTextProps) {
  const formatted = amount == null ? null : formatVnd(amount);
  const text = formatted || contactLabel;

  return (
    <span
      className={[
        styles.price,
        size === "lg" ? styles.lg : styles.base,
        !formatted && styles.fallback,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {text}
    </span>
  );
}

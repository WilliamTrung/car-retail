import { formatVnd } from "@/lib/format";
import enMessages from "../../../messages/en.json";
import viMessages from "../../../messages/vi.json";
import styles from "./PriceText.module.css";

type PriceTextProps = {
  amount: number | null | undefined;
  locale?: string;
  size?: "lg" | "base";
  contactLabel?: string;
  className?: string;
};

function contactFallbackFor(locale: string): string {
  return locale === "en"
    ? enMessages.price.contactFallback
    : viMessages.price.contactFallback;
}

export function PriceText({
  amount,
  locale = "vi",
  size = "base",
  contactLabel,
  className,
}: PriceTextProps) {
  const formatted = amount == null ? null : formatVnd(amount, locale);
  const text = formatted || contactLabel || contactFallbackFor(locale);

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

import type { ReactNode } from "react";
import styles from "./Chip.module.css";

type ChipVariant = "eco" | "spec" | "tag" | "promo" | "darkTag";

type ChipProps = {
  variant?: ChipVariant;
  children: ReactNode;
  className?: string;
};

export function Chip({ variant = "tag", children, className }: ChipProps) {
  return (
    <span className={[styles.chip, styles[variant], className].filter(Boolean).join(" ")}>
      {children}
    </span>
  );
}

/** Eco chip default copy — override via children. */
export function EcoChip({ children, className }: Omit<ChipProps, "variant">) {
  return (
    <Chip variant="eco" className={className}>
      {children ?? "⚡ 100% Điện"}
    </Chip>
  );
}

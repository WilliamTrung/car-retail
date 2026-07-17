import type { ReactNode } from "react";
import styles from "./SectionTitle.module.css";

type SectionTitleProps = {
  overline?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
  children?: ReactNode;
};

export function SectionTitle({
  overline,
  title,
  subtitle,
  align = "left",
  className,
  children,
}: SectionTitleProps) {
  return (
    <header
      className={[
        styles.root,
        align === "center" ? styles.center : styles.left,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {overline ? <p className={styles.overline}>{overline}</p> : null}
      <h2 className={styles.title}>{title}</h2>
      {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      {children}
    </header>
  );
}

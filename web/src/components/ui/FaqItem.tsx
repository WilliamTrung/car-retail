import type { ReactNode } from "react";
import styles from "./FaqItem.module.css";

type FaqItemProps = {
  question: string;
  children: ReactNode;
  className?: string;
};

export function FaqItem({ question, children, className }: FaqItemProps) {
  return (
    <details className={[styles.item, className].filter(Boolean).join(" ")}>
      <summary className={styles.summary}>{question}</summary>
      <div className={styles.body}>{children}</div>
    </details>
  );
}

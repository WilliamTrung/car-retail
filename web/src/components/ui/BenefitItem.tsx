import type { ReactNode } from "react";
import styles from "./BenefitItem.module.css";

type BenefitItemProps = {
  icon: ReactNode;
  title: string;
  text: string;
  className?: string;
};

export function BenefitItem({ icon, title, text, className }: BenefitItemProps) {
  return (
    <div className={[styles.item, className].filter(Boolean).join(" ")}>
      <div className={styles.icon} aria-hidden="true">
        {icon}
      </div>
      <div className={styles.copy}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.text}>{text}</p>
      </div>
    </div>
  );
}

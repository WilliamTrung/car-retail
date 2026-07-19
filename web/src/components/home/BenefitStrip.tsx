import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import styles from "./BenefitStrip.module.css";

export type BenefitItemData = {
  id: string;
  title: string;
  text: string;
  iconKey?: string | null;
};

type BenefitStripProps = {
  items: BenefitItemData[];
  /** Localized region label (not a visible heading). */
  sectionLabel: string;
};

function iconFor(key: string | null | undefined): IconName {
  const k = (key ?? "").toLowerCase();
  if (k.includes("phone") || k.includes("call")) return "phone";
  if (k.includes("clock") || k.includes("time")) return "clock";
  if (k.includes("pin") || k.includes("map") || k.includes("location")) return "pin";
  if (k.includes("zalo")) return "zalo";
  return "check";
}

function BenefitIcon({ iconKey }: { iconKey?: string | null }): ReactNode {
  return <Icon name={iconFor(iconKey)} size={28} />;
}

export function BenefitStrip({ items, sectionLabel }: BenefitStripProps) {
  if (!items.length) return null;

  return (
    <section className={styles.root} aria-label={sectionLabel}>
      {/* Single landmark label only — item titles are not headings (duplicate-headings fix). */}
      <ul className={styles.inner}>
        {items.map((item) => (
          <li key={item.id} className={styles.item}>
            <div className={styles.benefit}>
              <div className={styles.icon} aria-hidden="true">
                <BenefitIcon iconKey={item.iconKey} />
              </div>
              <div className={styles.copy}>
                <p className={styles.title}>{item.title}</p>
                <p className={styles.text}>{item.text}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

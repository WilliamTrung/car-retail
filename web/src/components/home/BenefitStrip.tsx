import type { ReactNode } from "react";
import { BenefitItem } from "@/components/ui/BenefitItem";
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

export function BenefitStrip({ items }: BenefitStripProps) {
  if (!items.length) return null;

  return (
    <section className={styles.root} aria-label="Benefits">
      <div className={styles.inner}>
        {items.map((item) => (
          <BenefitItem
            key={item.id}
            icon={<BenefitIcon iconKey={item.iconKey} />}
            title={item.title}
            text={item.text}
            className={styles.item}
          />
        ))}
      </div>
    </section>
  );
}

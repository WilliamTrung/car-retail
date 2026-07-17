import type { ModelDetailVM } from "@/lib/view-models/model-detail";
import { SpecCell } from "@/components/ui/SpecCell";
import styles from "./SpecStrip.module.css";

type SpecStripProps = {
  cells: ModelDetailVM["specStrip"];
  label?: string;
};

/** Navy band of SpecCells. Hidden when empty (§7). */
export function SpecStrip({ cells, label }: SpecStripProps) {
  if (cells.length < 1) return null;

  return (
    <section className={styles.band} aria-label={label ?? "Specs"}>
      <div className={styles.grid}>
        {cells.map((cell) => (
          <SpecCell
            key={cell.key}
            label={cell.label}
            display={cell.display}
            className={styles.cell}
          />
        ))}
      </div>
    </section>
  );
}

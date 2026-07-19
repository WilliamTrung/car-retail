import type { ModelDetailVM } from "@/lib/view-models/model-detail";
import styles from "./SpecStrip.module.css";

type SpecStripProps = {
  cells: ModelDetailVM["specStrip"];
  label?: string;
};

/**
 * Structured 7-field navy/ink spec table (Range/Seats/Torque/…).
 * Bound to `toModelDetailVM.specStrip` (≤7). Replaces image-style strips.
 */
export function SpecStrip({ cells, label }: SpecStripProps) {
  const rows = cells.slice(0, 7);
  if (rows.length < 1) return null;

  return (
    <section className={styles.band} aria-labelledby="model-spec-heading">
      <h2 id="model-spec-heading" className={styles.srOnly}>
        {label ?? "Specs"}
      </h2>
      <dl className={styles.table}>
        {rows.map((cell) => (
          <div key={cell.key} className={styles.cell}>
            <dt className={styles.label}>{cell.label}</dt>
            <dd className={styles.value}>{cell.display}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

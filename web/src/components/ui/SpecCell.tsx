import type { Locale, UnitsMap, VehicleAttribute } from "@/lib/view-models/common";
import { composeAttributeDisplay } from "@/lib/view-models/common";
import styles from "./SpecCell.module.css";

type SpecCellProps = {
  /** Pre-composed (from ModelDetailVM.specStrip). */
  label?: string;
  display?: string;
  /** Or compose from raw attribute + units + t. */
  attribute?: VehicleAttribute;
  units?: UnitsMap;
  locale?: Locale;
  t?: (key: string) => string;
  className?: string;
};

export function SpecCell({
  label: labelProp,
  display: displayProp,
  attribute,
  units,
  locale = "vi",
  t = (key) => key,
  className,
}: SpecCellProps) {
  let label = labelProp ?? "";
  let display = displayProp ?? "";

  if (attribute && units) {
    const composed = composeAttributeDisplay(attribute, units, locale, t);
    label = composed.label;
    display = composed.display;
  }

  return (
    <div className={[styles.cell, className].filter(Boolean).join(" ")}>
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value}>{display}</dd>
    </div>
  );
}

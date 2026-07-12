import styles from "./LocaleFields.module.css";

/** @param {{ prefix: string, vi?: string, en?: string, multiline?: boolean, label?: string }} props */
export default function LocaleFields({ prefix, vi = "", en = "", multiline = false, label }) {
  const missing = vi.trim() && !en.trim();
  const Input = multiline ? "textarea" : "input";

  return (
    <fieldset className={styles.wrap}>
      {label ? <legend>{label}</legend> : null}
      <label className={styles.label}>
        VN
        <Input className={styles.field} name={`${prefix}Vi`} defaultValue={vi} rows={multiline ? 4 : undefined} />
      </label>
      <label className={styles.label}>
        EN {missing ? <span className={styles.missing}>missing EN</span> : null}
        <Input className={styles.field} name={`${prefix}En`} defaultValue={en} rows={multiline ? 4 : undefined} />
      </label>
    </fieldset>
  );
}

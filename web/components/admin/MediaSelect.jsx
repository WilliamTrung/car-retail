import styles from "./MediaSelect.module.css";

/**
 * @param {{
 *   name: string,
 *   label: string,
 *   value?: string | null,
 *   assets: { id: string, r2Key: string, publicUrl: string, folder: string }[],
 *   folder?: string,
 * }} props
 */
export default function MediaSelect({ name, label, value, assets, folder }) {
  const filtered = folder ? assets.filter((a) => a.folder === folder) : assets;
  const selected = filtered.find((a) => a.id === value);

  return (
    <label className={styles.wrap}>
      {label}
      <select name={name} defaultValue={value ?? ""}>
        <option value="">— None —</option>
        {filtered.map((asset) => (
          <option key={asset.id} value={asset.id}>
            {asset.r2Key}
          </option>
        ))}
      </select>
      {selected ? (
        <a href={selected.publicUrl} target="_blank" rel="noreferrer" className={styles.preview}>
          Preview
        </a>
      ) : null}
    </label>
  );
}

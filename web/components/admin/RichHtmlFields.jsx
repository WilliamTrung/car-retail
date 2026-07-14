import localeStyles from "./LocaleFields.module.css";
import RichHtmlField from "./RichHtmlField";

/**
 * Bilingual HTML editor (visual + source) for marketing descriptions.
 * @param {{ prefix: string, label?: string, vi?: string, en?: string }} props
 */
export default function RichHtmlFields({ prefix, label, vi = "", en = "" }) {
  const missing = vi.trim() && !en.trim();

  return (
    <fieldset className={localeStyles.wrap}>
      {label ? <legend>{label}</legend> : null}
      <RichHtmlField name={`${prefix}Vi`} label="VN" defaultValue={vi} />
      <div>
        <RichHtmlField name={`${prefix}En`} label="EN" defaultValue={en} />
        {missing ? <span className={localeStyles.missing}>thiếu EN</span> : null}
      </div>
    </fieldset>
  );
}

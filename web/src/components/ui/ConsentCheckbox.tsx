import { Link } from "@/lib/i18n/navigation";
import styles from "./ConsentCheckbox.module.css";

type ConsentCheckboxProps = {
  id?: string;
  name?: string;
  checked?: boolean;
  invalid?: boolean;
  error?: string | null;
  onChange?: (checked: boolean) => void;
  labelBefore?: string;
  privacyLabel?: string;
  labelAfter?: string;
  className?: string;
};

export function ConsentCheckbox({
  id = "consent",
  name = "consent",
  checked,
  invalid = false,
  error,
  onChange,
  labelBefore = "Tôi đồng ý với ",
  privacyLabel = "Chính sách bảo mật",
  labelAfter = " và cho phép liên hệ tư vấn.",
  className,
}: ConsentCheckboxProps) {
  const errorId = `${id}-error`;
  const isInvalid = invalid || Boolean(error);

  return (
    <div
      className={[styles.root, isInvalid && styles.invalid, className]
        .filter(Boolean)
        .join(" ")}
    >
      <label className={styles.label} htmlFor={id}>
        <input
          id={id}
          name={name}
          type="checkbox"
          className={styles.input}
          checked={checked}
          aria-invalid={isInvalid || undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={
            onChange ? (e) => onChange(e.currentTarget.checked) : undefined
          }
          required
          value="true"
        />
        <span className={styles.text}>
          {labelBefore}
          <Link href="/policies" className={styles.link}>
            {privacyLabel}
          </Link>
          {labelAfter}
        </span>
      </label>
      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

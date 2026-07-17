import type { ReactNode } from "react";
import styles from "./FormField.module.css";

type FormFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  error?: string | null;
  children: ReactNode;
  className?: string;
  hint?: string;
};

export function FormField({
  id,
  label,
  required = false,
  error,
  children,
  className,
  hint,
}: FormFieldProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [
    error ? errorId : null,
    hint && !error ? hintId : null,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      <label className={styles.label} htmlFor={id}>
        {label}
        {required ? (
          <span className={styles.required} aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      <div
        className={styles.control}
        data-invalid={error ? "true" : undefined}
        // Consumers should set aria-describedby / aria-invalid on the control;
        // we expose ids via data attributes for composition.
        data-describedby={describedBy}
      >
        {children}
      </div>
      {hint && !error ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Helper props for the slotted control (input/select/textarea). */
export function formControlA11y(
  id: string,
  error?: string | null,
): {
  id: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
} {
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
  };
}

import type { SelectHTMLAttributes } from "react";
import { formControlA11y } from "@/components/ui/FormField";
import styles from "./AdminSelect.module.css";

export type AdminSelectProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "id"
> & {
  id: string;
  error?: string | null;
};

/** Token-styled select meant to be slotted inside `FormField`. */
export function AdminSelect({
  id,
  error,
  className,
  children,
  ...rest
}: AdminSelectProps) {
  return (
    <select
      className={[styles.control, className].filter(Boolean).join(" ")}
      {...formControlA11y(id, error)}
      {...rest}
    >
      {children}
    </select>
  );
}

import type { TextareaHTMLAttributes } from "react";
import { formControlA11y } from "@/components/ui/FormField";
import styles from "./AdminTextarea.module.css";

export type AdminTextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "id"
> & {
  id: string;
  error?: string | null;
};

/** Token-styled textarea meant to be slotted inside `FormField`. */
export function AdminTextarea({
  id,
  error,
  className,
  rows = 4,
  ...rest
}: AdminTextareaProps) {
  return (
    <textarea
      className={[styles.control, className].filter(Boolean).join(" ")}
      rows={rows}
      {...formControlA11y(id, error)}
      {...rest}
    />
  );
}

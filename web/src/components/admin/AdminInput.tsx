import type { InputHTMLAttributes } from "react";
import { formControlA11y } from "@/components/ui/FormField";
import styles from "./AdminInput.module.css";

export type AdminInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "id"
> & {
  id: string;
  error?: string | null;
};

/** Token-styled input meant to be slotted inside `FormField`. */
export function AdminInput({ id, error, className, ...rest }: AdminInputProps) {
  return (
    <input
      className={[styles.control, className].filter(Boolean).join(" ")}
      {...formControlA11y(id, error)}
      {...rest}
    />
  );
}

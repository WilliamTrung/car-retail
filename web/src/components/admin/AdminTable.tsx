import { Children, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import styles from "./AdminTable.module.css";

type Props = {
  headers: ReactNode[];
  /** `<tr>` rows; row actions go in a trailing cell per row. */
  children?: ReactNode;
  emptyMessage?: string;
  className?: string;
};

/** Token-styled data table with a built-in empty-state row. */
export function AdminTable({ headers, children, emptyMessage, className }: Props) {
  const t = useTranslations("admin.common");
  const hasRows = Children.count(children) > 0;

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(" ")}>
      <table className={styles.table}>
        <thead>
          <tr>
            {headers.map((header, i) => (
              <th key={i} scope="col">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hasRows ? (
            children
          ) : (
            <tr>
              <td className={styles.empty} colSpan={headers.length}>
                {emptyMessage ?? t("empty")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "outline" | "dark-outline" | "ghost" | "zalo";
type Size = "md" | "lg";

type Shared = {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
  className?: string;
};

type AsButton = Shared &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> & {
    href?: undefined;
  };

type AsLink = Shared &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className"> & {
    href: string;
  };

export type ButtonProps = AsButton | AsLink;

function cx(...parts: Array<string | false | undefined | null>) {
  return parts.filter(Boolean).join(" ");
}

export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    loading = false,
    children,
    className,
    ...rest
  } = props;

  const classNames = cx(
    styles.btn,
    styles[variant],
    styles[size],
    loading && styles.loading,
    className,
  );

  if ("href" in props && props.href) {
    const { href, ...anchorRest } = rest as AsLink;
    return (
      <a
        href={href}
        className={classNames}
        aria-busy={loading || undefined}
        {...anchorRest}
      >
        {loading ? <span className={styles.spinner} aria-hidden /> : null}
        <span className={styles.label}>{children}</span>
      </a>
    );
  }

  const buttonRest = rest as AsButton;
  return (
    <button
      type={buttonRest.type ?? "button"}
      className={classNames}
      disabled={buttonRest.disabled || loading}
      aria-busy={loading || undefined}
      {...buttonRest}
    >
      {loading ? <span className={styles.spinner} aria-hidden /> : null}
      <span className={styles.label}>{children}</span>
    </button>
  );
}

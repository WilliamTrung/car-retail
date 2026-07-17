import type { ReactNode, SVGProps } from "react";
import styles from "./Icon.module.css";

export type IconName =
  | "phone"
  | "zalo"
  | "arrow"
  | "check"
  | "pin"
  | "clock"
  | "menu"
  | "close"
  | "chevron"
  | "facebook"
  | "youtube"
  | "tiktok"
  | "instagram";

const PATHS: Record<IconName, ReactNode> = {
  phone: (
    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V21c0 .6-.4 1-1 1C10.6 22 2 13.4 2 2.7c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8z" />
  ),
  zalo: (
    <>
      <path d="M12 2C6.5 2 2 6.1 2 11.2c0 2.9 1.5 5.5 3.8 7.2V22l3.5-1.9c.9.2 1.8.4 2.7.4 5.5 0 10-4.1 10-9.3S17.5 2 12 2z" />
      <path
        d="M7.5 9.5h9M7.5 12.5h6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </>
  ),
  arrow: (
    <path d="M5 12h12M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  ),
  check: (
    <path d="M5 12l5 5L19 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  ),
  pin: (
    <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12zm0-9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
  ),
  clock: (
    <path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zm1-10.4V7h-2v6l4.5 2.7 1-1.7L13 11.6z" />
  ),
  menu: (
    <path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  ),
  close: (
    <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  ),
  chevron: (
    <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  ),
  facebook: (
    <path d="M14 8h2.5V5.5H14c-2 0-3.5 1.6-3.5 3.5V11H8v2.5h2.5V21H14v-7.5h2.3L17 11h-3V9c0-.6.4-1 1-1z" />
  ),
  youtube: (
    <path d="M22 12.2c0-2.3-.3-3.9-.7-4.7-.4-.8-1.2-1.3-2.1-1.5C17.5 5.5 12 5.5 12 5.5s-5.5 0-7.2.5c-.9.2-1.7.7-2.1 1.5-.4.8-.7 2.4-.7 4.7s.3 3.9.7 4.7c.4.8 1.2 1.3 2.1 1.5 1.7.5 7.2.5 7.2.5s5.5 0 7.2-.5c.9-.2 1.7-.7 2.1-1.5.4-.8.7-2.4.7-4.7zM10 15.5v-6.6l5.5 3.3-5.5 3.3z" />
  ),
  tiktok: (
    <path d="M16.5 4c.6 1.8 1.9 3.2 3.5 3.8v2.4c-1.5-.1-2.9-.6-4.1-1.5v6.2a5.5 5.5 0 1 1-5.5-5.5c.3 0 .6 0 .9.1v2.6a2.9 2.9 0 1 0 2 2.8V4h3.2z" />
  ),
  instagram: (
    <path d="M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2zm0 7.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2zM17.8 6.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0zM12 3.5c-2.3 0-2.6 0-3.5.1-2.4.1-3.9 1.6-4 4-.1.9-.1 1.2-.1 3.5s0 2.6.1 3.5c.1 2.4 1.6 3.9 4 4 .9.1 1.2.1 3.5.1s2.6 0 3.5-.1c2.4-.1 3.9-1.6 4-4 .1-.9.1-1.2.1-3.5s0-2.6-.1-3.5c-.1-2.4-1.6-3.9-4-4-.9-.1-1.2-.1-3.5-.1zm0 1.5c2.2 0 2.5 0 3.4.1 1.8.1 2.9 1.2 3 3 .1.9.1 1.1.1 3.3s0 2.4-.1 3.3c-.1 1.8-1.2 2.9-3 3-.9.1-1.1.1-3.4.1s-2.5 0-3.4-.1c-1.8-.1-2.9-1.2-3-3-.1-.9-.1-1.1-.1-3.3s0-2.4.1-3.3c.1-1.8 1.2-2.9 3-3 .9-.1 1.2-.1 3.4-.1z" />
  ),
};

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
  size?: number;
};

export function Icon({ name, size = 20, className, ...rest }: IconProps) {
  return (
    <svg
      className={[styles.icon, className].filter(Boolean).join(" ")}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}

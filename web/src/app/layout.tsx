import type { ReactNode } from "react";

/** Passthrough root — locale layouts own `<html>` / `<body>`. */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}

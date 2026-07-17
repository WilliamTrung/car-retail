import type { ReactNode } from "react";

/** Minimal admin shell — UI polish is out of scope (frontend techlead). */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

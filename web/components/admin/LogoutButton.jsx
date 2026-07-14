"use client";

import { a } from "@/lib/admin/strings";

export default function LogoutButton() {
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/admin/auth/logout", { method: "POST" });
        window.location.href = "/admin/login";
      }}
    >
      {a.logout}
    </button>
  );
}

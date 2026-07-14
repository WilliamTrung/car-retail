"use client";

import { useState } from "react";
import { a } from "@/lib/admin/strings";

/** @param {{ action: string, label?: string, confirmMessage?: string }} props */
export default function DeleteButton({
  action,
  label = a.delete,
  confirmMessage = a.confirmDelete,
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!confirm(confirmMessage)) return;
    setLoading(true);
    try {
      const res = await fetch(action, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || a.deleteFailed);
        return;
      }
      window.location.reload();
    } catch {
      alert(a.networkError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" onClick={handleClick} disabled={loading} style={{ fontSize: "0.8125rem" }}>
      {loading ? "…" : label}
    </button>
  );
}

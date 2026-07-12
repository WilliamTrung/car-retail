"use client";

import { useState } from "react";

/** @param {{ action: string, label?: string, confirmMessage?: string }} props */
export default function DeleteButton({
  action,
  label = "Delete",
  confirmMessage = "Delete this item?",
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!confirm(confirmMessage)) return;
    setLoading(true);
    try {
      const res = await fetch(action, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Delete failed");
        return;
      }
      window.location.reload();
    } catch {
      alert("Network error");
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

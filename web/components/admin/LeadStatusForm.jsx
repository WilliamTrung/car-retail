"use client";

import { useState } from "react";
import { a } from "@/lib/admin/strings";

/** @param {{ leadId: string, status: string, notes: string }} props */
export default function LeadStatusForm({ leadId, status, notes }) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    await fetch(`/api/admin/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(fd.entries())),
    });
    window.location.reload();
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      <select name="status" defaultValue={status}>
        <option value="NEW">Mới</option>
        <option value="CONTACTED">Đã liên hệ</option>
        <option value="CLOSED">Đã đóng</option>
      </select>
      <input name="notes" type="text" defaultValue={notes} placeholder="Ghi chú" />
      <button type="submit" disabled={loading} style={{ fontSize: "0.75rem" }}>
        {loading ? "…" : a.update}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";

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
        <option value="NEW">NEW</option>
        <option value="CONTACTED">CONTACTED</option>
        <option value="CLOSED">CLOSED</option>
      </select>
      <input name="notes" type="text" defaultValue={notes} placeholder="Notes" />
      <button type="submit" disabled={loading} style={{ fontSize: "0.75rem" }}>
        Update
      </button>
    </form>
  );
}

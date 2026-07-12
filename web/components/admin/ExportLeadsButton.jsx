"use client";

export default function ExportLeadsButton() {
  return (
    <button type="button" onClick={() => { window.location.href = "/api/admin/leads/export"; }}>
      Export CSV
    </button>
  );
}

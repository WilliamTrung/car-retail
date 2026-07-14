"use client";

import { a } from "@/lib/admin/strings";

export default function ExportLeadsButton() {
  return (
    <button type="button" onClick={() => { window.location.href = "/api/admin/leads/export"; }}>
      {a.exportCsv}
    </button>
  );
}

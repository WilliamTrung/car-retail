"use client";

import { useState } from "react";
import { a } from "@/lib/admin/strings";

/** @param {{ modelId: string, templates: { id: string, key: string, label: string }[] }} props */
export default function ApplyTemplateButton({ modelId, templates }) {
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const [loading, setLoading] = useState(false);

  async function handleApply() {
    if (!templateId) return;
    if (!confirm("Thay thế thông số xe bằng mẫu đã chọn?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/models/${modelId}/apply-template`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "Áp dụng thất bại");
        return;
      }
      window.location.reload();
    } catch {
      alert(a.networkError);
    } finally {
      setLoading(false);
    }
  }

  if (!templates.length) return null;

  return (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
      <select value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
        {templates.map((t) => (
          <option key={t.id} value={t.id}>
            {t.key} — {t.label}
          </option>
        ))}
      </select>
      <button type="button" onClick={handleApply} disabled={loading}>
        {loading ? "Đang áp dụng…" : "Áp dụng mẫu"}
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import styles from "./AdminForm.module.css";

/** @param {{ action: string, method?: string, children: React.ReactNode, successMessage?: string }} props */
export default function AdminForm({ action, method = "POST", children, successMessage = "Saved." }) {
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setOk("");
    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const body = Object.fromEntries(fd.entries());

    try {
      const res = await fetch(action, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Save failed");
        return;
      }
      setOk(successMessage);
      if (data.redirect) window.location.href = data.redirect;
      else window.location.reload();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {children}
      {error ? <p className={styles.error}>{error}</p> : null}
      {ok ? <p className={styles.ok}>{ok}</p> : null}
      <button type="submit" disabled={loading}>
        {loading ? "Saving…" : "Save"}
      </button>
    </form>
  );
}

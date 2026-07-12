"use client";

import { useState } from "react";
import styles from "./MediaUpload.module.css";

export default function MediaUpload() {
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setOk("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/admin/media", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed");
        return;
      }
      setOk(`Uploaded: ${data.id}`);
      window.location.reload();
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label>
        Folder
        <select name="folder" defaultValue="SITE">
          <option value="SITE">SITE</option>
          <option value="HEROES">HEROES</option>
          <option value="VEHICLES">VEHICLES</option>
          <option value="NEWS">NEWS</option>
          <option value="POLICIES">POLICIES</option>
        </select>
      </label>
      <label>
        File
        <input name="file" type="file" required accept="image/*,application/pdf" />
      </label>
      <label>
        Alt VI
        <input name="altVi" type="text" />
      </label>
      <label>
        Alt EN
        <input name="altEn" type="text" />
      </label>
      {error ? <p className={styles.error}>{error}</p> : null}
      {ok ? <p className={styles.ok}>{ok}</p> : null}
      <button type="submit" disabled={loading}>
        {loading ? "Uploading…" : "Upload to R2"}
      </button>
    </form>
  );
}

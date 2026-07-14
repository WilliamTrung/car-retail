"use client";

import { useState } from "react";
import { a } from "@/lib/admin/strings";
import styles from "./MediaUpload.module.css";

const FOLDERS = ["SITE", "HEROES", "VEHICLES", "NEWS", "POLICIES"];

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
        setError(data.error || a.uploadFailed);
        return;
      }
      setOk(`${a.uploadSuccess}: ${data.id}`);
      window.location.reload();
    } catch {
      setError(a.networkError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label>
        {a.media.folder}
        <select name="folder" defaultValue="SITE">
          {FOLDERS.map((folder) => (
            <option key={folder} value={folder}>
              {a.folders[folder] || folder}
            </option>
          ))}
        </select>
      </label>
      <label>
        {a.media.file}
        <input name="file" type="file" required accept="image/*,application/pdf" />
      </label>
      <label>
        {a.media.altVi}
        <input name="altVi" type="text" />
      </label>
      <label>
        {a.media.altEn}
        <input name="altEn" type="text" />
      </label>
      {error ? <p className={styles.error}>{error}</p> : null}
      {ok ? <p className={styles.ok}>{ok}</p> : null}
      <button type="submit" disabled={loading}>
        {loading ? a.uploading : a.media.uploadR2}
      </button>
    </form>
  );
}

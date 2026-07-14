"use client";

import { useRef, useState } from "react";
import { a } from "@/lib/admin/strings";
import styles from "./MediaSelect.module.css";

/**
 * Media select with inline upload (R2).
 * @param {{
 *   name: string,
 *   label: string,
 *   value?: string | null,
 *   assets: { id: string, r2Key: string, publicUrl: string, folder: string }[],
 *   folder: string,
 *   accept?: string,
 * }} props
 */
export default function MediaPicker({
  name,
  label,
  value,
  assets: initialAssets,
  folder,
  accept = "image/*,application/pdf",
}) {
  const fileRef = useRef(null);
  const [assets, setAssets] = useState(initialAssets);
  const [selectedId, setSelectedId] = useState(value ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadOk, setUploadOk] = useState("");

  const filtered = assets.filter((item) => item.folder === folder);
  const selected = filtered.find((item) => item.id === selectedId);

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");
    setUploadOk("");

    const fd = new FormData();
    fd.append("folder", folder);
    fd.append("file", file);
    fd.append("altVi", "");
    fd.append("altEn", "");

    try {
      const res = await fetch("/api/admin/media", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || a.uploadFailed);
        return;
      }
      setAssets((prev) => [data, ...prev]);
      setSelectedId(data.id);
      setUploadOk(a.uploadSuccess);
    } catch {
      setUploadError(a.networkError);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className={styles.wrap}>
      <span className={styles.labelText}>{label}</span>
      <select name={name} value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
        <option value="">{a.none}</option>
        {filtered.map((asset) => (
          <option key={asset.id} value={asset.id}>
            {asset.r2Key}
          </option>
        ))}
      </select>

      <div className={styles.uploadRow}>
        <input
          ref={fileRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={uploading}
          className={styles.fileInput}
        />
        {uploading ? <span className={styles.uploadHint}>{a.uploading}</span> : null}
        {uploadOk ? <span className={styles.uploadOk}>{uploadOk}</span> : null}
        {uploadError ? <span className={styles.uploadError}>{uploadError}</span> : null}
      </div>

      {selected ? (
        <a href={selected.publicUrl} target="_blank" rel="noreferrer" className={styles.preview}>
          {a.preview}
        </a>
      ) : null}
    </div>
  );
}

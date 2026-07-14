"use client";

import { useRef, useState } from "react";
import { a } from "@/lib/admin/strings";
import styles from "./MediaSelect.module.css";

/**
 * Ordered list of media asset IDs (model gallery).
 * @param {{
 *   name?: string,
 *   value?: string[],
 *   assets: { id: string, r2Key: string, publicUrl: string, folder: string }[],
 *   folder: string,
 * }} props
 */
export default function GalleryPicker({
  name = "gallery",
  value = [],
  assets: initialAssets,
  folder,
}) {
  const fileRef = useRef(null);
  const [assets, setAssets] = useState(initialAssets);
  const [ids, setIds] = useState(() => (Array.isArray(value) ? value.filter(Boolean) : []));
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadTarget, setUploadTarget] = useState(-1);

  const filtered = assets.filter((item) => item.folder === folder);

  async function uploadFile(file, targetIndex) {
    setUploading(true);
    setUploadError("");
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
      setIds((prev) => {
        const next = [...prev];
        if (targetIndex >= 0 && targetIndex < next.length) next[targetIndex] = data.id;
        else next.push(data.id);
        return next;
      });
    } catch {
      setUploadError(a.networkError);
    } finally {
      setUploading(false);
      setUploadTarget(-1);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFile(file, uploadTarget);
  }

  function triggerUpload(index) {
    setUploadTarget(index);
    fileRef.current?.click();
  }

  function setAt(index, id) {
    setIds((prev) => {
      const next = [...prev];
      next[index] = id;
      return next;
    });
  }

  function removeAt(index) {
    setIds((prev) => prev.filter((_, i) => i !== index));
  }

  function moveUp(index) {
    if (index <= 0) return;
    setIds((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }

  return (
    <fieldset className={styles.wrap}>
      <legend>Thư viện ảnh</legend>
      <input type="hidden" name={name} value={JSON.stringify(ids.filter(Boolean))} readOnly />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className={styles.fileInput}
        style={{ display: "none" }}
        onChange={handleFileChange}
        disabled={uploading}
      />

      {ids.length === 0 ? (
        <p className={styles.uploadHint}>Chưa có ảnh. Thêm ảnh đầu tiên bên dưới.</p>
      ) : null}

      {ids.map((id, index) => {
        const selected = filtered.find((item) => item.id === id);
        return (
          <div key={`${index}-${id}`} className={styles.galleryRow}>
            <select value={id} onChange={(e) => setAt(index, e.target.value)}>
              <option value="">{a.none}</option>
              {filtered.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.r2Key}
                </option>
              ))}
            </select>
            <button type="button" onClick={() => triggerUpload(index)} disabled={uploading}>
              {uploading && uploadTarget === index ? a.uploading : a.upload}
            </button>
            <button type="button" onClick={() => moveUp(index)} disabled={index === 0} aria-label="Lên">
              ↑
            </button>
            <button type="button" onClick={() => removeAt(index)} aria-label="Xóa">
              ×
            </button>
            {selected ? (
              <a href={selected.publicUrl} target="_blank" rel="noreferrer" className={styles.preview}>
                {a.preview}
              </a>
            ) : null}
          </div>
        );
      })}

      <div className={styles.uploadRow}>
        <button
          type="button"
          onClick={() => {
            setIds((prev) => [...prev, ""]);
          }}
        >
          + Thêm ảnh
        </button>
        <button type="button" onClick={() => triggerUpload(ids.length)} disabled={uploading}>
          {uploading && uploadTarget === ids.length ? a.uploading : "Tải ảnh mới"}
        </button>
      </div>

      {uploadError ? <span className={styles.uploadError}>{uploadError}</span> : null}
    </fieldset>
  );
}

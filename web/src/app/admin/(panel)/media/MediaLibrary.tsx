"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { ConfirmDelete } from "@/components/admin";
import type {
  MediaAssetDto,
  MediaFolderDto,
} from "@/server/modules/media";
import { deleteMediaAction, uploadMediaAction } from "./actions";
import styles from "./page.module.css";

const FOLDERS: MediaFolderDto[] = [
  "VEHICLES",
  "HEROES",
  "NEWS",
  "POLICIES",
  "SITE",
];

type Props = {
  initialAssets: MediaAssetDto[];
};

export function MediaLibrary({ initialAssets }: Props) {
  const t = useTranslations("admin.media");
  const [assets, setAssets] = useState(initialAssets);
  const [folder, setFolder] = useState<MediaFolderDto>("VEHICLES");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const vi = String(data.get("altVi") ?? "").trim();
    const en = String(data.get("altEn") ?? "").trim();
    data.delete("altVi");
    data.delete("altEn");
    if (vi || en) data.set("altText", JSON.stringify({ vi, en }));

    setPending(true);
    setMessage(null);
    const result = await uploadMediaAction(data);
    setPending(false);
    if (!result.ok) {
      setMessage(
        result.error.code === "R2_NOT_CONFIGURED"
          ? t("r2NotConfigured")
          : result.error.message,
      );
      return;
    }

    setAssets((current) => [result.data, ...current]);
    setFolder(result.data.folder);
    setMessage(t("uploadSuccess"));
    form.reset();
  }

  async function remove(id: string) {
    setMessage(null);
    const result = await deleteMediaAction(id);
    if (result.ok) {
      setAssets((current) => current.filter((asset) => asset.id !== id));
      setMessage(t("deleteSuccess"));
    } else {
      setMessage(result.error.message);
    }
  }

  const visible = assets.filter((asset) => asset.folder === folder);

  return (
    <div className={styles.layout}>
      <form className={styles.uploadPanel} onSubmit={upload}>
        <h2>{t("uploadPanel")}</h2>
        <label>
          {t("file")}
          <input name="file" type="file" required />
        </label>
        <label>
          {t("folder")}
          <select name="folder" defaultValue={folder} required>
            {FOLDERS.map((item) => (
              <option key={item} value={item}>
                {t(`folders.${item}`)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("filename")}
          <input name="filename" type="text" />
        </label>
        <div className={styles.altFields}>
          <label>
            {t("altVi")}
            <input name="altVi" type="text" />
          </label>
          <label>
            {t("altEn")}
            <input name="altEn" type="text" />
          </label>
        </div>
        <button type="submit" disabled={pending}>
          {pending ? t("uploading") : t("upload")}
        </button>
        {message && (
          <p className={styles.message} role="status">
            {message}
          </p>
        )}
      </form>

      <section className={styles.library} aria-labelledby="media-grid-title">
        <h2 id="media-grid-title">{t("library")}</h2>
        <div className={styles.folders} aria-label={t("filterByFolder")}>
          {FOLDERS.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={folder === item}
              onClick={() => setFolder(item)}
            >
              {t(`folders.${item}`)} (
              {assets.filter((asset) => asset.folder === item).length})
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <p className={styles.empty}>{t("emptyFolder")}</p>
        ) : (
          <div className={styles.grid}>
            {visible.map((asset) => (
              <article key={asset.id} className={styles.card}>
                {asset.mimeType?.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element -- admin URLs are user-configured R2 hosts
                  <img
                    src={asset.publicUrl}
                    alt={asset.altText?.vi || asset.altText?.en || ""}
                  />
                ) : (
                  <a href={asset.publicUrl} target="_blank" rel="noreferrer">
                    {asset.r2Key.split("/").pop()}
                  </a>
                )}
                <div className={styles.meta}>
                  <strong>{asset.r2Key.split("/").pop()}</strong>
                  <span>{asset.mimeType ?? t("unknownType")}</span>
                  <span>
                    {t("altSummary", {
                      vi: asset.altText?.vi || "—",
                      en: asset.altText?.en || "—",
                    })}
                  </span>
                  <ConfirmDelete
                    onConfirm={() => remove(asset.id)}
                    message={t("confirmDelete")}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

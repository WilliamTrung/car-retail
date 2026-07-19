"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import {
  listMediaAction,
  uploadMediaAction,
  type MediaAssetDto,
  type MediaFolderDto,
} from "@/app/admin/(panel)/media/actions";
import { AdminModal } from "./AdminModal";
import styles from "./MediaPicker.module.css";

export type MediaPickerSelection = {
  mediaId: string;
  publicUrl: string;
};

type BaseProps = {
  folder: MediaFolderDto;
  label?: string;
  disabled?: boolean;
};

type SingleProps = BaseProps & {
  multiple?: false;
  value?: MediaPickerSelection | null;
  onChange: (value: MediaPickerSelection | null) => void;
};

type MultiProps = BaseProps & {
  multiple: true;
  value?: MediaPickerSelection[];
  onChange: (value: MediaPickerSelection[]) => void;
};

export type MediaPickerProps = SingleProps | MultiProps;

/** Must stay ≤ next.config experimental.serverActions.bodySizeLimit. */
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const toSelection = (asset: MediaAssetDto): MediaPickerSelection => ({
  mediaId: asset.id,
  publicUrl: asset.publicUrl,
});

export function MediaPicker(props: MediaPickerProps) {
  const t = useTranslations("admin.media");
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<MediaAssetDto[]>([]);
  const [selected, setSelected] = useState<MediaPickerSelection[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setMessage(null);
    void listMediaAction(props.folder).then((result) => {
      setLoading(false);
      if (result.ok) setAssets(result.data);
      else setMessage(t("loadError"));
    });
  }, [open, props.folder, t]);

  function openPicker() {
    setSelected(
      props.multiple
        ? (props.value ?? [])
        : props.value
          ? [props.value]
          : [],
    );
    setOpen(true);
  }

  function choose(asset: MediaAssetDto) {
    const item = toSelection(asset);
    if (!props.multiple) {
      props.onChange(item);
      setOpen(false);
      return;
    }
    setSelected((current) =>
      current.some(({ mediaId }) => mediaId === asset.id)
        ? current.filter(({ mediaId }) => mediaId !== asset.id)
        : [...current, item],
    );
  }

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get("file");
    if (file instanceof File && file.size > MAX_UPLOAD_BYTES) {
      setMessage(t("fileTooLarge"));
      return;
    }
    setUploading(true);
    setMessage(null);
    const result = await uploadMediaAction(data);
    setUploading(false);
    if (!result.ok) {
      setMessage(
        result.error.code === "R2_NOT_CONFIGURED"
          ? t("r2NotConfigured")
          : result.error.message,
      );
      return;
    }

    setAssets((current) => [result.data, ...current]);
    choose(result.data);
    form.reset();
  }

  const current = props.multiple
    ? (props.value ?? [])
    : props.value
      ? [props.value]
      : [];

  return (
    <div className={styles.picker}>
      <button
        type="button"
        disabled={props.disabled}
        onClick={openPicker}
      >
        {props.label ?? t("chooseMedia")}
      </button>
      {current.length > 0 && (
        <div className={styles.current}>
          {current.map((item) => (
            item.publicUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- admin URLs are user-configured R2 hosts
              <img key={item.mediaId} src={item.publicUrl} alt="" />
            ) : (
              <code key={item.mediaId}>{item.mediaId}</code>
            )
          ))}
        </div>
      )}

      <AdminModal
        open={open}
        onClose={() => setOpen(false)}
        title={t("pickerTitle")}
      >
        <form className={styles.upload} onSubmit={upload}>
          <input type="hidden" name="folder" value={props.folder} />
          <label>
            {t("file")}
            <input name="file" type="file" required />
          </label>
          <button type="submit" disabled={uploading}>
            {uploading ? t("uploading") : t("upload")}
          </button>
        </form>

        {message && (
          <p className={styles.message} role="alert">
            {message}
          </p>
        )}
        {loading ? (
          <p>{t("loading")}</p>
        ) : assets.length === 0 ? (
          <p>{t("emptyFolder")}</p>
        ) : (
          <div className={styles.grid}>
            {assets.map((asset) => {
              const checked = selected.some(
                ({ mediaId }) => mediaId === asset.id,
              );
              return (
                <button
                  key={asset.id}
                  type="button"
                  className={checked ? styles.selected : undefined}
                  aria-pressed={checked}
                  onClick={() => choose(asset)}
                >
                  {asset.mimeType?.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element -- admin URLs are user-configured R2 hosts
                    <img
                      src={asset.publicUrl}
                      alt={asset.altText?.vi || asset.altText?.en || ""}
                    />
                  ) : (
                    <span>{asset.r2Key.split("/").pop()}</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className={styles.actions}>
          <button type="button" onClick={() => setOpen(false)}>
            {t("cancel")}
          </button>
          {props.multiple && (
            <button
              type="button"
              onClick={() => {
                props.onChange(selected);
                setOpen(false);
              }}
            >
              {t("selectCount", { count: selected.length })}
            </button>
          )}
        </div>
      </AdminModal>
    </div>
  );
}

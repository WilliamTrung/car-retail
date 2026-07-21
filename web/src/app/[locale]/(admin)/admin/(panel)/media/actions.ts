"use server";

import { guardAdmin } from "@/app/[locale]/(admin)/admin/(panel)/_lib/guard";
import {
  mediaService,
  UploadMediaInputSchema,
  type MediaAssetDto,
  type MediaFolderDto,
  type UploadMediaInput,
} from "@/server/modules/media";
import { err, ok, type Result } from "@/server/result";

/**
 * Upload via FormData:
 * - `file` (File, required)
 * - `folder` (MediaFolder, required)
 * - `filename` (optional; defaults to file.name)
 * - `mimeType` (optional; file.type / form field — service derives from
 *   extension/magic bytes when missing or unusable; never octet-stream)
 * - `altText` (optional JSON `{vi,en}` string, or omitted)
 */
export async function uploadMediaAction(
  formData: FormData,
): Promise<Result<MediaAssetDto>> {
  const gate = await guardAdmin("media");
  if (!gate.ok) return gate;

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return err({
      code: "VALIDATION_ERROR",
      message: "file is required",
    });
  }

  let altText: unknown;
  const altRaw = formData.get("altText");
  if (typeof altRaw === "string" && altRaw.trim()) {
    try {
      altText = JSON.parse(altRaw);
    } catch {
      return err({
        code: "VALIDATION_ERROR",
        message: "altText must be JSON { vi, en }",
      });
    }
  }

  const meta = {
    folder: formData.get("folder"),
    filename:
      (typeof formData.get("filename") === "string" &&
        String(formData.get("filename"))) ||
      file.name,
    mimeType:
      (typeof formData.get("mimeType") === "string" &&
        String(formData.get("mimeType"))) ||
      file.type ||
      undefined,
    ...(altText !== undefined ? { altText } : {}),
  };

  const parsed = UploadMediaInputSchema.safeParse(meta);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid media upload",
      details: parsed.error.flatten(),
    });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return mediaService.uploadMedia(buffer, parsed.data);
}

export async function deleteMediaAction(
  id: string,
): Promise<Result<{ ok: true }>> {
  const gate = await guardAdmin("media");
  if (!gate.ok) return gate;
  return mediaService.deleteMedia(id);
}

/** List is read-only; still gated so admin UI can call one module surface. */
export async function listMediaAction(
  folder?: unknown,
): Promise<Result<MediaAssetDto[]>> {
  const gate = await guardAdmin("media");
  if (!gate.ok) return gate;
  const rows = await mediaService.listMedia(folder);
  return ok(rows);
}

export type UploadMediaAction = typeof uploadMediaAction;
export type DeleteMediaAction = typeof deleteMediaAction;
export type ListMediaAction = typeof listMediaAction;

export type { MediaAssetDto, MediaFolderDto, UploadMediaInput };

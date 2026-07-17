import { randomBytes } from "node:crypto";
import type { MediaFolder } from "@prisma/client";
import { err, ok, type Result } from "@/server/result";
import {
  deleteFromR2,
  isR2Configured,
  uploadToR2,
} from "@/server/storage/r2";
import { toMediaAssetDto } from "./media.mapper";
import * as repo from "./media.repository";
import {
  FOLDER_PREFIX,
  MediaFolderSchema,
  UploadMediaInputSchema,
  type MediaAssetDto,
} from "./media.schema";

function buildR2Key(folder: MediaFolder, filename: string): string {
  const ext = filename.includes(".")
    ? filename.split(".").pop()!.toLowerCase()
    : "bin";
  const prefix = FOLDER_PREFIX[folder];
  return `${prefix}/${randomBytes(8).toString("hex")}.${ext}`;
}

export async function listMedia(folder?: unknown) {
  let folderFilter: MediaFolder | undefined;
  if (folder != null) {
    const parsed = MediaFolderSchema.safeParse(folder);
    if (parsed.success) folderFilter = parsed.data;
  }
  const rows = await repo.list(folderFilter);
  return rows.map(toMediaAssetDto);
}

export async function uploadMedia(
  body: Buffer | Uint8Array,
  input: unknown,
): Promise<Result<MediaAssetDto>> {
  const parsed = UploadMediaInputSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid media upload",
      details: parsed.error.flatten(),
    });
  }

  if (!isR2Configured()) {
    return err({ code: "R2_NOT_CONFIGURED", message: "R2 not configured" });
  }

  const d = parsed.data;
  const key = buildR2Key(d.folder, d.filename);
  const mimeType = d.mimeType || "application/octet-stream";
  const publicUrl = await uploadToR2(key, body, mimeType);

  const row = await repo.create({
    r2Key: key,
    publicUrl,
    folder: d.folder,
    mimeType,
    sizeBytes: body.byteLength,
    altText: d.altText ?? undefined,
  });

  return ok(toMediaAssetDto(row));
}

export async function deleteMedia(
  id: string,
): Promise<Result<{ ok: true }>> {
  const existing = await repo.findById(id);
  if (!existing) {
    return err({ code: "NOT_FOUND", message: "Media asset not found" });
  }

  if (isR2Configured()) {
    try {
      await deleteFromR2(existing.r2Key);
    } catch {
      // still remove DB row — orphan object can be GC'd later
    }
  }

  await repo.remove(id);
  return ok({ ok: true });
}

/** Resolve a media asset public URL for SEO / public pages. */
export async function getPublicUrl(
  mediaId: string | null | undefined,
): Promise<string | null> {
  if (!mediaId) return null;
  const row = await repo.findById(mediaId);
  return row?.publicUrl ?? null;
}

import type { MediaAsset } from "@prisma/client";
import { LocalizedTextSchema } from "@/server/db/zod";
import type { MediaAssetDto } from "./media.schema";

export function toMediaAssetDto(row: MediaAsset): MediaAssetDto {
  return {
    id: row.id,
    r2Key: row.r2Key,
    publicUrl: row.publicUrl,
    folder: row.folder,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    altText:
      row.altText == null ? null : LocalizedTextSchema.parse(row.altText),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

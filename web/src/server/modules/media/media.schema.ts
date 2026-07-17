import { MediaFolder } from "@prisma/client";
import { z } from "zod";
import { LocalizedTextSchema } from "@/server/db/zod";

export const MediaFolderSchema = z.nativeEnum(MediaFolder);
export type MediaFolderDto = z.infer<typeof MediaFolderSchema>;

export const UploadMediaInputSchema = z.object({
  folder: MediaFolderSchema,
  filename: z.string().min(1),
  mimeType: z.string().optional(),
  altText: LocalizedTextSchema.optional(),
});
export type UploadMediaInput = z.infer<typeof UploadMediaInputSchema>;

export const MediaAssetDtoSchema = z.object({
  id: z.string(),
  r2Key: z.string(),
  publicUrl: z.string(),
  folder: MediaFolderSchema,
  mimeType: z.string().nullable(),
  sizeBytes: z.number().int().nullable(),
  altText: LocalizedTextSchema.nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type MediaAssetDto = z.infer<typeof MediaAssetDtoSchema>;

/** R2 key prefix per MediaFolder. */
export const FOLDER_PREFIX: Record<MediaFolder, string> = {
  VEHICLES: "vehicles",
  HEROES: "heroes",
  NEWS: "news",
  POLICIES: "policies",
  SITE: "site",
};

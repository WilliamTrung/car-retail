import type { DeliveryPhoto, HeroSlide, ServiceBlock } from "@prisma/client";
import { LocalizedTextSchema, type LocalizedText } from "@/server/db/zod";
import { toMediaAssetDto } from "@/server/modules/media/media.mapper";
import type {
  DeliveryPhotoDto,
  HeroSlideDto,
  ServiceBlockDto,
} from "./homepage.schema";

function loc(value: unknown): LocalizedText {
  return LocalizedTextSchema.parse(value);
}

function locNull(value: unknown): LocalizedText | null {
  if (value == null) return null;
  return LocalizedTextSchema.parse(value);
}

export function toHeroSlideDto(
  row: HeroSlide & { imageMedia?: Parameters<typeof toMediaAssetDto>[0] | null },
): HeroSlideDto & { imageMedia?: ReturnType<typeof toMediaAssetDto> | null } {
  return {
    id: row.id,
    title: loc(row.title),
    subtitle: locNull(row.subtitle),
    promoChip: locNull(row.promoChip),
    ctaLabel: locNull(row.ctaLabel),
    ctaRouteKey: row.ctaRouteKey,
    imageMediaId: row.imageMediaId,
    sortOrder: row.sortOrder,
    published: row.published,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    imageMedia: row.imageMedia ? toMediaAssetDto(row.imageMedia) : null,
  };
}

export function toDeliveryPhotoDto(
  row: DeliveryPhoto & {
    imageMedia?: Parameters<typeof toMediaAssetDto>[0] | null;
  },
): DeliveryPhotoDto {
  return {
    id: row.id,
    caption: loc(row.caption),
    imageMediaId: row.imageMediaId,
    imageUrl: row.imageMedia?.publicUrl ?? null,
    sortOrder: row.sortOrder,
    published: row.published,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function toServiceBlockDto(row: ServiceBlock): ServiceBlockDto {
  return {
    id: row.id,
    title: loc(row.title),
    description: locNull(row.description),
    iconKey: row.iconKey,
    linkRouteKey: row.linkRouteKey,
    sortOrder: row.sortOrder,
    published: row.published,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

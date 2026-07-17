import { cachedRead, revalidateTags, TAGS } from "@/server/cache/tags";
import { jsonField } from "@/server/modules/json-field";
import { err, ok, type Result } from "@/server/result";
import { toDeliveryPhotoDto, toHeroSlideDto, toServiceBlockDto } from "./homepage.mapper";
import * as repo from "./homepage.repository";
import {
  DeliveryPhotoCreateSchema,
  DeliveryPhotoUpdateSchema,
  HeroSlideCreateSchema,
  HeroSlideUpdateSchema,
  ServiceBlockCreateSchema,
  ServiceBlockUpdateSchema,
  type DeliveryPhotoDto,
  type HeroSlideDto,
  type ServiceBlockDto,
} from "./homepage.schema";

export function getHeroSlides() {
  return cachedRead(
    ["public-hero-slides"],
    async () => {
      const rows = await repo.listPublishedHeroSlides();
      return rows.map(toHeroSlideDto);
    },
    [TAGS.hero],
  );
}

export function getServiceBlocks() {
  return cachedRead(
    ["public-service-blocks"],
    async () => {
      const rows = await repo.listPublishedServiceBlocks();
      return rows.map(toServiceBlockDto);
    },
    [TAGS.services],
  );
}

export function getDeliveryPhotos() {
  return cachedRead(
    ["public-delivery-photos"],
    async () => {
      const rows = await repo.listPublishedDeliveryPhotos();
      return rows.map(toDeliveryPhotoDto);
    },
    [TAGS.delivery],
  );
}

export async function listHeroSlidesAdmin() {
  return (await repo.listHeroSlidesAdmin()).map(toHeroSlideDto);
}

export async function createHeroSlide(
  input: unknown,
): Promise<Result<HeroSlideDto>> {
  const parsed = HeroSlideCreateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid hero slide",
      details: parsed.error.flatten(),
    });
  }
  const d = parsed.data;
  const row = await repo.createHeroSlide({
    title: d.title,
    subtitle: d.subtitle ?? undefined,
    promoChip: d.promoChip ?? undefined,
    ctaLabel: d.ctaLabel ?? undefined,
    ctaRouteKey: d.ctaRouteKey ?? null,
    sortOrder: d.sortOrder ?? 0,
    published: d.published ?? true,
    ...(d.imageMediaId
      ? { imageMedia: { connect: { id: d.imageMediaId } } }
      : {}),
  });
  revalidateTags(TAGS.hero);
  return ok(toHeroSlideDto(row));
}

export async function updateHeroSlide(
  id: string,
  input: unknown,
): Promise<Result<HeroSlideDto>> {
  const parsed = HeroSlideUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid hero slide update",
      details: parsed.error.flatten(),
    });
  }
  const d = parsed.data;
  const row = await repo.updateHeroSlide(id, {
    ...(d.title !== undefined ? { title: d.title } : {}),
    ...(d.subtitle !== undefined ? { subtitle: jsonField(d.subtitle) } : {}),
    ...(d.promoChip !== undefined ? { promoChip: jsonField(d.promoChip) } : {}),
    ...(d.ctaLabel !== undefined ? { ctaLabel: jsonField(d.ctaLabel) } : {}),
    ...(d.ctaRouteKey !== undefined ? { ctaRouteKey: d.ctaRouteKey } : {}),
    ...(d.sortOrder !== undefined ? { sortOrder: d.sortOrder } : {}),
    ...(d.published !== undefined ? { published: d.published } : {}),
    ...(d.imageMediaId !== undefined
      ? d.imageMediaId
        ? { imageMedia: { connect: { id: d.imageMediaId } } }
        : { imageMedia: { disconnect: true } }
      : {}),
  });
  revalidateTags(TAGS.hero);
  return ok(toHeroSlideDto(row));
}

export async function deleteHeroSlide(
  id: string,
): Promise<Result<{ ok: true }>> {
  await repo.deleteHeroSlide(id);
  revalidateTags(TAGS.hero);
  return ok({ ok: true });
}

export async function listServiceBlocksAdmin() {
  return (await repo.listServiceBlocksAdmin()).map(toServiceBlockDto);
}

export async function createServiceBlock(
  input: unknown,
): Promise<Result<ServiceBlockDto>> {
  const parsed = ServiceBlockCreateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid service block",
      details: parsed.error.flatten(),
    });
  }
  const d = parsed.data;
  const row = await repo.createServiceBlock({
    title: d.title,
    description: d.description ?? undefined,
    iconKey: d.iconKey ?? null,
    linkRouteKey: d.linkRouteKey ?? null,
    sortOrder: d.sortOrder ?? 0,
    published: d.published ?? true,
  });
  revalidateTags(TAGS.services);
  return ok(toServiceBlockDto(row));
}

export async function updateServiceBlock(
  id: string,
  input: unknown,
): Promise<Result<ServiceBlockDto>> {
  const parsed = ServiceBlockUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid service block update",
      details: parsed.error.flatten(),
    });
  }
  const d = parsed.data;
  const row = await repo.updateServiceBlock(id, {
    ...(d.title !== undefined ? { title: d.title } : {}),
    ...(d.description !== undefined
      ? { description: jsonField(d.description) }
      : {}),
    ...(d.iconKey !== undefined ? { iconKey: d.iconKey } : {}),
    ...(d.linkRouteKey !== undefined ? { linkRouteKey: d.linkRouteKey } : {}),
    ...(d.sortOrder !== undefined ? { sortOrder: d.sortOrder } : {}),
    ...(d.published !== undefined ? { published: d.published } : {}),
  });
  revalidateTags(TAGS.services);
  return ok(toServiceBlockDto(row));
}

export async function deleteServiceBlock(
  id: string,
): Promise<Result<{ ok: true }>> {
  await repo.deleteServiceBlock(id);
  revalidateTags(TAGS.services);
  return ok({ ok: true });
}

export async function listDeliveryPhotosAdmin() {
  return (await repo.listDeliveryPhotosAdmin()).map(toDeliveryPhotoDto);
}

export async function createDeliveryPhoto(
  input: unknown,
): Promise<Result<DeliveryPhotoDto>> {
  const parsed = DeliveryPhotoCreateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid delivery photo",
      details: parsed.error.flatten(),
    });
  }
  const d = parsed.data;
  const row = await repo.createDeliveryPhoto({
    caption: d.caption,
    sortOrder: d.sortOrder ?? 0,
    published: d.published ?? true,
    ...(d.imageMediaId
      ? { imageMedia: { connect: { id: d.imageMediaId } } }
      : {}),
  });
  revalidateTags(TAGS.delivery);
  return ok(toDeliveryPhotoDto(row));
}

export async function updateDeliveryPhoto(
  id: string,
  input: unknown,
): Promise<Result<DeliveryPhotoDto>> {
  const parsed = DeliveryPhotoUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return err({
      code: "VALIDATION_ERROR",
      message: "Invalid delivery photo update",
      details: parsed.error.flatten(),
    });
  }
  const d = parsed.data;
  const row = await repo.updateDeliveryPhoto(id, {
    ...(d.caption !== undefined ? { caption: d.caption } : {}),
    ...(d.sortOrder !== undefined ? { sortOrder: d.sortOrder } : {}),
    ...(d.published !== undefined ? { published: d.published } : {}),
    ...(d.imageMediaId !== undefined
      ? d.imageMediaId
        ? { imageMedia: { connect: { id: d.imageMediaId } } }
        : { imageMedia: { disconnect: true } }
      : {}),
  });
  revalidateTags(TAGS.delivery);
  return ok(toDeliveryPhotoDto(row));
}

export async function deleteDeliveryPhoto(
  id: string,
): Promise<Result<{ ok: true }>> {
  await repo.deleteDeliveryPhoto(id);
  revalidateTags(TAGS.delivery);
  return ok({ ok: true });
}

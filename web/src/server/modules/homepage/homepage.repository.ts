import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";

export async function listPublishedHeroSlides() {
  return prisma.heroSlide.findMany({
    where: { published: true },
    include: { imageMedia: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function listHeroSlidesAdmin() {
  return prisma.heroSlide.findMany({
    include: { imageMedia: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function createHeroSlide(data: Prisma.HeroSlideCreateInput) {
  return prisma.heroSlide.create({ data });
}

export async function updateHeroSlide(
  id: string,
  data: Prisma.HeroSlideUpdateInput,
) {
  return prisma.heroSlide.update({ where: { id }, data });
}

export async function deleteHeroSlide(id: string) {
  return prisma.heroSlide.delete({ where: { id } });
}

export async function listPublishedServiceBlocks() {
  return prisma.serviceBlock.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function listServiceBlocksAdmin() {
  return prisma.serviceBlock.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function createServiceBlock(data: Prisma.ServiceBlockCreateInput) {
  return prisma.serviceBlock.create({ data });
}

export async function updateServiceBlock(
  id: string,
  data: Prisma.ServiceBlockUpdateInput,
) {
  return prisma.serviceBlock.update({ where: { id }, data });
}

export async function deleteServiceBlock(id: string) {
  return prisma.serviceBlock.delete({ where: { id } });
}

export async function listPublishedDeliveryPhotos() {
  return prisma.deliveryPhoto.findMany({
    where: { published: true },
    include: { imageMedia: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function listDeliveryPhotosAdmin() {
  return prisma.deliveryPhoto.findMany({
    include: { imageMedia: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function createDeliveryPhoto(data: Prisma.DeliveryPhotoCreateInput) {
  return prisma.deliveryPhoto.create({ data });
}

export async function updateDeliveryPhoto(
  id: string,
  data: Prisma.DeliveryPhotoUpdateInput,
) {
  return prisma.deliveryPhoto.update({ where: { id }, data });
}

export async function deleteDeliveryPhoto(id: string) {
  return prisma.deliveryPhoto.delete({ where: { id } });
}

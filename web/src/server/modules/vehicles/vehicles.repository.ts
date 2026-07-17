import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";

export async function listLines() {
  return prisma.vehicleLine.findMany({
    orderBy: { sortOrder: "asc" },
    include: { segments: { orderBy: { sortOrder: "asc" } } },
  });
}

export async function createLine(data: Prisma.VehicleLineCreateInput) {
  return prisma.vehicleLine.create({ data });
}

export async function updateLine(id: string, data: Prisma.VehicleLineUpdateInput) {
  return prisma.vehicleLine.update({ where: { id }, data });
}

export async function deleteLine(id: string) {
  return prisma.vehicleLine.delete({ where: { id } });
}

export async function createSegment(data: Prisma.VehicleSegmentCreateInput) {
  return prisma.vehicleSegment.create({ data });
}

export async function updateSegment(
  id: string,
  data: Prisma.VehicleSegmentUpdateInput,
) {
  return prisma.vehicleSegment.update({ where: { id }, data });
}

export async function deleteSegment(id: string) {
  return prisma.vehicleSegment.delete({ where: { id } });
}

export async function findModelById(id: string) {
  return prisma.vehicleModel.findUnique({
    where: { id },
    include: {
      variants: { orderBy: { sortOrder: "asc" } },
      featureSections: {
        orderBy: { sortOrder: "asc" },
        include: { imageMedia: true },
      },
      faqs: { orderBy: { sortOrder: "asc" } },
      segment: { include: { line: true } },
      heroMedia: true,
    },
  });
}

export async function listPublishedModels() {
  return prisma.vehicleModel.findMany({
    where: { published: true },
    include: {
      heroMedia: true,
      variants: {
        where: { published: true },
        orderBy: { sortOrder: "asc" },
      },
      segment: { include: { line: true } },
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function listAdminModels() {
  return prisma.vehicleModel.findMany({
    include: {
      variants: { orderBy: { sortOrder: "asc" } },
      segment: { include: { line: true } },
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function createModel(data: Prisma.VehicleModelCreateInput) {
  return prisma.vehicleModel.create({ data });
}

export async function updateModel(
  id: string,
  data: Prisma.VehicleModelUpdateInput,
) {
  return prisma.vehicleModel.update({ where: { id }, data });
}

export async function deleteModel(id: string) {
  return prisma.vehicleModel.delete({ where: { id } });
}

export async function findPublishedModelWithDetails(id: string) {
  const model = await prisma.vehicleModel.findUnique({
    where: { id },
    include: {
      heroMedia: true,
      variants: {
        where: { published: true },
        orderBy: { sortOrder: "asc" },
      },
      featureSections: {
        orderBy: { sortOrder: "asc" },
        include: { imageMedia: true },
      },
      faqs: { orderBy: { sortOrder: "asc" } },
      segment: { include: { line: true } },
    },
  });
  if (!model) return null;

  const galleryIds = Array.isArray(model.gallery)
    ? (model.gallery as unknown[]).filter(
        (g): g is string => typeof g === "string" && g.length > 0,
      )
    : [];
  const galleryAssets = galleryIds.length
    ? await prisma.mediaAsset.findMany({ where: { id: { in: galleryIds } } })
    : [];
  const byId = new Map(galleryAssets.map((a) => [a.id, a]));
  const galleryMedia = galleryIds
    .map((gid) => byId.get(gid))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));

  return { ...model, galleryMedia };
}

export async function createVariant(data: Prisma.VehicleVariantCreateInput) {
  return prisma.vehicleVariant.create({ data });
}

export async function updateVariant(
  id: string,
  data: Prisma.VehicleVariantUpdateInput,
) {
  return prisma.vehicleVariant.update({ where: { id }, data });
}

export async function deleteVariant(id: string) {
  return prisma.vehicleVariant.delete({ where: { id } });
}

export async function createFeatureSection(
  data: Prisma.FeatureSectionCreateInput,
) {
  return prisma.featureSection.create({ data });
}

export async function updateFeatureSection(
  id: string,
  data: Prisma.FeatureSectionUpdateInput,
) {
  return prisma.featureSection.update({ where: { id }, data });
}

export async function deleteFeatureSection(id: string) {
  return prisma.featureSection.delete({ where: { id } });
}

export async function createModelFaq(data: Prisma.ModelFaqCreateInput) {
  return prisma.modelFaq.create({ data });
}

export async function updateModelFaq(
  id: string,
  data: Prisma.ModelFaqUpdateInput,
) {
  return prisma.modelFaq.update({ where: { id }, data });
}

export async function deleteModelFaq(id: string) {
  return prisma.modelFaq.delete({ where: { id } });
}

export async function findTemplateByIdOrKey(opts: {
  templateId?: string;
  templateKey?: string;
}) {
  if (opts.templateId) {
    return prisma.attributeTemplate.findUnique({
      where: { id: opts.templateId },
    });
  }
  if (opts.templateKey) {
    return prisma.attributeTemplate.findUnique({
      where: { key: opts.templateKey },
    });
  }
  return null;
}

import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";

export async function listUnits() {
  return prisma.unit.findMany({ orderBy: { key: "asc" } });
}

export async function createUnit(data: Prisma.UnitCreateInput) {
  return prisma.unit.create({ data });
}

export async function updateUnit(id: string, data: Prisma.UnitUpdateInput) {
  return prisma.unit.update({ where: { id }, data });
}

export async function deleteUnit(id: string) {
  return prisma.unit.delete({ where: { id } });
}

export async function listAttributeKeys() {
  return prisma.attributeKey.findMany({
    orderBy: [{ groupKey: "asc" }, { sortOrder: "asc" }],
  });
}

export async function createAttributeKey(data: Prisma.AttributeKeyCreateInput) {
  return prisma.attributeKey.create({ data });
}

export async function updateAttributeKey(
  id: string,
  data: Prisma.AttributeKeyUpdateInput,
) {
  return prisma.attributeKey.update({ where: { id }, data });
}

export async function deleteAttributeKey(id: string) {
  return prisma.attributeKey.delete({ where: { id } });
}

export async function listTemplates() {
  return prisma.attributeTemplate.findMany({ orderBy: { key: "asc" } });
}

export async function findTemplateById(id: string) {
  return prisma.attributeTemplate.findUnique({ where: { id } });
}

export async function findTemplateByKey(key: string) {
  return prisma.attributeTemplate.findUnique({ where: { key } });
}

export async function createTemplate(data: Prisma.AttributeTemplateCreateInput) {
  return prisma.attributeTemplate.create({ data });
}

export async function updateTemplate(
  id: string,
  data: Prisma.AttributeTemplateUpdateInput,
) {
  return prisma.attributeTemplate.update({ where: { id }, data });
}

export async function deleteTemplate(id: string) {
  return prisma.attributeTemplate.delete({ where: { id } });
}

export async function findModelAttributes(modelId: string) {
  return prisma.vehicleModel.findUnique({
    where: { id: modelId },
    select: { id: true, attributes: true },
  });
}

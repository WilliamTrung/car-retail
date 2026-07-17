import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";

export async function listPublished() {
  return prisma.showroom.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function listAdmin() {
  return prisma.showroom.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function findById(id: string) {
  return prisma.showroom.findUnique({ where: { id } });
}

export async function create(data: Prisma.ShowroomCreateInput) {
  return prisma.showroom.create({ data });
}

export async function update(id: string, data: Prisma.ShowroomUpdateInput) {
  return prisma.showroom.update({ where: { id }, data });
}

export async function remove(id: string) {
  return prisma.showroom.delete({ where: { id } });
}

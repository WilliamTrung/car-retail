import type { MediaFolder, Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";

export async function list(folder?: MediaFolder) {
  return prisma.mediaAsset.findMany({
    where: folder ? { folder } : {},
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function findById(id: string) {
  return prisma.mediaAsset.findUnique({ where: { id } });
}

export async function create(data: Prisma.MediaAssetCreateInput) {
  return prisma.mediaAsset.create({ data });
}

export async function remove(id: string) {
  return prisma.mediaAsset.delete({ where: { id } });
}

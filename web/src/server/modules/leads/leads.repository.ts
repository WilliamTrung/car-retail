import type { LeadStatus, Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";

export async function create(data: Prisma.LeadCreateInput) {
  return prisma.lead.create({ data });
}

export async function findById(id: string) {
  return prisma.lead.findUnique({
    where: { id },
    include: { model: true, variant: true, showroom: true },
  });
}

export async function list(opts?: { take?: number }) {
  return prisma.lead.findMany({
    include: { model: true, variant: true, showroom: true },
    orderBy: { createdAt: "desc" },
    take: opts?.take ?? 5000,
  });
}

export async function update(
  id: string,
  data: { status?: LeadStatus; notes?: string | null },
) {
  return prisma.lead.update({ where: { id }, data });
}

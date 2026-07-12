import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";

export async function GET(request) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR", "SALES"]);
  if (error) return error;

  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type");
  const status = searchParams.get("status");

  /** @type {import('@prisma/client').Prisma.LeadWhereInput} */
  const where = {};
  if (type) where.type = type;
  if (status) where.status = status;

  const leads = await prisma.lead.findMany({
    where,
    include: {
      model: { select: { name: true } },
      variant: { select: { name: true } },
      showroom: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json(leads);
}

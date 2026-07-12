import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";

/** @param {import('next/server').NextRequest} request @param {{ params: Promise<{ id: string }> }} ctx */
export async function PATCH(request, { params }) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR", "SALES"]);
  if (error) return error;
  const { id } = await params;
  const body = await request.json();

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      status: typeof body.status === "string" ? body.status : undefined,
      notes: body.notes !== undefined ? body.notes || null : undefined,
    },
  });
  return NextResponse.json(lead);
}

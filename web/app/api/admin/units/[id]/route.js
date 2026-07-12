import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, biFromBody } from "@/lib/admin/auth";
import { bustTags, TAGS } from "@/lib/admin/revalidate";

/** @param {import('next/server').NextRequest} request @param {{ params: Promise<{ id: string }> }} ctx */
export async function PATCH(request, { params }) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;
  const { id } = await params;
  const body = await request.json();

  const unit = await prisma.unit.update({
    where: { id },
    data: {
      key: typeof body.key === "string" ? body.key.trim() : undefined,
      value: body.valueVi !== undefined ? biFromBody(body, "value") : undefined,
    },
  });
  bustTags(TAGS.units);
  return NextResponse.json(unit);
}

/** @param {import('next/server').NextRequest} request @param {{ params: Promise<{ id: string }> }} ctx */
export async function DELETE(request, { params }) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;
  const { id } = await params;
  await prisma.unit.delete({ where: { id } });
  bustTags(TAGS.units);
  return NextResponse.json({ ok: true });
}

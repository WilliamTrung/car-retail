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

  const hotline = await prisma.hotline.update({
    where: { id },
    data: {
      label: body.labelVi !== undefined ? biFromBody(body, "label") : undefined,
      phone: typeof body.phone === "string" ? body.phone : undefined,
      sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : undefined,
      showroomId: body.showroomId !== undefined ? body.showroomId || null : undefined,
    },
  });
  bustTags(TAGS.hotlines);
  return NextResponse.json(hotline);
}

/** @param {import('next/server').NextRequest} request @param {{ params: Promise<{ id: string }> }} ctx */
export async function DELETE(request, { params }) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;
  const { id } = await params;
  await prisma.hotline.delete({ where: { id } });
  bustTags(TAGS.hotlines);
  return NextResponse.json({ ok: true });
}

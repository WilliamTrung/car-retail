import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, biFromBody } from "@/lib/admin/auth";
import { bustTags, TAGS } from "@/lib/admin/revalidate";

/** @param {import('next/server').NextRequest} request @param {{ params: Promise<{ id: string }> }} ctx */
export async function PATCH(request, { params }) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN"]);
  if (error) return error;
  const { id } = await params;
  const body = await request.json();

  const item = await prisma.menuItem.update({
    where: { id },
    data: {
      label: body.labelVi !== undefined ? biFromBody(body, "label") : undefined,
      routeKey: typeof body.routeKey === "string" ? body.routeKey.trim() : undefined,
      placement: body.placement === "FOOTER" || body.placement === "HEADER" ? body.placement : undefined,
      sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : undefined,
      visible: body.visible !== undefined ? body.visible !== "false" && body.visible !== false : undefined,
    },
  });
  bustTags(TAGS.menu);
  return NextResponse.json(item);
}

/** @param {import('next/server').NextRequest} request @param {{ params: Promise<{ id: string }> }} ctx */
export async function DELETE(request, { params }) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN"]);
  if (error) return error;
  const { id } = await params;
  await prisma.menuItem.delete({ where: { id } });
  bustTags(TAGS.menu);
  return NextResponse.json({ ok: true });
}

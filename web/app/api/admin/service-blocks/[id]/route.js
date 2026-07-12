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

  const block = await prisma.serviceBlock.update({
    where: { id },
    data: {
      title: body.titleVi !== undefined ? biFromBody(body, "title") : undefined,
      description: body.descriptionVi !== undefined ? biFromBody(body, "description") : undefined,
      iconKey: body.iconKey !== undefined ? body.iconKey || null : undefined,
      linkRouteKey: body.linkRouteKey !== undefined ? body.linkRouteKey || null : undefined,
      sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : undefined,
      published: body.published !== undefined ? body.published !== "false" && body.published !== false : undefined,
    },
  });
  bustTags(TAGS.services);
  return NextResponse.json(block);
}

/** @param {import('next/server').NextRequest} request @param {{ params: Promise<{ id: string }> }} ctx */
export async function DELETE(request, { params }) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;
  const { id } = await params;
  await prisma.serviceBlock.delete({ where: { id } });
  bustTags(TAGS.services);
  return NextResponse.json({ ok: true });
}

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

  const slide = await prisma.heroSlide.update({
    where: { id },
    data: {
      title: body.titleVi !== undefined ? biFromBody(body, "title") : undefined,
      subtitle: body.subtitleVi !== undefined ? biFromBody(body, "subtitle") : undefined,
      ctaLabel: body.ctaLabelVi !== undefined ? biFromBody(body, "ctaLabel") : undefined,
      ctaRouteKey: body.ctaRouteKey !== undefined ? body.ctaRouteKey || null : undefined,
      imageMediaId: body.imageMediaId !== undefined ? body.imageMediaId || null : undefined,
      sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : undefined,
      published: body.published !== undefined ? body.published !== "false" && body.published !== false : undefined,
    },
  });
  bustTags(TAGS.hero);
  return NextResponse.json(slide);
}

/** @param {import('next/server').NextRequest} request @param {{ params: Promise<{ id: string }> }} ctx */
export async function DELETE(request, { params }) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;
  const { id } = await params;
  await prisma.heroSlide.delete({ where: { id } });
  bustTags(TAGS.hero);
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, biFromBody } from "@/lib/admin/auth";
import { bustTags, TAGS } from "@/lib/admin/revalidate";

export async function GET(request) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;
  const slides = await prisma.heroSlide.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(slides);
}

export async function POST(request) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;
  const body = await request.json();

  const slide = await prisma.heroSlide.create({
    data: {
      title: biFromBody(body, "title"),
      subtitle: body.subtitleVi !== undefined ? biFromBody(body, "subtitle") : undefined,
      ctaLabel: body.ctaLabelVi !== undefined ? biFromBody(body, "ctaLabel") : undefined,
      ctaRouteKey: body.ctaRouteKey || null,
      imageMediaId: body.imageMediaId || null,
      sortOrder: Number(body.sortOrder) || 0,
      published: body.published !== false && body.published !== "false",
    },
  });
  bustTags(TAGS.hero);
  return NextResponse.json(slide, { status: 201 });
}

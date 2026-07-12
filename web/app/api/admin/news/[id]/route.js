import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, biFromBody } from "@/lib/admin/auth";
import { bustTags, TAGS } from "@/lib/admin/revalidate";
import { parseJsonField } from "@/lib/admin/json";

/** @param {import('next/server').NextRequest} request @param {{ params: Promise<{ id: string }> }} ctx */
export async function PATCH(request, { params }) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;
  const { id } = await params;
  const body = await request.json();

  const published = body.published !== undefined ? body.published === "true" || body.published === true : undefined;

  const post = await prisma.newsPost.update({
    where: { id },
    data: {
      slug: body.slugVi !== undefined ? biFromBody(body, "slug") : undefined,
      title: body.titleVi !== undefined ? biFromBody(body, "title") : undefined,
      excerpt: body.excerptVi !== undefined ? biFromBody(body, "excerpt") : undefined,
      body: body.bodyVi !== undefined ? biFromBody(body, "body") : undefined,
      meta: body.meta !== undefined ? parseJsonField(body.meta, undefined) : undefined,
      featuredMediaId: body.featuredMediaId !== undefined ? body.featuredMediaId || null : undefined,
      published,
      featured: body.featured !== undefined ? body.featured === "true" || body.featured === true : undefined,
      publishedAt: published === true ? new Date() : published === false ? null : undefined,
    },
  });
  bustTags(TAGS.news);
  return NextResponse.json(post);
}

/** @param {import('next/server').NextRequest} request @param {{ params: Promise<{ id: string }> }} ctx */
export async function DELETE(request, { params }) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;
  const { id } = await params;
  await prisma.newsPost.delete({ where: { id } });
  bustTags(TAGS.news);
  return NextResponse.json({ ok: true });
}

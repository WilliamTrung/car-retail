import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, biFromBody } from "@/lib/admin/auth";
import { bustTags, TAGS } from "@/lib/admin/revalidate";
import { parseJsonField } from "@/lib/admin/json";

function buildNewsMeta(body, existing = {}) {
  if (body.meta !== undefined) return parseJsonField(body.meta, undefined);
  if (body.metaOgImageVi === undefined && body.metaOgImageEn === undefined) return undefined;

  const meta = { ...existing };
  if (body.metaOgImageVi !== undefined) {
    meta.vi = { ...(meta.vi || {}), ogImageMediaId: body.metaOgImageVi || null };
  }
  if (body.metaOgImageEn !== undefined) {
    meta.en = { ...(meta.en || {}), ogImageMediaId: body.metaOgImageEn || null };
  }
  return meta;
}

/** @param {import('next/server').NextRequest} request @param {{ params: Promise<{ id: string }> }} ctx */
export async function PATCH(request, { params }) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;
  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.newsPost.findUnique({ where: { id }, select: { meta: true } });
  const published = body.published !== undefined ? body.published === "true" || body.published === true : undefined;
  const meta = buildNewsMeta(body, /** @type {object} */ (existing?.meta ?? {}));

  const post = await prisma.newsPost.update({
    where: { id },
    data: {
      slug: body.slugVi !== undefined ? biFromBody(body, "slug") : undefined,
      title: body.titleVi !== undefined ? biFromBody(body, "title") : undefined,
      excerpt: body.excerptVi !== undefined ? biFromBody(body, "excerpt") : undefined,
      body: body.bodyVi !== undefined ? biFromBody(body, "body") : undefined,
      meta: meta !== undefined ? meta : undefined,
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

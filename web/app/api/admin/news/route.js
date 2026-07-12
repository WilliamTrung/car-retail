import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, biFromBody } from "@/lib/admin/auth";
import { bustTags, TAGS } from "@/lib/admin/revalidate";
import { parseJsonField } from "@/lib/admin/json";

export async function GET(request) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;
  const posts = await prisma.newsPost.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json(posts);
}

export async function POST(request) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;
  const body = await request.json();

  const post = await prisma.newsPost.create({
    data: {
      slug: biFromBody(body, "slug"),
      title: biFromBody(body, "title"),
      excerpt: body.excerptVi !== undefined ? biFromBody(body, "excerpt") : undefined,
      body: biFromBody(body, "body"),
      meta: parseJsonField(body.meta, undefined),
      featuredMediaId: body.featuredMediaId || null,
      published: body.published === "true" || body.published === true,
      featured: body.featured === "true" || body.featured === true,
      publishedAt: body.published === "true" || body.published === true ? new Date() : null,
    },
  });
  bustTags(TAGS.news);
  return NextResponse.json(post, { status: 201 });
}

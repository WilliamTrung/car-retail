import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, biFromBody } from "@/lib/admin/auth";
import { bustTags, TAGS } from "@/lib/admin/revalidate";
import { parseJsonField } from "@/lib/admin/json";

export async function GET(request) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;
  const pages = await prisma.page.findMany({ orderBy: { pageType: "asc" } });
  return NextResponse.json(pages);
}

export async function PATCH(request) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;
  const body = await request.json();
  const pageType = typeof body.pageType === "string" ? body.pageType : "";
  if (!pageType) return NextResponse.json({ error: "pageType required" }, { status: 400 });

  const page = await prisma.page.upsert({
    where: { pageType },
    update: {
      slug: body.slugVi !== undefined ? biFromBody(body, "slug") : undefined,
      title: body.titleVi !== undefined ? biFromBody(body, "title") : undefined,
      body: body.bodyVi !== undefined ? biFromBody(body, "body") : undefined,
      meta: body.meta !== undefined ? parseJsonField(body.meta, undefined) : undefined,
      published: body.published !== undefined ? body.published !== "false" && body.published !== false : undefined,
    },
    create: {
      pageType,
      slug: biFromBody(body, "slug"),
      title: biFromBody(body, "title"),
      body: biFromBody(body, "body"),
      meta: parseJsonField(body.meta, undefined),
      published: body.published !== false && body.published !== "false",
    },
  });
  bustTags(TAGS.pages);
  return NextResponse.json(page);
}

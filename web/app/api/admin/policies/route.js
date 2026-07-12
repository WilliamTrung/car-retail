import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, biFromBody } from "@/lib/admin/auth";
import { bustTags, TAGS } from "@/lib/admin/revalidate";

export async function GET(request) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;
  const items = await prisma.policyDocument.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(items);
}

export async function POST(request) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;
  const body = await request.json();

  const doc = await prisma.policyDocument.create({
    data: {
      slug: biFromBody(body, "slug"),
      title: biFromBody(body, "title"),
      body: body.bodyVi !== undefined ? biFromBody(body, "body") : undefined,
      pdfMediaId: body.pdfMediaId || null,
      sortOrder: Number(body.sortOrder) || 0,
      published: body.published !== false && body.published !== "false",
    },
  });
  bustTags(TAGS.policies);
  return NextResponse.json(doc, { status: 201 });
}

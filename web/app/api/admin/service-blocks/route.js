import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, biFromBody } from "@/lib/admin/auth";
import { bustTags, TAGS } from "@/lib/admin/revalidate";

export async function GET(request) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;
  const blocks = await prisma.serviceBlock.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(blocks);
}

export async function POST(request) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;
  const body = await request.json();

  const block = await prisma.serviceBlock.create({
    data: {
      title: biFromBody(body, "title"),
      description: body.descriptionVi !== undefined ? biFromBody(body, "description") : undefined,
      iconKey: body.iconKey || null,
      linkRouteKey: body.linkRouteKey || null,
      sortOrder: Number(body.sortOrder) || 0,
      published: body.published !== false && body.published !== "false",
    },
  });
  bustTags(TAGS.services);
  return NextResponse.json(block, { status: 201 });
}

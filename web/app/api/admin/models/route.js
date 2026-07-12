import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, biFromBody } from "@/lib/admin/auth";
import { bustTags, TAGS } from "@/lib/admin/revalidate";
import { parseJsonField } from "@/lib/admin/json";

export async function GET(request) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;

  const models = await prisma.vehicleModel.findMany({
    include: {
      segment: { include: { line: true } },
      variants: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(models);
}

export async function POST(request) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;

  const body = await request.json();
  const segmentId = typeof body.segmentId === "string" ? body.segmentId : "";
  if (!segmentId) return NextResponse.json({ error: "segmentId required" }, { status: 400 });

  const model = await prisma.vehicleModel.create({
    data: {
      segmentId,
      name: biFromBody(body, "name"),
      slug: biFromBody(body, "slug"),
      tagline: body.taglineVi !== undefined ? biFromBody(body, "tagline") : undefined,
      description: body.descriptionVi !== undefined ? biFromBody(body, "description") : undefined,
      attributes: parseJsonField(body.attributes, []),
      published: body.published === "true" || body.published === true,
      sortOrder: Number(body.sortOrder) || 0,
    },
  });
  bustTags(TAGS.models);
  return NextResponse.json(model, { status: 201 });
}

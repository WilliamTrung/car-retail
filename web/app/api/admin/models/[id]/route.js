import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, biFromBody } from "@/lib/admin/auth";
import { bustTags, TAGS } from "@/lib/admin/revalidate";
import { parseJsonField } from "@/lib/admin/json";

/** @param {import('next/server').NextRequest} request @param {{ params: Promise<{ id: string }> }} ctx */
export async function GET(request, { params }) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;
  const { id } = await params;

  const model = await prisma.vehicleModel.findUnique({
    where: { id },
    include: {
      variants: { orderBy: { sortOrder: "asc" } },
      featureSections: { orderBy: { sortOrder: "asc" } },
      faqs: { orderBy: { sortOrder: "asc" } },
      segment: { include: { line: true } },
    },
  });
  if (!model) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(model);
}

/** @param {import('next/server').NextRequest} request @param {{ params: Promise<{ id: string }> }} ctx */
export async function PATCH(request, { params }) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;
  const { id } = await params;
  const body = await request.json();

  const model = await prisma.vehicleModel.update({
    where: { id },
    data: {
      segmentId: typeof body.segmentId === "string" ? body.segmentId : undefined,
      name: body.nameVi !== undefined ? biFromBody(body, "name") : undefined,
      slug: body.slugVi !== undefined ? biFromBody(body, "slug") : undefined,
      tagline: body.taglineVi !== undefined ? biFromBody(body, "tagline") : undefined,
      description: body.descriptionVi !== undefined ? biFromBody(body, "description") : undefined,
      attributes: body.attributes !== undefined ? parseJsonField(body.attributes, []) : undefined,
      meta: body.meta !== undefined ? parseJsonField(body.meta, undefined) : undefined,
      heroMediaId: body.heroMediaId !== undefined ? body.heroMediaId || null : undefined,
      published: body.published !== undefined ? body.published === "true" || body.published === true : undefined,
      sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : undefined,
    },
  });
  bustTags(TAGS.models);
  return NextResponse.json(model);
}

/** @param {import('next/server').NextRequest} request @param {{ params: Promise<{ id: string }> }} ctx */
export async function DELETE(request, { params }) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;
  const { id } = await params;
  await prisma.vehicleModel.delete({ where: { id } });
  bustTags(TAGS.models);
  return NextResponse.json({ ok: true });
}

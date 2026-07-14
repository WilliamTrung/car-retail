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

  const section = await prisma.featureSection.update({
    where: { id },
    data: {
      title: body.titleVi !== undefined ? biFromBody(body, "title") : undefined,
      body: body.bodyVi !== undefined ? biFromBody(body, "body") : undefined,
      imageMediaId: body.imageMediaId !== undefined ? body.imageMediaId || null : undefined,
      sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : undefined,
    },
  });
  bustTags(TAGS.models);
  return NextResponse.json(section);
}

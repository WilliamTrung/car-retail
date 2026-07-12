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

  const doc = await prisma.policyDocument.update({
    where: { id },
    data: {
      slug: body.slugVi !== undefined ? biFromBody(body, "slug") : undefined,
      title: body.titleVi !== undefined ? biFromBody(body, "title") : undefined,
      body: body.bodyVi !== undefined ? biFromBody(body, "body") : undefined,
      pdfMediaId: body.pdfMediaId !== undefined ? body.pdfMediaId || null : undefined,
      sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : undefined,
      published: body.published !== undefined ? body.published !== "false" && body.published !== false : undefined,
    },
  });
  bustTags(TAGS.policies);
  return NextResponse.json(doc);
}

/** @param {import('next/server').NextRequest} request @param {{ params: Promise<{ id: string }> }} ctx */
export async function DELETE(request, { params }) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;
  const { id } = await params;
  await prisma.policyDocument.delete({ where: { id } });
  bustTags(TAGS.policies);
  return NextResponse.json({ ok: true });
}

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

  const variant = await prisma.vehicleVariant.update({
    where: { id },
    data: {
      name: body.nameVi !== undefined ? biFromBody(body, "name") : undefined,
      price: body.price !== undefined ? (body.price ? body.price : null) : undefined,
      attributes: body.attributes !== undefined ? parseJsonField(body.attributes, []) : undefined,
      allowDeposit: body.allowDeposit !== undefined ? body.allowDeposit !== "false" && body.allowDeposit !== false : undefined,
      allowTestDrive: body.allowTestDrive !== undefined ? body.allowTestDrive !== "false" && body.allowTestDrive !== false : undefined,
      published: body.published !== undefined ? body.published === "true" || body.published === true : undefined,
      sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : undefined,
    },
  });
  bustTags(TAGS.models);
  return NextResponse.json(variant);
}

/** @param {import('next/server').NextRequest} request @param {{ params: Promise<{ id: string }> }} ctx */
export async function DELETE(request, { params }) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;
  const { id } = await params;
  await prisma.vehicleVariant.delete({ where: { id } });
  bustTags(TAGS.models);
  return NextResponse.json({ ok: true });
}

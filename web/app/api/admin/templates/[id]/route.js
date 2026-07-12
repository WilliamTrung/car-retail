import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, biFromBody } from "@/lib/admin/auth";
import { parseJsonField } from "@/lib/admin/json";

/** @param {import('next/server').NextRequest} request @param {{ params: Promise<{ id: string }> }} ctx */
export async function PATCH(request, { params }) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;
  const { id } = await params;
  const body = await request.json();

  const template = await prisma.attributeTemplate.update({
    where: { id },
    data: {
      key: typeof body.key === "string" ? body.key.trim() : undefined,
      name: body.nameVi !== undefined ? biFromBody(body, "name") : undefined,
      items: body.items !== undefined ? parseJsonField(body.items, []) : undefined,
    },
  });
  return NextResponse.json(template);
}

/** @param {import('next/server').NextRequest} request @param {{ params: Promise<{ id: string }> }} ctx */
export async function DELETE(request, { params }) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;
  const { id } = await params;
  await prisma.attributeTemplate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

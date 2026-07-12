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

  const showroom = await prisma.showroom.update({
    where: { id },
    data: {
      name: body.nameVi !== undefined ? biFromBody(body, "name") : undefined,
      address: body.addressVi !== undefined ? biFromBody(body, "address") : undefined,
      city: typeof body.city === "string" ? body.city : undefined,
      phone: body.phone !== undefined ? body.phone || null : undefined,
      hours: body.hoursVi !== undefined ? biFromBody(body, "hours") : undefined,
      typeTag: body.typeTag !== undefined ? body.typeTag || null : undefined,
      lat: body.lat !== undefined ? (body.lat ? Number(body.lat) : null) : undefined,
      lng: body.lng !== undefined ? (body.lng ? Number(body.lng) : null) : undefined,
      sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : undefined,
      published: body.published !== undefined ? body.published !== "false" && body.published !== false : undefined,
    },
  });
  bustTags(TAGS.showrooms);
  return NextResponse.json(showroom);
}

/** @param {import('next/server').NextRequest} request @param {{ params: Promise<{ id: string }> }} ctx */
export async function DELETE(request, { params }) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;
  const { id } = await params;
  await prisma.showroom.delete({ where: { id } });
  bustTags(TAGS.showrooms);
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, biFromBody } from "@/lib/admin/auth";
import { bustTags, TAGS } from "@/lib/admin/revalidate";
import { parseJsonField } from "@/lib/admin/json";

export async function GET(request) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;
  const showrooms = await prisma.showroom.findMany({
    include: { hotlines: { orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(showrooms);
}

export async function POST(request) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;
  const body = await request.json();

  const showroom = await prisma.showroom.create({
    data: {
      name: biFromBody(body, "name"),
      address: biFromBody(body, "address"),
      city: typeof body.city === "string" ? body.city : "",
      phone: body.phone || null,
      hours: body.hoursVi !== undefined ? biFromBody(body, "hours") : undefined,
      typeTag: body.typeTag || null,
      lat: body.lat ? Number(body.lat) : null,
      lng: body.lng ? Number(body.lng) : null,
      sortOrder: Number(body.sortOrder) || 0,
      published: body.published !== false && body.published !== "false",
    },
  });
  bustTags(TAGS.showrooms);
  return NextResponse.json(showroom, { status: 201 });
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, biFromBody } from "@/lib/admin/auth";
import { bustTags, TAGS } from "@/lib/admin/revalidate";

export async function GET(request) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN"]);
  if (error) return error;

  const placement = request.nextUrl.searchParams.get("placement");
  const where = placement ? { placement } : {};

  const items = await prisma.menuItem.findMany({
    where,
    orderBy: [{ placement: "asc" }, { sortOrder: "asc" }],
  });
  return NextResponse.json(items);
}

export async function POST(request) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN"]);
  if (error) return error;

  const body = await request.json();
  const routeKey = typeof body.routeKey === "string" ? body.routeKey.trim() : "";
  const placement = body.placement === "FOOTER" ? "FOOTER" : "HEADER";
  if (!routeKey) return NextResponse.json({ error: "routeKey required" }, { status: 400 });

  const item = await prisma.menuItem.create({
    data: {
      label: biFromBody(body, "label"),
      routeKey,
      placement,
      sortOrder: Number(body.sortOrder) || 0,
      visible: body.visible !== "false" && body.visible !== false,
    },
  });
  bustTags(TAGS.menu);
  return NextResponse.json(item, { status: 201 });
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, biFromBody } from "@/lib/admin/auth";
import { bustTags, TAGS } from "@/lib/admin/revalidate";

export async function GET(request) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;
  const units = await prisma.unit.findMany({ orderBy: { key: "asc" } });
  return NextResponse.json(units);
}

export async function POST(request) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;

  const body = await request.json();
  const key = typeof body.key === "string" ? body.key.trim() : "";
  if (!key) return NextResponse.json({ error: "Key required" }, { status: 400 });

  const unit = await prisma.unit.create({
    data: { key, value: biFromBody(body, "value") },
  });
  bustTags(TAGS.units);
  return NextResponse.json(unit, { status: 201 });
}

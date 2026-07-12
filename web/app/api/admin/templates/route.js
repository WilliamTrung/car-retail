import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, biFromBody } from "@/lib/admin/auth";
import { parseJsonField } from "@/lib/admin/json";

export async function GET(request) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;
  const templates = await prisma.attributeTemplate.findMany({ orderBy: { key: "asc" } });
  return NextResponse.json(templates);
}

export async function POST(request) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;

  const body = await request.json();
  const key = typeof body.key === "string" ? body.key.trim() : "";
  if (!key) return NextResponse.json({ error: "Key required" }, { status: 400 });

  const template = await prisma.attributeTemplate.create({
    data: {
      key,
      name: biFromBody(body, "name"),
      items: parseJsonField(body.items, []),
    },
  });
  return NextResponse.json(template, { status: 201 });
}

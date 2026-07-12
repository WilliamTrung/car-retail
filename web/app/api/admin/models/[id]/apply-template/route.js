import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { bustTags, TAGS } from "@/lib/admin/revalidate";
import { parseJsonField } from "@/lib/admin/json";

/** @param {import('next/server').NextRequest} request @param {{ params: Promise<{ id: string }> }} ctx */
export async function POST(request, { params }) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;
  const { id: modelId } = await params;
  const body = await request.json();

  const templateId = typeof body.templateId === "string" ? body.templateId : "";
  const templateKey = typeof body.templateKey === "string" ? body.templateKey : "";

  const template = templateId
    ? await prisma.attributeTemplate.findUnique({ where: { id: templateId } })
    : templateKey
      ? await prisma.attributeTemplate.findUnique({ where: { key: templateKey } })
      : null;

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const items = parseJsonField(template.items, []);
  const sortedItems = Array.isArray(items)
    ? [...items].sort((a, b) => (a?.sortOrder ?? 0) - (b?.sortOrder ?? 0))
    : [];
  const attributes = sortedItems.map((item) => ({
    key: item.key,
    value: item.defaultValue ?? "",
    unit: item.unit ?? null,
  }));

  const model = await prisma.vehicleModel.update({
    where: { id: modelId },
    data: { attributes },
  });
  bustTags(TAGS.models);
  return NextResponse.json(model);
}

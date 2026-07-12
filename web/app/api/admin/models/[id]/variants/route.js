import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, biFromBody } from "@/lib/admin/auth";
import { bustTags, TAGS } from "@/lib/admin/revalidate";
import { parseJsonField } from "@/lib/admin/json";

/** @param {import('next/server').NextRequest} request @param {{ params: Promise<{ id: string }> }} ctx */
export async function POST(request, { params }) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;
  const { id: modelId } = await params;
  const body = await request.json();

  const model = await prisma.vehicleModel.findUnique({ where: { id: modelId } });
  if (!model) return NextResponse.json({ error: "Model not found" }, { status: 404 });

  const variant = await prisma.vehicleVariant.create({
    data: {
      modelId,
      name: biFromBody(body, "name"),
      price: body.price ? body.price : null,
      attributes: parseJsonField(body.attributes, []),
      allowDeposit: body.allowDeposit !== "false" && body.allowDeposit !== false,
      allowTestDrive: body.allowTestDrive !== "false" && body.allowTestDrive !== false,
      published: body.published === "true" || body.published === true,
      sortOrder: Number(body.sortOrder) || 0,
    },
  });
  bustTags(TAGS.models);
  return NextResponse.json(variant, { status: 201 });
}

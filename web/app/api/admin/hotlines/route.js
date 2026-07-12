import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, biFromBody } from "@/lib/admin/auth";
import { bustTags, TAGS } from "@/lib/admin/revalidate";

export async function POST(request) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;
  const body = await request.json();

  const hotline = await prisma.hotline.create({
    data: {
      label: biFromBody(body, "label"),
      phone: typeof body.phone === "string" ? body.phone : "",
      sortOrder: Number(body.sortOrder) || 0,
      showroomId: body.showroomId || null,
    },
  });
  bustTags(TAGS.hotlines);
  return NextResponse.json(hotline, { status: 201 });
}

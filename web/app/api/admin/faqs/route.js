import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, biFromBody } from "@/lib/admin/auth";
import { bustTags, TAGS } from "@/lib/admin/revalidate";

export async function GET(request) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;
  const items = await prisma.faqItem.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(items);
}

export async function POST(request) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;
  const body = await request.json();

  const item = await prisma.faqItem.create({
    data: {
      question: biFromBody(body, "question"),
      answer: biFromBody(body, "answer"),
      sortOrder: Number(body.sortOrder) || 0,
      published: body.published !== false && body.published !== "false",
    },
  });
  bustTags(TAGS.faqs);
  return NextResponse.json(item, { status: 201 });
}

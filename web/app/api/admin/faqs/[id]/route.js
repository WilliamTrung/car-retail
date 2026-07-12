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

  const item = await prisma.faqItem.update({
    where: { id },
    data: {
      question: body.questionVi !== undefined ? biFromBody(body, "question") : undefined,
      answer: body.answerVi !== undefined ? biFromBody(body, "answer") : undefined,
      sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : undefined,
      published: body.published !== undefined ? body.published !== "false" && body.published !== false : undefined,
    },
  });
  bustTags(TAGS.faqs);
  return NextResponse.json(item);
}

/** @param {import('next/server').NextRequest} request @param {{ params: Promise<{ id: string }> }} ctx */
export async function DELETE(request, { params }) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;
  const { id } = await params;
  await prisma.faqItem.delete({ where: { id } });
  bustTags(TAGS.faqs);
  return NextResponse.json({ ok: true });
}

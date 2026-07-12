import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const VALID_TYPES = new Set(["TEST_DRIVE", "DEPOSIT", "CONSULT"]);

/** @param {unknown} value */
function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { type, locale, payload, modelId, variantId, showroomId } = body ?? {};

  if (!VALID_TYPES.has(type)) {
    return NextResponse.json({ error: "Invalid lead type" }, { status: 400 });
  }
  if (!isNonEmptyString(locale) || !["vi", "en"].includes(locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }
  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Missing payload" }, { status: 400 });
  }
  if (!isNonEmptyString(payload.name) || !isNonEmptyString(payload.phone)) {
    return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
  }
  if (!payload.consent) {
    return NextResponse.json({ error: "Consent is required" }, { status: 400 });
  }

  const lead = await prisma.lead.create({
    data: {
      type,
      locale,
      payload,
      modelId: modelId || null,
      variantId: variantId || null,
      showroomId: showroomId || null,
    },
  });

  return NextResponse.json({ id: lead.id }, { status: 201 });
}

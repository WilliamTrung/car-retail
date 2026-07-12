import { NextResponse } from "next/server";
import { getModelBySlug, getUnits } from "@/lib/queries/public";
import { toAttributesResponse } from "@/lib/attributes";

/** @param {import('next/server').NextRequest} request @param {{ params: Promise<{ slug: string }> }} ctx */
export async function GET(request, { params }) {
  const { slug } = await params;
  const locale = request.nextUrl.searchParams.get("locale") || "vi";
  if (!["vi", "en"].includes(locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const model = await getModelBySlug(locale, slug);
  if (!model) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const units = await getUnits();
  const attributes = Array.isArray(model.attributes) ? model.attributes : [];

  return NextResponse.json(toAttributesResponse(units, attributes));
}

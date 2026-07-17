import { NextResponse, type NextRequest } from "next/server";
import { vehiclesService } from "@/server/modules/vehicles";
import { z } from "zod";

const LocaleSchema = z.enum(["vi", "en"]);

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  const localeParam = request.nextUrl.searchParams.get("locale") ?? "vi";
  const localeParsed = LocaleSchema.safeParse(localeParam);
  if (!localeParsed.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid locale",
        },
      },
      { status: 400 },
    );
  }

  const payload = await vehiclesService.getModelAttributesBySlug(
    localeParsed.data,
    slug,
  );
  if (!payload) {
    return NextResponse.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Model not found",
        },
      },
      { status: 404 },
    );
  }

  // Exactly `{ units, attributes }` — no label/display.
  return NextResponse.json({
    units: payload.units,
    attributes: payload.attributes,
  });
}

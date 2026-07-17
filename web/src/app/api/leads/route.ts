import { after, NextResponse } from "next/server";
import { leadsService } from "@/server/modules/leads";
import { checkLeadRateLimit } from "@/server/rate-limit";

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limit = checkLeadRateLimit(ip);
  if (!limit.allowed) {
    const retryAfterSec = Math.max(
      1,
      Math.ceil((limit.retryAfterMs ?? 1000) / 1000),
    );
    return NextResponse.json(
      {
        error: {
          code: "RATE_LIMITED",
          message: "Too many lead submissions. Try again later.",
        },
      },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSec) },
      },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid JSON",
        },
      },
      { status: 400 },
    );
  }

  const result = await leadsService.create(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const lead = result.data;
  after(() => {
    void leadsService.notifyLeadCreated(lead);
  });

  return NextResponse.json({ id: lead.id }, { status: 201 });
}

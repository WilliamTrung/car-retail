import { NextResponse } from "next/server";
import { isR2Configured } from "@/lib/r2";

export async function GET() {
  return NextResponse.json({
    ok: true,
    database: Boolean(process.env.DATABASE_URL),
    r2: isR2Configured(),
    timestamp: new Date().toISOString(),
  });
}

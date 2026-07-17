import { NextResponse } from "next/server";

/** Cheap liveness for Docker healthcheck (`wget … /api/health`). No DB. */
export async function GET() {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}

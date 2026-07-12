import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/admin/session";
import { hasRole } from "@/lib/admin/roles";

/** @param {import('next/server').NextRequest} request @param {import('@prisma/client').AdminRole[]=} roles */
export function requireAdmin(request, roles) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (roles && !hasRole(session.role, roles)) {
    return { session: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session, error: null };
}

/** @param {unknown} body @param {string} key */
export function biFromBody(body, key) {
  if (!body || typeof body !== "object") return { vi: "", en: "" };
  const record = /** @type {Record<string, unknown>} */ (body);
  const raw = record[key];
  if (raw && typeof raw === "object") {
    const obj = /** @type {{ vi?: string, en?: string }} */ (raw);
    return { vi: obj.vi ?? "", en: obj.en ?? "" };
  }
  return {
    vi: typeof record[`${key}Vi`] === "string" ? record[`${key}Vi`] : "",
    en: typeof record[`${key}En`] === "string" ? record[`${key}En`] : "",
  };
}

/** @param {{ vi?: string, en?: string }} field */
export function missingEn(field) {
  return Boolean(field.vi?.trim()) && !field.en?.trim();
}

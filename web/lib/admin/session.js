import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "cr_admin";
const MAX_AGE = 60 * 60 * 24 * 7;

function getSecret() {
  return process.env.SESSION_SECRET || "dev-fallback-secret";
}

/** @param {object} payload */
export function createToken(payload) {
  const exp = Date.now() + MAX_AGE * 1000;
  const body = JSON.stringify({ ...payload, exp });
  const sig = createHmac("sha256", getSecret()).update(body).digest("hex");
  return `${Buffer.from(body).toString("base64url")}.${sig}`;
}

/** @param {string | undefined} token */
export function verifyToken(token) {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot < 0) return null;
  const bodyB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const body = Buffer.from(bodyB64, "base64url").toString("utf8");
  const expected = createHmac("sha256", getSecret()).update(body).digest("hex");
  if (sig.length !== expected.length || !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return null;
  }
  const data = JSON.parse(body);
  if (data.exp < Date.now()) return null;
  return data;
}

/** @param {string | undefined} token */
export function parseSession(token) {
  const data = verifyToken(token);
  if (!data) return null;
  return {
    userId: data.userId,
    email: data.email,
    role: data.role,
    name: data.name ?? null,
  };
}

export async function getSession() {
  const jar = await cookies();
  return parseSession(jar.get(SESSION_COOKIE)?.value);
}

/** @param {import('@prisma/client').AdminUser} user */
export async function setSession(user) {
  const token = createToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

/** @param {import('next/server').NextRequest} request */
export function getSessionFromRequest(request) {
  return parseSession(request.cookies.get(SESSION_COOKIE)?.value);
}

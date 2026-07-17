import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/** Hash a password with scrypt (`salt:hash` hex, matches legacy admin password format). */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

/** Verify password against a `salt:hash` stored value (timing-safe). */
export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const test = scryptSync(password, salt, 64).toString("hex");
  if (hash.length !== test.length) return false;
  return timingSafeEqual(Buffer.from(hash), Buffer.from(test));
}

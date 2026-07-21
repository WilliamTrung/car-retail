/**
 * Shared MIME helpers for seed scripts (plain-node; no @/ alias).
 * Keep in sync with src/server/storage/mime.ts.
 */

const EXT_MIME = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  svg: "image/svg+xml",
  ico: "image/x-icon",
  pdf: "application/pdf",
};

const TRUSTED = new Set(Object.values(EXT_MIME));
const UNUSABLE = new Set([
  "",
  "application/octet-stream",
  "binary/octet-stream",
  "text/html",
  "text/plain",
  "application/json",
]);

/** @param {string} filename */
export function extensionFromFilename(filename) {
  const base = filename.split(/[\\/]/).pop() ?? filename;
  const dot = base.lastIndexOf(".");
  if (dot < 0 || dot === base.length - 1) return null;
  return base.slice(dot + 1).toLowerCase();
}

/** @param {string | null | undefined} ext */
export function mimeFromExtension(ext) {
  if (!ext) return null;
  return EXT_MIME[ext.toLowerCase()] ?? null;
}

/** @param {string} filename */
export function mimeFromFilename(filename) {
  return mimeFromExtension(extensionFromFilename(filename));
}

/** @param {string | null | undefined} raw */
export function normalizeMime(raw) {
  if (!raw) return null;
  const base = raw.split(";")[0]?.trim().toLowerCase() ?? "";
  return base || null;
}

/** @param {string | null | undefined} mime */
export function isUsableMediaMime(mime) {
  const n = normalizeMime(mime);
  if (!n || UNUSABLE.has(n)) return false;
  return TRUSTED.has(n) || n.startsWith("image/");
}

/**
 * Prefer a usable declared/header MIME; otherwise derive from extension.
 * Throws when neither yields a trusted type (no octet-stream fallback).
 *
 * @param {{ filename?: string, ext?: string, declaredMime?: string | null }} input
 */
export function resolveSeedContentType(input) {
  const declared = normalizeMime(input.declaredMime);
  if (declared && isUsableMediaMime(declared) && TRUSTED.has(declared)) {
    return declared;
  }
  const ext =
    input.ext?.toLowerCase() ||
    (input.filename ? extensionFromFilename(input.filename) : null);
  const fromExt = mimeFromExtension(ext);
  if (fromExt) return fromExt;
  throw new Error(
    `Cannot determine Content-Type for ext="${ext ?? ""}" file="${input.filename ?? ""}" — refused application/octet-stream fallback`,
  );
}

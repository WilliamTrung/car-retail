/**
 * Derive Content-Type for R2 uploads from filename extension and/or magic
 * bytes. Never silently fall back to application/octet-stream for media.
 */

const EXT_MIME: Record<string, string> = {
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

/** MIME values that must never be stored as object Content-Type for media. */
const UNUSABLE = new Set([
  "",
  "application/octet-stream",
  "binary/octet-stream",
  "text/html",
  "text/plain",
  "application/json",
]);

export function extensionFromFilename(filename: string): string | null {
  const base = filename.split(/[\\/]/).pop() ?? filename;
  const dot = base.lastIndexOf(".");
  if (dot < 0 || dot === base.length - 1) return null;
  return base.slice(dot + 1).toLowerCase();
}

export function mimeFromExtension(ext: string | null | undefined): string | null {
  if (!ext) return null;
  return EXT_MIME[ext.toLowerCase()] ?? null;
}

export function mimeFromFilename(filename: string): string | null {
  return mimeFromExtension(extensionFromFilename(filename));
}

/** Strip parameters (`image/webp; charset=…` → `image/webp`). */
export function normalizeMime(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const base = raw.split(";")[0]?.trim().toLowerCase() ?? "";
  return base || null;
}

export function isUsableMediaMime(mime: string | null | undefined): boolean {
  const n = normalizeMime(mime);
  if (!n || UNUSABLE.has(n)) return false;
  return TRUSTED.has(n) || n.startsWith("image/");
}

/**
 * Magic-byte sniff for common image containers (+ SVG text).
 * Returns null when unrecognized.
 */
export function sniffMimeFromBytes(
  body: Buffer | Uint8Array | null | undefined,
): string | null {
  if (!body || body.byteLength < 4) return null;
  const buf = Buffer.isBuffer(body) ? body : Buffer.from(body);

  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    buf[0] === 0x47 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x38
  ) {
    return "image/gif";
  }
  if (
    buf.byteLength >= 12 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  if (
    buf.byteLength >= 12 &&
    buf.toString("ascii", 4, 8) === "ftyp" &&
    /avif|avis/i.test(buf.toString("ascii", 8, 12))
  ) {
    return "image/avif";
  }

  const head = buf
    .subarray(0, Math.min(256, buf.byteLength))
    .toString("utf8")
    .trimStart();
  if (
    head.startsWith("<svg") ||
    (head.startsWith("<?xml") && /<svg[\s>]/i.test(head))
  ) {
    return "image/svg+xml";
  }
  if (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) {
    return "application/pdf";
  }

  return null;
}

export type ResolveMimeInput = {
  filename: string;
  /** Caller-supplied / browser MIME — ignored when unusable. */
  declaredMime?: string | null;
  body?: Buffer | Uint8Array | null;
};

export type ResolveMimeResult =
  | { ok: true; mimeType: string; source: "declared" | "extension" | "sniff" }
  | { ok: false; message: string };

/**
 * Resolve a Content-Type for upload. Order: usable declared → extension →
 * magic bytes. Hard-fails instead of application/octet-stream.
 */
export function resolveUploadMimeType(input: ResolveMimeInput): ResolveMimeResult {
  const declared = normalizeMime(input.declaredMime);
  if (declared && isUsableMediaMime(declared) && TRUSTED.has(declared)) {
    return { ok: true, mimeType: declared, source: "declared" };
  }

  const fromExt = mimeFromFilename(input.filename);
  if (fromExt) {
    return { ok: true, mimeType: fromExt, source: "extension" };
  }

  const sniffed = sniffMimeFromBytes(input.body);
  if (sniffed) {
    return { ok: true, mimeType: sniffed, source: "sniff" };
  }

  return {
    ok: false,
    message: `Cannot determine Content-Type for "${input.filename}" — refused application/octet-stream fallback`,
  };
}

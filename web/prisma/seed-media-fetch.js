import { existsSync, readFileSync } from "fs";
import { extname, isAbsolute, join } from "path";

const MIME = {
  webp: "image/webp",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  avif: "image/avif",
};

/** @param {string} url */
export function extFromUrl(url) {
  const match = url.match(/\.(\w+)(?:\?|$)/i);
  return match ? match[1].toLowerCase() : "jpg";
}

/**
 * Read a committed seed asset from disk (no network).
 * @param {string} localPath — absolute, or relative to `baseDir`
 * @param {string} baseDir
 */
export function readLocalSeedImage(localPath, baseDir) {
  const abs = isAbsolute(localPath) ? localPath : join(baseDir, localPath);
  if (!existsSync(abs)) {
    throw new Error(`Local seed asset missing: ${abs}`);
  }
  const buffer = readFileSync(abs);
  const ext = extname(abs).slice(1).toLowerCase() || "jpg";
  const contentType = MIME[ext] || `image/${ext}`;
  return { buffer, contentType, ext, absPath: abs };
}

/** @param {string} url */
export async function fetchSeedImage(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "car-retail-seed/1.0 (+dealer reference import)",
      Accept: "image/*,*/*",
    },
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") || `image/${extFromUrl(url)}`;
  const ext = extFromUrl(url);
  return { buffer, contentType, ext };
}

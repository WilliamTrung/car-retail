import { describe, expect, it } from "vitest";
import {
  extensionFromFilename,
  isUsableMediaMime,
  mimeFromExtension,
  mimeFromFilename,
  resolveUploadMimeType,
  sniffMimeFromBytes,
} from "@/server/storage/mime";

describe("mimeFromExtension / mimeFromFilename", () => {
  it("maps svg to image/svg+xml", () => {
    expect(mimeFromExtension("svg")).toBe("image/svg+xml");
    expect(mimeFromFilename("news/vf-hero.svg")).toBe("image/svg+xml");
  });

  it("maps common rasters", () => {
    expect(mimeFromFilename("gallery/a.webp")).toBe("image/webp");
    expect(mimeFromFilename("x.JPG")).toBe("image/jpeg");
    expect(mimeFromFilename("y.png")).toBe("image/png");
  });

  it("returns null for unknown extensions", () => {
    expect(mimeFromFilename("a.bin")).toBeNull();
    expect(extensionFromFilename("noext")).toBeNull();
  });
});

describe("isUsableMediaMime", () => {
  it("rejects octet-stream / html / empty", () => {
    expect(isUsableMediaMime("application/octet-stream")).toBe(false);
    expect(isUsableMediaMime("text/html")).toBe(false);
    expect(isUsableMediaMime("")).toBe(false);
    expect(isUsableMediaMime(null)).toBe(false);
  });

  it("accepts trusted image types", () => {
    expect(isUsableMediaMime("image/svg+xml")).toBe(true);
    expect(isUsableMediaMime("image/webp; charset=binary")).toBe(true);
  });
});

describe("resolveUploadMimeType", () => {
  it("ignores unusable declared MIME and uses extension", () => {
    const r = resolveUploadMimeType({
      filename: "hero.svg",
      declaredMime: "application/octet-stream",
    });
    expect(r).toEqual({
      ok: true,
      mimeType: "image/svg+xml",
      source: "extension",
    });
  });

  it("hard-fails when no extension and no sniffable bytes", () => {
    const r = resolveUploadMimeType({
      filename: "blob",
      declaredMime: "application/octet-stream",
      body: Buffer.from([0, 1, 2, 3]),
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.message).toMatch(/refused application\/octet-stream/);
    }
  });

  it("sniffs PNG magic bytes when filename has no extension", () => {
    const png = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0,
    ]);
    const r = resolveUploadMimeType({ filename: "upload", body: png });
    expect(r).toEqual({ ok: true, mimeType: "image/png", source: "sniff" });
  });

  it("sniffs SVG text", () => {
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>');
    expect(sniffMimeFromBytes(svg)).toBe("image/svg+xml");
  });

  it("keeps usable declared MIME when trusted", () => {
    const r = resolveUploadMimeType({
      filename: "a.webp",
      declaredMime: "image/webp",
    });
    expect(r).toEqual({
      ok: true,
      mimeType: "image/webp",
      source: "declared",
    });
  });
});

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { uploadToR2, isR2Configured } from "@/lib/r2";
import { randomBytes } from "crypto";

const FOLDERS = new Set(["VEHICLES", "HEROES", "NEWS", "POLICIES", "SITE"]);

export async function GET(request) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;

  const folder = request.nextUrl.searchParams.get("folder");
  const where = folder && FOLDERS.has(folder) ? { folder } : {};

  const assets = await prisma.mediaAsset.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(assets);
}

export async function POST(request) {
  const { error } = requireAdmin(request, ["SUPER_ADMIN", "EDITOR"]);
  if (error) return error;

  if (!isR2Configured()) {
    return NextResponse.json({ error: "R2 not configured" }, { status: 503 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const folder = String(form.get("folder") || "SITE");
  const altVi = String(form.get("altVi") || "");
  const altEn = String(form.get("altEn") || "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File required" }, { status: 400 });
  }
  if (!FOLDERS.has(folder)) {
    return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
  }

  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const prefix = folder.toLowerCase();
  const key = `${prefix}/${randomBytes(8).toString("hex")}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const publicUrl = await uploadToR2(key, buffer, file.type || "application/octet-stream");

  const asset = await prisma.mediaAsset.create({
    data: {
      r2Key: key,
      publicUrl,
      folder,
      mimeType: file.type || null,
      sizeBytes: buffer.length,
      altText: { vi: altVi, en: altEn },
    },
  });

  return NextResponse.json(asset, { status: 201 });
}

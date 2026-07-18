import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import {
  deleteFromR2,
  isR2Configured,
  listAllR2Keys,
  uploadToR2,
} from "./seed-media-r2.js";
import { SEED_MEDIA_ASSETS, SEED_MEDIA_FALLBACKS } from "./seed-media-data.js";
import { fetchSeedImage, readLocalSeedImage } from "./seed-media-fetch.js";
import { renderSeedSvg } from "./seed-media-svg.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const URLS_FILE = join(__dirname, "seed-media-urls.js");
const DATA_FILE = join(__dirname, "seed-media-data.js");

/** Delivery gallery rows → media IDs in seed-media-data.js */
const DELIVERY_PHOTO_MEDIA_LINKS = {
  "seed-delivery-1": "seed-media-delivery-1",
  "seed-delivery-2": "seed-media-delivery-2",
  "seed-delivery-3": "seed-media-delivery-3",
  "seed-delivery-4": "seed-media-delivery-4",
  "seed-delivery-5": "seed-media-delivery-5",
};

/** Feature sections → gallery media (re-link after clearMedia nulls FKs) */
const FEATURE_SECTION_MEDIA_LINKS = {
  "seed-feature-city-turning": "seed-media-city-ev-g1",
  "seed-feature-city-infotainment": "seed-media-city-ev-g2",
  "seed-feature-city-safety": "seed-media-city-ev-g3",
};

/** @param {import("@prisma/client").PrismaClient} prisma */
export async function clearMediaFromDatabase(prisma) {
  await prisma.vehicleModel.updateMany({ data: { heroMediaId: null } });
  await prisma.heroSlide.updateMany({ data: { imageMediaId: null } });
  await prisma.newsPost.updateMany({ data: { featuredMediaId: null } });
  await prisma.featureSection.updateMany({ data: { imageMediaId: null } });
  await prisma.siteSettings.updateMany({
    data: { logoMediaId: null, faviconMediaId: null },
  });
  await prisma.policyDocument.updateMany({ data: { pdfMediaId: null } });
  await prisma.deliveryPhoto.updateMany({ data: { imageMediaId: null } });
  return prisma.mediaAsset.deleteMany({});
}

/**
 * Resilient link: updateMany never throws P2025 — a missing target row
 * (e.g. media manifest run against a dataset it wasn't generated for)
 * yields count 0 and the caller skips + warns instead of crashing the run.
 *
 * @param {import("@prisma/client").PrismaClient} db — prisma or tx client
 * @param {{ table: string, entityId: string, field: string }} link
 * @param {string} mediaId
 * @returns {Promise<boolean>} true if the target row existed and was linked
 */
export async function linkMedia(db, link, mediaId) {
  const tables = {
    vehicleModel: db.vehicleModel,
    heroSlide: db.heroSlide,
    newsPost: db.newsPost,
    deliveryPhoto: db.deliveryPhoto,
    featureSection: db.featureSection,
  };
  const table = tables[link.table];
  if (!table) {
    throw new Error(`Unsupported media link table: ${link.table}`);
  }
  const { count } = await table.updateMany({
    where: { id: link.entityId },
    data: { [link.field]: mediaId },
  });
  return count > 0;
}

/** @param {string} id @param {string} primary @param {string[]} fallbacks */
async function fetchWithFallbacks(id, primary, fallbacks = []) {
  const urls = [primary, ...fallbacks];
  let lastErr;
  for (const url of urls) {
    try {
      const fetched = await fetchSeedImage(url);
      return { ...fetched, sourceUrl: url };
    } catch (err) {
      lastErr = err;
      console.warn(`  warn ${id}: failed ${url} — ${err.message}`);
    }
  }
  throw lastErr ?? new Error(`No source URL for ${id}`);
}

/** @param {{ id: string, folder: string, altText?: { vi?: string, en?: string }, svg?: object }} entry */
function svgSpecForEntry(entry) {
  if (entry.svg) return entry.svg;
  const label =
    entry.altText?.en || entry.altText?.vi || entry.id.replace(/^seed-media-/, "");
  if (entry.folder === "HEROES") {
    return { kind: "hero", label, hueSeed: entry.id };
  }
  if (entry.folder === "NEWS") {
    return { kind: "news", label, hueSeed: entry.id };
  }
  const bodyType = /van|cargo/i.test(entry.id)
    ? "van"
    : /mpv|limo|minio/i.test(entry.id)
      ? "mpv"
      : /suv|family/i.test(entry.id)
        ? "suv"
        : "compact";
  return { kind: "vehicle", bodyType, label, hueSeed: entry.id };
}

/**
 * Prefer committed local raster → optional network URL → SVG last resort.
 * @param {{ id: string, r2Key: string, localFile?: string, sourceUrl?: string, sourceSite?: string, svg?: object, folder: string, altText: object }} entry
 */
async function buildUploadPayload(entry) {
  if (entry.localFile) {
    try {
      const { buffer, contentType, ext } = readLocalSeedImage(
        entry.localFile,
        __dirname,
      );
      const r2Key = entry.r2Key.includes(".")
        ? entry.r2Key
        : `${entry.r2Key}.${ext}`;
      return {
        buffer,
        contentType,
        r2Key,
        sourceUrl: `file:${entry.localFile}`,
        origin: "local",
      };
    } catch (err) {
      console.warn(
        `  warn ${entry.id}: local file failed — ${err.message}`,
      );
    }
  }

  if (entry.sourceUrl) {
    const fallbacks = SEED_MEDIA_FALLBACKS[entry.id] ?? [];
    try {
      const { buffer, contentType, ext, sourceUrl } = await fetchWithFallbacks(
        entry.id,
        entry.sourceUrl,
        fallbacks,
      );
      const r2Key = entry.r2Key.includes(".")
        ? entry.r2Key
        : `${entry.r2Key}.${ext}`;
      return { buffer, contentType, r2Key, sourceUrl, origin: "fetch" };
    } catch (err) {
      console.warn(
        `  warn ${entry.id}: all fetches failed — using SVG placeholder (${err.message})`,
      );
    }
  }

  const svg = renderSeedSvg(svgSpecForEntry(entry));
  const buffer = Buffer.from(svg, "utf8");
  const baseKey = entry.r2Key.replace(/\.[^.]+$/, "");
  const r2Key = `${baseKey}.svg`;
  return {
    buffer,
    contentType: "image/svg+xml",
    r2Key,
    sourceUrl: null,
    origin: "svg",
  };
}

/** @param {Array<{ id: string, r2Key: string, publicUrl: string, sourceUrl?: string }>} results */
function writeSeedMediaArtifacts(results) {
  const lines = [
    "// AUTO-GENERATED by npm run db:seed:media — do not edit by hand",
    `// Generated: ${new Date().toISOString()}`,
    "",
    "/** @type {Record<string, { id: string, r2Key: string, publicUrl: string, sourceUrl?: string }>} */",
    "export const SEED_MEDIA_URLS = {",
  ];

  for (const row of results) {
    const sourcePart = row.sourceUrl ? `, sourceUrl: "${row.sourceUrl}"` : "";
    lines.push(
      `  "${row.id}": { id: "${row.id}", r2Key: "${row.r2Key}", publicUrl: "${row.publicUrl}"${sourcePart} },`,
    );
  }

  lines.push("};", "");
  writeFileSync(URLS_FILE, lines.join("\n"), "utf8");

  let manifest = readFileSync(DATA_FILE, "utf8");
  for (const row of results) {
    // Manifest may use JSON-ish "id": "…" or unquoted id: "…" keys
    manifest = manifest.replace(
      new RegExp(
        `((?:"id"|id):\\s*"${row.id}"[\\s\\S]*?(?:"publicUrl"|publicUrl):\\s*)"[^"]*"`,
        "m",
      ),
      `$1"${row.publicUrl}"`,
    );
    manifest = manifest.replace(
      new RegExp(
        `((?:"id"|id):\\s*"${row.id}"[\\s\\S]*?(?:"r2Key"|r2Key):\\s*)"[^"]*"`,
        "m",
      ),
      `$1"${row.r2Key}"`,
    );
  }
  writeFileSync(DATA_FILE, manifest, "utf8");
}

/**
 * Media seed, ordered so a failure never leaves prod media emptier than it
 * started:
 *
 *   1. fetch every payload (network / SVG fallback) — no writes anywhere
 *   2. upload all payloads to R2 (stable keys overwrite in place; existing
 *      objects are NOT deleted yet)
 *   3. swap MediaAsset rows + CMS links in ONE transaction — a crash rolls
 *      back to the prior media set
 *   4. only after the swap commits, --purge deletes STALE R2 keys (objects
 *      not part of this seed) — never the freshly uploaded ones
 *
 * Links whose target rows are absent (manifest / DB dataset mismatch) are
 * skipped with a warning instead of aborting with P2025.
 *
 * @param {import("@prisma/client").PrismaClient} prisma
 * @param {{ purge?: boolean }} [opts] — purge defaults false; set via --purge / SEED_MEDIA_PURGE=1
 */
export async function runSeedMedia(prisma, opts = {}) {
  const purge = opts.purge === true;

  if (!isR2Configured()) {
    throw new Error(
      "R2 not configured. Set STORAGE_S3_ENDPOINT/BUCKET/ACCESS_KEY/SECRET_KEY/PUBLIC_URL",
    );
  }

  console.log("Stage 1/4 — loading source images (no writes yet)…");
  const payloads = [];
  for (const entry of SEED_MEDIA_ASSETS) {
    const payload = await buildUploadPayload(entry);
    payloads.push({ entry, ...payload });
    const origin =
      payload.origin === "local"
        ? "local"
        : payload.origin === "fetch"
          ? entry.sourceSite ?? "fetch"
          : "svg";
    console.log(`  ${entry.id} ← ${origin}`);
  }

  console.log("Stage 2/4 — uploading to R2 (existing objects kept)…");
  for (const payload of payloads) {
    payload.publicUrl = await uploadToR2(
      payload.r2Key,
      payload.buffer,
      payload.contentType,
    );
    console.log(`  ${payload.entry.id} → ${payload.publicUrl}`);
  }

  console.log("Stage 3/4 — swapping MediaAsset rows + links (transaction)…");
  const skippedLinks = [];
  await prisma.$transaction(
    async (tx) => {
      const { count } = await clearMediaFromDatabase(tx);
      console.log(`  replaced ${count} prior MediaAsset row(s)`);

      for (const payload of payloads) {
        const { entry } = payload;
        await tx.mediaAsset.create({
          data: {
            id: entry.id,
            r2Key: payload.r2Key,
            publicUrl: payload.publicUrl,
            folder: entry.folder,
            mimeType: payload.contentType,
            sizeBytes: payload.buffer.length,
            altText: entry.altText,
          },
        });

        if (entry.link) {
          const linked = await linkMedia(tx, entry.link, entry.id);
          if (!linked) skippedLinks.push(entry.link);
        }
      }

      for (const [deliveryId, mediaId] of Object.entries(
        DELIVERY_PHOTO_MEDIA_LINKS,
      )) {
        const linked = await linkMedia(
          tx,
          { table: "deliveryPhoto", entityId: deliveryId, field: "imageMediaId" },
          mediaId,
        );
        if (!linked) {
          skippedLinks.push({
            table: "deliveryPhoto",
            entityId: deliveryId,
            field: "imageMediaId",
          });
        }
      }

      for (const [featureId, mediaId] of Object.entries(
        FEATURE_SECTION_MEDIA_LINKS,
      )) {
        const linked = await linkMedia(
          tx,
          {
            table: "featureSection",
            entityId: featureId,
            field: "imageMediaId",
          },
          mediaId,
        );
        if (!linked) {
          skippedLinks.push({
            table: "featureSection",
            entityId: featureId,
            field: "imageMediaId",
          });
        }
      }
    },
    // uploads already happened; the transaction is DB-only but touches ~35 rows
    { maxWait: 15_000, timeout: 120_000 },
  );

  for (const link of skippedLinks) {
    console.warn(
      `  warn: link skipped — no ${link.table} row with id "${link.entityId}"`,
    );
  }
  const modelLinks = SEED_MEDIA_ASSETS.filter(
    (e) => e.link?.table === "vehicleModel",
  ).length;
  const skippedModelLinks = skippedLinks.filter(
    (l) => l.table === "vehicleModel",
  ).length;
  if (modelLinks > 0 && skippedModelLinks === modelLinks) {
    console.warn(
      "  warn: NO vehicle models matched this manifest — run `npm run db:seed` first\n" +
        "  (generic catalog), then re-run db:seed:media.",
    );
  }

  if (purge) {
    console.log(
      "Stage 4/4 — purging STALE R2 objects (--purge / SEED_MEDIA_PURGE=1)…",
    );
    const keep = new Set(payloads.map((p) => p.r2Key));
    const staleKeys = (await listAllR2Keys()).filter((key) => !keep.has(key));
    for (const key of staleKeys) {
      await deleteFromR2(key);
    }
    console.log(`  deleted ${staleKeys.length} stale object(s) from R2`);
  } else {
    console.log(
      "Stage 4/4 — skipping R2 purge. Pass --purge or SEED_MEDIA_PURGE=1 to delete stale objects.",
    );
  }

  const results = payloads.map((p) => ({
    id: p.entry.id,
    r2Key: p.r2Key,
    publicUrl: p.publicUrl,
    sourceUrl: p.sourceUrl ?? p.entry.sourceUrl,
  }));

  try {
    writeSeedMediaArtifacts(results);
    console.log(`Wrote ${URLS_FILE} and updated seed-media-data.js`);
  } catch (err) {
    // DB + R2 already consistent — artifact write is best-effort (read-only fs in containers)
    console.warn(`  warn: could not write seed artifacts — ${err.message}`);
  }

  return results;
}

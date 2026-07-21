/**
 * DEV / TEST ONLY — fetches vehicle & banner images from vinfastdongsaigon.vn,
 * uploads to R2, and links them in the CMS for local UI testing.
 *
 * DO NOT run in production. Replace with your own assets before deploy.
 *
 *   npm run db:seed:media:reference
 *
 * Requires STORAGE_S3_* in web/.env
 */
import { PrismaClient } from "@prisma/client";
import { loadDotenv } from "../prisma/load-dotenv.js";
import { resolveSeedContentType } from "../prisma/seed-media-mime.js";
import { isR2Configured, uploadToR2 } from "../src/server/storage/r2.ts";

loadDotenv();

const prisma = new PrismaClient();

const BASE = "https://vinfastdongsaigon.vn/wp-content/uploads";

/** @type {Record<string, string>} slug (vi) → source URL */
const MODEL_IMAGES = {
  "velo-x3": `${BASE}/2022/11/vf3-thumb_1715586838.png`,
  "velo-x5": `${BASE}/2022/11/VF5_1711360061.png`,
  "velo-x6": `${BASE}/2022/11/VF6_1711360087.png`,
  "velo-x7": `${BASE}/2022/11/VF7_1711360187.png`,
  "velo-x8": `${BASE}/2022/11/VF8_1711360212.png`,
  "velo-x9": `${BASE}/2022/11/VF9_1711360238.png`,
  "velo-m7": `${BASE}/2024/05/vf5-7.png`,
  "velo-mini-green": `${BASE}/2025/04/MinioGreen.png`,
  "velo-h5-green": `${BASE}/2025/04/HerioGreen.png`,
  "velo-l7-green": `${BASE}/2025/04/LimoGreen.png`,
  "velo-cargo-van": `${BASE}/2025/05/ecvan-02-1.png`,
  "city-ev-compact": `${BASE}/2022/11/vf3-thumb_1715586838.png`,
  "family-suv-electric": `${BASE}/2022/11/VF8_1711360212.png`,
  "urban-mpv-plus": `${BASE}/2022/11/vf-mpv-7_hover.png`,
  "cargo-van-e": `${BASE}/2025/05/ecvan-02-1.png`,
};

/** @type {Record<string, string>} hero slide id → source URL */
const HERO_IMAGES = {
  "seed-hero-1": `${BASE}/2025/03/banner-20250326_0.png`,
  "mock-hero-summer": `${BASE}/2026/06/vinfast-vf3-uu-dai-he-vinpearl-desktop-scaled.png`,
  "mock-hero-m7": `${BASE}/2026/06/vinfast-vf-mpv7-uu-dai-124-trieu-mobile.png`,
  "mock-hero-x3": `${BASE}/2026/06/vinfast-vinfascination-uu-dai-3-vinpearl-mobile.png`,
};

/** @type {string[]} news featured images (rotated by sort order) */
const NEWS_IMAGES = [
  `${BASE}/2022/11/VF8.png`,
  `${BASE}/2022/11/VF9.png`,
  `${BASE}/2024/05/vf5-7.png`,
  `${BASE}/2024/06/MAT-TIEN.jpg`,
];

function bi(vi, en) {
  return { vi, en };
}

/** @param {string} url */
function extFromUrl(url) {
  const match = url.match(/\.(\w+)(?:\?|$)/);
  return match ? match[1].toLowerCase() : "jpg";
}

/** @param {string} url */
async function fetchImage(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "car-retail-dev-seed/1.0 (+local testing)",
      Accept: "image/*,*/*",
    },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const ext = extFromUrl(url);
  const contentType = resolveSeedContentType({
    filename: url,
    ext,
    declaredMime: res.headers.get("content-type"),
  });
  return { buffer, contentType, ext };
}

/**
 * @param {string} r2Key
 * @param {string} sourceUrl
 * @param {string} folder
 * @param {string} altVi
 * @param {string} altEn
 */
async function uploadReference(r2Key, sourceUrl, folder, altVi, altEn) {
  const existing = await prisma.mediaAsset.findFirst({ where: { r2Key } });
  const { buffer, contentType, ext } = await fetchImage(sourceUrl);
  const key = r2Key.endsWith(`.${ext}`) ? r2Key : `${r2Key}.${ext}`;
  const publicUrl = await uploadToR2(key, buffer, contentType);

  if (existing) {
    return prisma.mediaAsset.update({
      where: { id: existing.id },
      data: { publicUrl, mimeType: contentType, sizeBytes: buffer.length, altText: bi(altVi, altEn) },
    });
  }

  return prisma.mediaAsset.create({
    data: {
      r2Key: key,
      publicUrl,
      folder,
      mimeType: contentType,
      sizeBytes: buffer.length,
      altText: bi(altVi, altEn),
    },
  });
}

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_REFERENCE_MEDIA_SEED !== "true") {
    console.error("Blocked: reference media seed is for dev/test only.");
    console.error("Set ALLOW_REFERENCE_MEDIA_SEED=true to override (not recommended).");
    process.exit(1);
  }

  if (!isR2Configured()) {
    console.error("R2 not configured. Set STORAGE_S3_* in web/.env");
    process.exit(1);
  }

  console.log("Fetching reference images (dev/test) from vinfastdongsaigon.vn → R2…");

  const models = await prisma.vehicleModel.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });

  for (const model of models) {
    const slug = /** @type {{ vi?: string }} */ (model.slug).vi;
    const name = /** @type {{ vi?: string }} */ (model.name).vi || slug;
    const sourceUrl = slug ? MODEL_IMAGES[slug] : null;
    if (!sourceUrl) {
      console.log(`  skip model (no mapping): ${name} [${slug}]`);
      continue;
    }

    const asset = await uploadReference(
      `dev-reference/vehicles/${slug}`,
      sourceUrl,
      "VEHICLES",
      `[DEV] ${name}`,
      `[DEV] ${name}`
    );
    await prisma.vehicleModel.update({
      where: { id: model.id },
      data: { heroMediaId: asset.id },
    });
    console.log(`  model: ${name} ← ${sourceUrl}`);
  }

  const slides = await prisma.heroSlide.findMany({ where: { published: true } });
  for (const slide of slides) {
    const sourceUrl = HERO_IMAGES[slide.id];
    if (!sourceUrl) continue;
    const title = /** @type {{ vi?: string }} */ (slide.title).vi || slide.id;
    const asset = await uploadReference(
      `dev-reference/heroes/${slide.id}`,
      sourceUrl,
      "HEROES",
      `[DEV] ${title}`,
      `[DEV] ${title}`
    );
    await prisma.heroSlide.update({
      where: { id: slide.id },
      data: { imageMediaId: asset.id },
    });
    console.log(`  hero: ${title} ← ${sourceUrl}`);
  }

  const posts = await prisma.newsPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
    take: NEWS_IMAGES.length,
  });

  for (const [i, post] of posts.entries()) {
    const sourceUrl = NEWS_IMAGES[i];
    const title = /** @type {{ vi?: string }} */ (post.title).vi || post.id;
    const slug = /** @type {{ vi?: string }} */ (post.slug).vi || post.id;
    const asset = await uploadReference(
      `dev-reference/news/${slug}`,
      sourceUrl,
      "NEWS",
      `[DEV] ${title}`,
      `[DEV] ${title}`
    );
    await prisma.newsPost.update({
      where: { id: post.id },
      data: { featuredMediaId: asset.id },
    });
    console.log(`  news: ${title} ← ${sourceUrl}`);
  }

  console.log("Reference media seed complete (dev/test only — replace before production).");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

/**
 * Generate prisma/seed-scraped.js and prisma/seed-media-data.js from manifest.
 * Usage: npm run scrape:generate
 */
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { lineForSegment, filterCatalogModels, sanitizeSlug, cleanModelName } from "./normalize.js";
import { enrichModel } from "./copy.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = join(__dirname, "output", "manifest.json");
const SEED_SCRAPED = join(__dirname, "../../prisma/seed-scraped.js");
const SEED_MEDIA_DATA = join(__dirname, "../../prisma/seed-media-data.js");
const LAYOUT_DOC = join(__dirname, "../../../docs/reference-site-layouts.md");

function slugify(s) {
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function extFromUrl(url) {
  const m = url?.match(/\.(png|jpe?g|webp|gif)/i);
  return m ? m[1].toLowerCase().replace("jpeg", "jpg") : "jpg";
}

function jsString(v) {
  return JSON.stringify(v);
}

function buildMediaAssets(manifest) {
  const assets = [];
  const fallbacks = {};

  for (const model of manifest.models) {
    const hero = model.images.find((i) => i.role === "hero") || model.images[0];
    if (hero) {
      const id = `seed-media-${model.key}-hero`;
      assets.push({
        id,
        r2Key: `vehicles/${model.key}-hero.${extFromUrl(hero.url)}`,
        sourceUrl: hero.url,
        sourceSite: hero.sourceSite || "reference",
        publicUrl: "",
        folder: "VEHICLES",
        altText: { vi: `Ảnh ${model.name.vi}`, en: `${model.name.en} image` },
        link: { table: "vehicleModel", entityId: `seed-model-${model.key}`, field: "heroMediaId" },
      });
    }
  }

  for (const [i, hero] of (manifest.heroes || []).entries()) {
    if (!hero.imageUrl) continue;
    assets.push({
      id: `seed-media-hero-${i + 1}`,
      r2Key: `heroes/seed-hero-${i + 1}.${extFromUrl(hero.imageUrl)}`,
      sourceUrl: hero.imageUrl,
      sourceSite: hero.sourceSite || "reference",
      publicUrl: "",
      folder: "HEROES",
      altText: { vi: hero.title?.vi || "Banner", en: hero.title?.en || "Banner" },
      link: { table: "heroSlide", entityId: `seed-hero-${i + 1}`, field: "imageMediaId" },
    });
  }

  for (const [i, item] of (manifest.news || []).slice(0, 3).entries()) {
    if (!item.imageUrl) continue;
    assets.push({
      id: `seed-media-news-${i + 1}`,
      r2Key: `news/${slugify(item.title?.vi || `news-${i + 1}`)}.${extFromUrl(item.imageUrl)}`,
      sourceUrl: item.imageUrl,
      sourceSite: item.sourceSite || "reference",
      publicUrl: "",
      folder: "NEWS",
      altText: { vi: item.title?.vi || "Tin tức", en: item.title?.en || "News" },
      link: { table: "newsPost", entityId: `seed-news-${i + 1}`, field: "featuredMediaId" },
    });
  }

  return { assets, fallbacks };
}

function buildSeedScrapedSource(manifest) {
  const segments = [...new Set(manifest.models.map((m) => m.segment))];
  const lines = [...new Set(segments.map(lineForSegment))];

  const linesCode = lines
    .map(
      (key, i) => `  lineIds[${jsString(key)}] = (await prisma.vehicleLine.upsert({
    where: { key: ${jsString(key)} },
    update: {},
    create: { key: ${jsString(key)}, name: bi(${jsString(key === "commercial" ? "Xe thương mại" : "Xe cá nhân")}, ${jsString(key === "commercial" ? "Commercial vehicles" : "Personal vehicles")}), sortOrder: ${i + 1} },
  })).id;`
    )
    .join("\n");

  const segmentsCode = segments
    .map((key, i) => {
      const lineKey = lineForSegment(key);
      return `  segmentIds[${jsString(key)}] = (await prisma.vehicleSegment.upsert({
    where: { lineId_key: { lineId: lineIds[${jsString(lineKey)}], key: ${jsString(key)} } },
    update: {},
    create: { lineId: lineIds[${jsString(lineKey)}], key: ${jsString(key)}, name: bi(${jsString(key.toUpperCase())}, ${jsString(key.toUpperCase())}), sortOrder: ${i + 1} },
  })).id;`;
    })
    .join("\n");

  const modelsCode = manifest.models
    .map((m, i) => {
      const variantsCode = (m.variants || [{ name: { vi: "Tiêu chuẩn", en: "Standard" } }])
        .map(
          (v, vi) => `    await prisma.vehicleVariant.upsert({
      where: { id: ${jsString(`seed-variant-${m.key}-${vi + 1}`)} },
      update: { name: ${jsString(v.name)}, price: ${v.price ?? "null"}, attributes: ${jsString(m.attributes || [])}, published: true, sortOrder: ${vi + 1} },
      create: { id: ${jsString(`seed-variant-${m.key}-${vi + 1}`)}, modelId, name: ${jsString(v.name)}, price: ${v.price ?? "null"}, attributes: ${jsString(m.attributes || [])}, published: true, sortOrder: ${vi + 1} },
    });`
        )
        .join("\n");

      const featuresCode = (m.featureSections || [])
        .slice(0, 4)
        .map(
          (f, fi) => `    await prisma.featureSection.upsert({
      where: { id: ${jsString(`seed-feature-${m.key}-${fi + 1}`)} },
      update: { title: ${jsString(f.title)}, body: ${jsString(f.body)}, sortOrder: ${fi + 1} },
      create: { id: ${jsString(`seed-feature-${m.key}-${fi + 1}`)}, modelId, title: ${jsString(f.title)}, body: ${jsString(f.body)}, sortOrder: ${fi + 1} },
    });`
        )
        .join("\n");

      return `  {
    const modelId = ${jsString(`seed-model-${m.key}`)};
    await prisma.vehicleModel.upsert({
      where: { id: modelId },
      update: { name: ${jsString(m.name)}, slug: ${jsString(m.slug)}, tagline: ${jsString(m.tagline)}, description: ${jsString(m.description)}, attributes: ${jsString(m.attributes || [])}, published: true, sortOrder: ${i + 1} },
      create: { id: modelId, segmentId: segmentIds[${jsString(m.segment)}], name: ${jsString(m.name)}, slug: ${jsString(m.slug)}, tagline: ${jsString(m.tagline)}, description: ${jsString(m.description)}, attributes: ${jsString(m.attributes || [])}, published: true, sortOrder: ${i + 1} },
    });
${variantsCode}
${featuresCode}
  }`;
    })
    .join("\n");

  const heroesCode = (manifest.heroes || [])
    .slice(0, 5)
    .map(
      (h, i) => `  await prisma.heroSlide.upsert({
    where: { id: ${jsString(`seed-hero-${i + 1}`)} },
    update: { title: ${jsString(h.title)}, subtitle: ${jsString(h.subtitle || { vi: "Ưu đãi", en: "Offer" })}, ctaLabel: bi("Đăng ký lái thử", "Book test drive"), ctaRouteKey: "/book-test-drive", sortOrder: ${i + 1}, published: true },
    create: { id: ${jsString(`seed-hero-${i + 1}`)}, title: ${jsString(h.title)}, subtitle: ${jsString(h.subtitle || { vi: "Ưu đãi", en: "Offer" })}, ctaLabel: bi("Đăng ký lái thử", "Book test drive"), ctaRouteKey: "/book-test-drive", sortOrder: ${i + 1}, published: true },
  });`
    )
    .join("\n");

  const newsCode = (manifest.news || [])
    .slice(0, 3)
    .map((n, i) => {
      const slug = { vi: slugify(n.title?.vi || `tin-${i + 1}`), en: slugify(n.title?.en || `news-${i + 1}`) };
      return `  await prisma.newsPost.upsert({
    where: { id: ${jsString(`seed-news-${i + 1}`)} },
    update: { slug: ${jsString(slug)}, title: ${jsString(n.title)}, excerpt: ${jsString(n.title)}, body: ${jsString(n.title)}, published: true, featured: ${i === 0}, publishedAt: new Date() },
    create: { id: ${jsString(`seed-news-${i + 1}`)}, slug: ${jsString(slug)}, title: ${jsString(n.title)}, excerpt: ${jsString(n.title)}, body: ${jsString(n.title)}, published: true, featured: ${i === 0}, publishedAt: new Date() },
  });`;
    })
    .join("\n");

  return `/** AUTO-GENERATED — dev reference seed (${manifest.models.length} models). Regenerate: npm run scrape:generate */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function bi(vi, en) {
  return { vi, en: en || vi };
}

export async function runScrapedSeed() {
  console.log("Scraped catalog seed…");

  const lineIds = {};
${linesCode}

  const segmentIds = {};
${segmentsCode}

${modelsCode}

${heroesCode}

${newsCode}

  console.log("Scraped catalog seed complete (${manifest.models.length} models).");
}

async function main() {
  await runScrapedSeed();
}

if (process.argv[1]?.endsWith("seed-scraped.js")) {
  main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
}
`;
}

function buildMediaDataSource(assets, fallbacks) {
  return `/** AUTO-GENERATED — dev reference media manifest */
function bi(vi, en) {
  return { vi, en: en || vi };
}

export const SEED_MEDIA_ASSETS = ${JSON.stringify(assets, null, 2)};

export const SEED_MEDIA_FALLBACKS = ${JSON.stringify(fallbacks, null, 2)};
`;
}

function buildLayoutDoc(manifest) {
  const ln = manifest.layoutNotes || {};
  return `# Reference site layouts (scraped)

> Dev reference only — scraped ${manifest.scrapedAt}. Replace assets/copy before launch per [project-context.md](./project-context.md).

## Product list (dealer home)

${ln.listPage?.notes || "Model lineup via nav links and homepage cards."}

| Pattern | car-retail component |
|---------|---------------------|
| Model card grid | \`VehicleCard\` on home lineup |
| Price-from | \`formatPriceFrom()\` from variants |
| Nav model links | Header \`MenuItem\` |

## Model detail (dealer)

${ln.detailPage?.notes || "Hero image + marketing H2 sections + CTAs."}

| Reference section | car-retail component |
|-------------------|---------------------|
| Hero image | \`heroMedia\` |
| Spec strip | \`SpecStrip\` |
| Variants / pricing | Model page variant list |
| Feature blocks | \`FeatureSection\` |
| Test-drive CTA | \`ctaTestDrive\` |

## OEM (vinfastauto.com)

JS SPA — Playwright required. OEM preferred for specs; dealers for pricing/images.

## Catalog (${manifest.models.length} models)

${manifest.models.map((m) => `- **${m.name?.vi || m.key}** (\`${m.key}\`) — ${(m.sources || []).map((s) => s.site).join(", ")}`).join("\n")}
`;
}

function main() {
  const raw = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
  const manifest = {
    ...raw,
    models: filterCatalogModels(raw.models).map((m) =>
      enrichModel({
        ...m,
        name: { vi: cleanModelName(m.name?.vi), en: cleanModelName(m.name?.en || m.name?.vi) },
        slug: sanitizeSlug(m.slug, m.key),
      })
    ),
  };
  const { assets, fallbacks } = buildMediaAssets(manifest);
  writeFileSync(SEED_SCRAPED, buildSeedScrapedSource(manifest), "utf8");
  writeFileSync(SEED_MEDIA_DATA, buildMediaDataSource(assets, fallbacks), "utf8");
  writeFileSync(LAYOUT_DOC, buildLayoutDoc(manifest), "utf8");
  console.log(`Generated seed-scraped.js (${manifest.models.length} models), seed-media-data.js (${assets.length} assets), reference-site-layouts.md`);
}

main();

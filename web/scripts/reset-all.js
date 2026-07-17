/**
 * Wipe catalog/CMS/media/leads; keep units, attribute keys, templates, admin.
 * R2 bucket purge requires --purge or SEED_MEDIA_PURGE=1 (not silent).
 * Usage: npx tsx scripts/reset-all.js --purge
 */
import { PrismaClient } from "@prisma/client";
import { loadDotenv } from "../prisma/load-dotenv.js";
import { clearMediaFromDatabase } from "../prisma/seed-media-run.js";
import { isR2Configured, purgeR2Bucket } from "../src/server/storage/r2.ts";

loadDotenv();

const prisma = new PrismaClient();
const purge =
  process.argv.includes("--purge") || process.env.SEED_MEDIA_PURGE === "1";

async function wipeDatabase() {
  await prisma.lead.deleteMany({});
  await prisma.modelFaq.deleteMany({});
  await prisma.featureSection.deleteMany({});
  await prisma.vehicleVariant.deleteMany({});
  await prisma.vehicleModel.deleteMany({});
  await prisma.vehicleSegment.deleteMany({});
  await prisma.vehicleLine.deleteMany({});
  await prisma.heroSlide.deleteMany({});
  await prisma.serviceBlock.deleteMany({});
  await prisma.newsPost.deleteMany({});
  await prisma.page.deleteMany({});
  await prisma.policyDocument.deleteMany({});
  await prisma.faqItem.deleteMany({});
  await prisma.hotline.deleteMany({});
  await prisma.showroom.deleteMany({});
  await prisma.menuItem.deleteMany({});
  await clearMediaFromDatabase(prisma);
  await prisma.siteSettings.deleteMany({});
}

async function main() {
  console.log("Resetting car-retail data…");

  if (purge) {
    if (!isR2Configured()) {
      console.warn("R2 not configured — cannot purge bucket.");
    } else {
      console.log("Purging R2 bucket (--purge / SEED_MEDIA_PURGE=1)…");
      const count = await purgeR2Bucket();
      console.log(`R2: purged ${count} object(s).`);
    }
  } else {
    console.log(
      "Skipping R2 purge. Pass --purge or SEED_MEDIA_PURGE=1 to wipe the bucket.",
    );
  }

  await wipeDatabase();
  console.log("Database: catalog, CMS, media, and leads removed.");
  console.log("Kept: units, attribute keys, templates, admin user.");
  console.log(
    "Next: npm run db:seed:scraped && npm run db:seed:media -- --purge",
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

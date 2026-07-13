/**
 * Wipe catalog/CMS/media/leads; keep units, attribute keys, templates, admin.
 * Purges entire R2 bucket when configured.
 * Usage: node scripts/reset-all.js
 */
import { PrismaClient } from "@prisma/client";
import { isR2Configured, purgeR2Bucket } from "../lib/r2.js";
import { clearMediaFromDatabase } from "../prisma/seed-media-run.js";

const prisma = new PrismaClient();

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

  if (isR2Configured()) {
    const count = await purgeR2Bucket();
    console.log(`R2: purged ${count} object(s).`);
  } else {
    console.warn("R2 not configured — skipping bucket purge.");
  }

  await wipeDatabase();
  console.log("Database: catalog, CMS, media, and leads removed.");
  console.log("Kept: units, attribute keys, templates, admin user.");
  console.log("Next: npm run db:seed:scraped && npm run db:seed:media");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

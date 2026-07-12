/**
 * Purge all R2 objects, re-upload seed media from prisma/seed-media-data.js,
 * link CMS records, and write public URLs to prisma/seed-media-urls.js.
 *
 * Run: npm run db:seed:media
 */
import { PrismaClient } from "@prisma/client";
import { runSeedMedia } from "../prisma/seed-media-run.js";

const prisma = new PrismaClient();

runSeedMedia(prisma)
  .then((results) => {
    console.log(`Media seed complete. ${results.length} assets.`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

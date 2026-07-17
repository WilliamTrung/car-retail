/**
 * Media seed entry (lives under prisma/ so Docker copies include it).
 *
 * Requires full web/ tree (imports src/server/storage/r2.ts), DATABASE_URL,
 * and STORAGE_S3_* (via getEnv — AUTH_SECRET, NEXT_PUBLIC_SITE_URL, SEED_ADMIN_*
 * must also be set in web/.env).
 *
 * Run from web/:
 *   npm run db:seed:media -- --purge
 *   npx tsx prisma/seed-media.js --purge
 *
 * Without --purge (or SEED_MEDIA_PURGE=1), R2 is NOT wiped — assets are
 * re-uploaded over the same keys and MediaAsset rows are replaced.
 */
import { PrismaClient } from "@prisma/client";
import { loadDotenv } from "./load-dotenv.js";
import { runSeedMedia } from "./seed-media-run.js";

loadDotenv();

const purge =
  process.argv.includes("--purge") || process.env.SEED_MEDIA_PURGE === "1";

const prisma = new PrismaClient();

runSeedMedia(prisma, { purge })
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

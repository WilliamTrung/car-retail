/**
 * Media seed entry (lives under prisma/ so Docker copies include it).
 *
 * Self-contained: plain-node runnable, no tsx / src/ / tsconfig needed.
 * Requires only DATABASE_URL + STORAGE_S3_* (host: web/.env; container:
 * --env-file). Deps: @prisma/client (generated) + @aws-sdk/client-s3.
 *
 * Run from web/ (host):
 *   npm run db:seed:media -- --purge
 *   node prisma/seed-media.js --purge
 *
 * Run inside the migrate image (copies prisma/ only — no mounts needed):
 *   npx prisma generate && node prisma/seed-media.js --purge
 *
 * Ordering is failure-safe: fetch → upload → transactional DB swap → stale
 * purge last. A mid-run crash leaves the prior media set intact.
 *
 * Without --purge (or SEED_MEDIA_PURGE=1), stale R2 objects are NOT deleted —
 * assets are re-uploaded over the same keys and MediaAsset rows are replaced.
 *
 * NOTE: the manifest (seed-media-data.js) targets the GENERIC catalog from
 * prisma/seed.ts (`npm run db:seed`). Unmatched CMS links are skipped with
 * warnings (failure-safe) instead of aborting.
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

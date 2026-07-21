/**
 * Backfill R2 object Content-Type from key extension via CopyObject
 * MetadataDirective=REPLACE. Fixes stale objects that were uploaded with
 * application/octet-stream / text/html / missing Content-Type (ORB cause).
 *
 *   npm run r2:backfill-content-type
 *   npm run r2:backfill-content-type -- --dry-run
 *
 * Requires STORAGE_S3_* in web/.env
 */
import { loadDotenv } from "../prisma/load-dotenv.js";
import {
  headR2ContentType,
  isR2Configured,
  listAllR2Keys,
  replaceR2ContentType,
} from "../prisma/seed-media-r2.js";
import {
  isUsableMediaMime,
  mimeFromFilename,
  normalizeMime,
} from "../prisma/seed-media-mime.js";

loadDotenv();

const dryRun = process.argv.includes("--dry-run");

function isBadContentType(ct) {
  const n = normalizeMime(ct);
  if (!n) return true;
  return (
    n === "application/octet-stream" ||
    n === "binary/octet-stream" ||
    n === "text/html" ||
    n === "text/plain"
  );
}

async function main() {
  if (!isR2Configured()) {
    console.error(
      "R2 not configured. Set STORAGE_S3_ENDPOINT/BUCKET/ACCESS_KEY/SECRET_KEY/PUBLIC_URL",
    );
    process.exit(1);
  }

  const keys = await listAllR2Keys();
  console.log(`Scanning ${keys.length} object(s)${dryRun ? " (dry-run)" : ""}…`);

  let fixed = 0;
  let skipped = 0;
  let unknown = 0;
  const badAfter = [];

  for (const key of keys) {
    const current = await headR2ContentType(key);
    const expected = mimeFromFilename(key);

    if (!expected) {
      unknown += 1;
      console.warn(`  skip (unknown ext): ${key} ct=${current ?? "(absent)"}`);
      skipped += 1;
      continue;
    }

    const needsFix =
      isBadContentType(current) ||
      normalizeMime(current) !== expected ||
      !isUsableMediaMime(current);

    if (!needsFix) {
      skipped += 1;
      continue;
    }

    console.log(
      `  ${dryRun ? "would-fix" : "fix"} ${key}: ${current ?? "(absent)"} → ${expected}`,
    );
    if (!dryRun) {
      await replaceR2ContentType(key, expected);
      const after = await headR2ContentType(key);
      if (isBadContentType(after) || normalizeMime(after) !== expected) {
        badAfter.push({ key, after });
      }
    }
    fixed += 1;
  }

  // Final scan for acceptance reporting
  let badRemaining = 0;
  if (!dryRun) {
    for (const key of keys) {
      const ct = await headR2ContentType(key);
      if (isBadContentType(ct)) {
        badRemaining += 1;
        console.error(`  BAD remaining: ${key} => ${ct ?? "(absent)"}`);
      }
    }
  }

  console.log(
    JSON.stringify(
      {
        scanned: keys.length,
        fixed,
        skipped,
        unknownExt: unknown,
        badRemaining: dryRun ? null : badRemaining,
        dryRun,
      },
      null,
      2,
    ),
  );

  if (!dryRun && (badRemaining > 0 || badAfter.length > 0)) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

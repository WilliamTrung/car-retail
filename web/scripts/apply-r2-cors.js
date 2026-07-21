/**
 * Apply infra/r2-cors.json to the configured R2 bucket via S3 PutBucketCors.
 *
 *   npm run r2:apply-cors
 *
 * Requires STORAGE_S3_* with PutBucketCors permission. On AccessDenied, apply
 * the same JSON in the Cloudflare R2 dashboard (see infra/r2-public-access.md).
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  GetBucketCorsCommand,
  PutBucketCorsCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { loadDotenv } from "../prisma/load-dotenv.js";

loadDotenv();

const __dirname = dirname(fileURLToPath(import.meta.url));
const CORS_FILE = join(__dirname, "../../infra/r2-cors.json");

function getClient() {
  const required = [
    "STORAGE_S3_ENDPOINT",
    "STORAGE_S3_BUCKET",
    "STORAGE_S3_ACCESS_KEY",
    "STORAGE_S3_SECRET_KEY",
  ];
  const missing = required.filter((k) => !process.env[k]?.trim());
  if (missing.length) {
    throw new Error(`Missing env: ${missing.join(", ")}`);
  }
  const endpoint = process.env.STORAGE_S3_ENDPOINT.trim();
  const useSsl = process.env.STORAGE_S3_USE_SSL !== "false";
  return {
    client: new S3Client({
      region: process.env.STORAGE_S3_REGION?.trim() || "auto",
      endpoint: endpoint.startsWith("http")
        ? endpoint
        : `${useSsl ? "https" : "http"}://${endpoint}`,
      credentials: {
        accessKeyId: process.env.STORAGE_S3_ACCESS_KEY.trim(),
        secretAccessKey: process.env.STORAGE_S3_SECRET_KEY.trim(),
      },
    }),
    bucket: process.env.STORAGE_S3_BUCKET.trim(),
  };
}

async function main() {
  const rules = JSON.parse(readFileSync(CORS_FILE, "utf8"));
  const { client, bucket } = getClient();

  try {
    await client.send(
      new PutBucketCorsCommand({
        Bucket: bucket,
        CORSConfiguration: { CORSRules: rules },
      }),
    );
  } catch (err) {
    console.error("PutBucketCors failed:", err.name, err.message);
    console.error(
      "Credential needed: S3 API token with PutBucketCors, OR Cloudflare dashboard CORS paste from infra/r2-cors.json, OR Account API token with Account.Cloudflare R2:Edit.",
    );
    process.exit(1);
  }

  try {
    const got = await client.send(
      new GetBucketCorsCommand({ Bucket: bucket }),
    );
    console.log("CORS applied to", bucket);
    console.log(JSON.stringify(got.CORSRules, null, 2));
  } catch (err) {
    console.log("PutBucketCors succeeded; GetBucketCors verify failed:", err.name);
    console.log("Assumed applied — verify in Cloudflare dashboard.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

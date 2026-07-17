/**
 * Self-contained R2 client for seed scripts — plain-node runnable (no tsx,
 * no @/ alias, no src/). Reads only STORAGE_S3_* from process.env, so the
 * media seed works inside the migrate Docker image (which copies prisma/ only)
 * without mounting src/ or tsconfig.json.
 *
 * Mirrors src/server/storage/r2.ts behaviour for the subset the seeds need.
 */
import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

const REQUIRED = [
  "STORAGE_S3_ENDPOINT",
  "STORAGE_S3_BUCKET",
  "STORAGE_S3_ACCESS_KEY",
  "STORAGE_S3_SECRET_KEY",
  "STORAGE_S3_PUBLIC_URL",
];

function getR2Config() {
  const missing = REQUIRED.filter((k) => !process.env[k]?.trim());
  if (missing.length > 0) {
    throw new Error(`R2 not configured — missing env: ${missing.join(", ")}`);
  }
  const endpoint = process.env.STORAGE_S3_ENDPOINT.trim();
  const useSsl = process.env.STORAGE_S3_USE_SSL !== "false";
  return {
    endpoint: endpoint.startsWith("http")
      ? endpoint
      : `${useSsl ? "https" : "http"}://${endpoint}`,
    bucket: process.env.STORAGE_S3_BUCKET.trim(),
    accessKey: process.env.STORAGE_S3_ACCESS_KEY.trim(),
    secretKey: process.env.STORAGE_S3_SECRET_KEY.trim(),
    region: process.env.STORAGE_S3_REGION?.trim() || "auto",
    publicUrl: process.env.STORAGE_S3_PUBLIC_URL.trim().replace(/\/$/, ""),
  };
}

let client;

function getR2Client() {
  const config = getR2Config();
  if (!client) {
    client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretKey,
      },
    });
  }
  return { client, config };
}

export function isR2Configured() {
  try {
    getR2Config();
    return true;
  } catch {
    return false;
  }
}

/** @param {string} key */
export function getPublicUrl(key) {
  return `${getR2Config().publicUrl}/${key}`;
}

/** @param {string} key @param {Buffer | Uint8Array} body @param {string} contentType */
export async function uploadToR2(key, body, contentType) {
  const r2 = getR2Client();
  await r2.client.send(
    new PutObjectCommand({
      Bucket: r2.config.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
  return getPublicUrl(key);
}

/** @param {string} key */
export async function deleteFromR2(key) {
  const r2 = getR2Client();
  await r2.client.send(
    new DeleteObjectCommand({ Bucket: r2.config.bucket, Key: key }),
  );
}

export async function listAllR2Keys() {
  const r2 = getR2Client();
  const keys = [];
  let continuationToken;
  do {
    const page = await r2.client.send(
      new ListObjectsV2Command({
        Bucket: r2.config.bucket,
        ContinuationToken: continuationToken,
      }),
    );
    for (const item of page.Contents ?? []) {
      if (item.Key) keys.push(item.Key);
    }
    continuationToken = page.IsTruncated
      ? page.NextContinuationToken
      : undefined;
  } while (continuationToken);
  return keys;
}

/** Delete every object in the bucket. Destructive — callers must guard. */
export async function purgeR2Bucket() {
  const keys = await listAllR2Keys();
  for (const key of keys) {
    await deleteFromR2(key);
  }
  return keys.length;
}

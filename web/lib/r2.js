import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

function getR2Config() {
  const endpoint = process.env.STORAGE_S3_ENDPOINT;
  const bucket = process.env.STORAGE_S3_BUCKET;
  const accessKey = process.env.STORAGE_S3_ACCESS_KEY;
  const secretKey = process.env.STORAGE_S3_SECRET_KEY;
  const region = process.env.STORAGE_S3_REGION || "auto";
  const publicUrl = process.env.STORAGE_S3_PUBLIC_URL?.replace(/\/$/, "");
  const useSsl = process.env.STORAGE_S3_USE_SSL !== "false";

  if (!endpoint || !bucket || !accessKey || !secretKey) {
    return null;
  }

  return { endpoint, bucket, accessKey, secretKey, region, publicUrl, useSsl };
}

let client;

export function getR2Client() {
  const config = getR2Config();
  if (!config) return null;

  if (!client) {
    client = new S3Client({
      region: config.region,
      endpoint: config.endpoint.startsWith("http")
        ? config.endpoint
        : `${config.useSsl ? "https" : "http"}://${config.endpoint}`,
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretKey,
      },
    });
  }

  return { client, config };
}

export function isR2Configured() {
  return getR2Config() !== null;
}

/**
 * @param {string} key - object key e.g. vehicles/hero.jpg
 * @param {Buffer|Uint8Array} body
 * @param {string} contentType
 */
export async function uploadToR2(key, body, contentType) {
  const r2 = getR2Client();
  if (!r2) {
    throw new Error("R2 is not configured. Set STORAGE_S3_* environment variables.");
  }

  await r2.client.send(
    new PutObjectCommand({
      Bucket: r2.config.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return getPublicUrl(key);
}

export async function deleteFromR2(key) {
  const r2 = getR2Client();
  if (!r2) {
    throw new Error("R2 is not configured. Set STORAGE_S3_* environment variables.");
  }

  await r2.client.send(
    new DeleteObjectCommand({
      Bucket: r2.config.bucket,
      Key: key,
    })
  );
}

/** @returns {Promise<string[]>} */
export async function listAllR2Keys() {
  const r2 = getR2Client();
  if (!r2) {
    throw new Error("R2 is not configured. Set STORAGE_S3_* environment variables.");
  }

  const keys = [];
  let continuationToken;

  do {
    const page = await r2.client.send(
      new ListObjectsV2Command({
        Bucket: r2.config.bucket,
        ContinuationToken: continuationToken,
      })
    );
    for (const item of page.Contents ?? []) {
      if (item.Key) keys.push(item.Key);
    }
    continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (continuationToken);

  return keys;
}

/** Delete every object in the configured R2 bucket. */
export async function purgeR2Bucket() {
  const keys = await listAllR2Keys();
  for (const key of keys) {
    await deleteFromR2(key);
  }
  return keys.length;
}

export function getPublicUrl(key) {
  const config = getR2Config();
  if (!config?.publicUrl) {
    return key;
  }
  return `${config.publicUrl}/${key}`;
}

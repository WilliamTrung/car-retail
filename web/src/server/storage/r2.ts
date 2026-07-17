import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getEnv } from "@/server/config/env";

type R2Config = {
  endpoint: string;
  bucket: string;
  accessKey: string;
  secretKey: string;
  region: string;
  publicUrl: string;
  useSsl: boolean;
};

function getR2Config(): R2Config {
  const e = getEnv();
  return {
    endpoint: e.STORAGE_S3_ENDPOINT,
    bucket: e.STORAGE_S3_BUCKET,
    accessKey: e.STORAGE_S3_ACCESS_KEY,
    secretKey: e.STORAGE_S3_SECRET_KEY,
    region: e.STORAGE_S3_REGION,
    publicUrl: e.STORAGE_S3_PUBLIC_URL,
    useSsl: e.STORAGE_S3_USE_SSL,
  };
}

let client: S3Client | undefined;

function getR2Client(): { client: S3Client; config: R2Config } {
  const config = getR2Config();

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

/** True when env has loaded successfully (all STORAGE_S3_* required). */
export function isR2Configured(): boolean {
  try {
    getR2Config();
    return true;
  } catch {
    return false;
  }
}

export async function uploadToR2(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
): Promise<string> {
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

export async function deleteFromR2(key: string): Promise<void> {
  const r2 = getR2Client();

  await r2.client.send(
    new DeleteObjectCommand({
      Bucket: r2.config.bucket,
      Key: key,
    }),
  );
}

export async function listAllR2Keys(): Promise<string[]> {
  const r2 = getR2Client();

  const keys: string[] = [];
  let continuationToken: string | undefined;

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

/** Delete every object in the configured R2 bucket. */
export async function purgeR2Bucket(): Promise<number> {
  const keys = await listAllR2Keys();
  for (const key of keys) {
    await deleteFromR2(key);
  }
  return keys.length;
}

export function getPublicUrl(key: string): string {
  const config = getR2Config();
  if (!config.publicUrl) {
    return key;
  }
  return `${config.publicUrl}/${key}`;
}

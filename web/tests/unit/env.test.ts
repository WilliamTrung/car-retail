import { describe, expect, it } from "vitest";
import { parseEnv } from "@/server/config/env";

const validEnv = {
  DATABASE_URL: "postgresql://user:pass@localhost:5432/car_retail",
  AUTH_SECRET: "a-sufficiently-long-secret",
  STORAGE_S3_ENDPOINT: "https://account.r2.cloudflarestorage.com",
  STORAGE_S3_REGION: "auto",
  STORAGE_S3_BUCKET: "car-retail-media",
  STORAGE_S3_ACCESS_KEY: "access-key",
  STORAGE_S3_SECRET_KEY: "secret-key",
  STORAGE_S3_PUBLIC_URL: "https://media.example.com/",
  STORAGE_S3_USE_SSL: "true",
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
  SEED_ADMIN_EMAIL: "admin@example.com",
  SEED_ADMIN_PASSWORD: "long-enough-password",
} as const;

describe("parseEnv", () => {
  it("accepts a complete valid env object", () => {
    const env = parseEnv({ ...validEnv });
    expect(env.DATABASE_URL).toBe(validEnv.DATABASE_URL);
    expect(env.AUTH_SECRET).toBe(validEnv.AUTH_SECRET);
    expect(env.STORAGE_S3_PUBLIC_URL).toBe("https://media.example.com");
    expect(env.STORAGE_S3_USE_SSL).toBe(true);
    expect(env.STORAGE_S3_REGION).toBe("auto");
  });

  it("rejects when a required var is missing", () => {
    const { AUTH_SECRET: _, ...withoutAuth } = validEnv;
    expect(() => parseEnv(withoutAuth)).toThrow(/Invalid environment configuration/);
    expect(() => parseEnv(withoutAuth)).toThrow(/AUTH_SECRET/);
  });

  it("rejects empty string for a required var", () => {
    expect(() =>
      parseEnv({ ...validEnv, DATABASE_URL: "   " }),
    ).toThrow(/DATABASE_URL/);
  });

  it("rejects short SEED_ADMIN_PASSWORD", () => {
    expect(() =>
      parseEnv({ ...validEnv, SEED_ADMIN_PASSWORD: "short" }),
    ).toThrow(/SEED_ADMIN_PASSWORD/);
  });

  it("defaults STORAGE_S3_REGION to auto when absent", () => {
    const { STORAGE_S3_REGION: _, ...rest } = validEnv;
    const env = parseEnv(rest);
    expect(env.STORAGE_S3_REGION).toBe("auto");
  });

  it("treats STORAGE_S3_USE_SSL=false as false", () => {
    const env = parseEnv({ ...validEnv, STORAGE_S3_USE_SSL: "false" });
    expect(env.STORAGE_S3_USE_SSL).toBe(false);
  });
});

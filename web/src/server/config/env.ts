import { z } from "zod";

const nonEmpty = z.string().trim().min(1);

/**
 * Zod schema for server env. Call via `parseEnv` (tests) or `getEnv` (runtime).
 * Never falls back to secrets — missing/invalid vars throw.
 */
export const envSchema = z.object({
  DATABASE_URL: nonEmpty,
  AUTH_SECRET: nonEmpty.min(16, "AUTH_SECRET must be at least 16 characters"),
  STORAGE_S3_ENDPOINT: nonEmpty,
  STORAGE_S3_REGION: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : "auto")),
  STORAGE_S3_BUCKET: nonEmpty,
  STORAGE_S3_ACCESS_KEY: nonEmpty,
  STORAGE_S3_SECRET_KEY: nonEmpty,
  STORAGE_S3_PUBLIC_URL: nonEmpty.transform((v) => v.replace(/\/$/, "")),
  STORAGE_S3_USE_SSL: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((v) => {
      if (v === undefined) return true;
      if (typeof v === "boolean") return v;
      return v !== "false";
    }),
  NEXT_PUBLIC_SITE_URL: nonEmpty,
  SEED_ADMIN_EMAIL: z.string().trim().email(),
  SEED_ADMIN_PASSWORD: nonEmpty.min(
    12,
    "SEED_ADMIN_PASSWORD must be at least 12 characters",
  ),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .optional()
    .default("development"),
});

export type Env = z.infer<typeof envSchema>;

function formatEnvError(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "(root)";
      return `  - ${path}: ${issue.message}`;
    })
    .join("\n");
}

/**
 * Parse a raw env record (e.g. `process.env` or a partial fixture).
 * Throws a clear error listing missing/invalid keys — no secret fallbacks.
 */
export function parseEnv(
  raw: Record<string, string | undefined> | NodeJS.ProcessEnv,
): Env {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(
      `Invalid environment configuration:\n${formatEnvError(result.error)}`,
    );
  }
  return result.data;
}

let cached: Env | undefined;

/** Parse `process.env` once on first access (fail-fast). Safe for typecheck — never runs at import. */
export function getEnv(): Env {
  if (!cached) {
    cached = parseEnv(process.env);
  }
  return cached;
}

/** Test-only: clear cached env so the next `getEnv()` re-parses. */
export function resetEnvCache(): void {
  cached = undefined;
}

/**
 * Lazy typed env — property access triggers `getEnv()`.
 * Prefer this (or `getEnv()`) over reading `process.env` in server modules.
 */
export const env: Env = new Proxy({} as Env, {
  get(_target, prop: string | symbol) {
    if (typeof prop !== "string") return undefined;
    return getEnv()[prop as keyof Env];
  },
});

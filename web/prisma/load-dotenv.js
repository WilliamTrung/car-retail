/**
 * Load web/.env into process.env when vars are not already set.
 * Seed scripts run outside Next.js, so .env is not auto-loaded.
 */
import { existsSync, readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export function loadDotenv(fileName = ".env") {
  const envPath = resolve(webRoot, fileName);
  if (!existsSync(envPath)) return false;

  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    const key = line.slice(0, i).trim();
    let value = line.slice(i + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
  return true;
}

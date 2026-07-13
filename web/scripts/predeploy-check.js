#!/usr/bin/env node
/**
 * Pre-deploy checks — run: node scripts/predeploy-check.js
 * ponytail: grep-only; no network calls
 */
import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";
import { fileURLToPath } from "url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const SCAN_DIRS = ["app", "components", "lib", "messages", "prisma"];
const BANNED = [/vinfast/i, /vinfastauto\.com/i, /shop\.vinfastauto/i];
/** Dev-only reference seed files may contain literal source URLs/names */
const BANNED_EXCLUDE = [
  "prisma/seed-media-data.js",
  "prisma/seed-media-urls.js",
  "prisma/seed-scraped.js",
  "scripts/scrape-reference/output/manifest.json",
];
const WARN_DEFAULT_SECRET = /change-me-in-production/;

/** @param {string} dir @param {string[]} files */
function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (name === "node_modules" || name === ".next") continue;
      walk(path, files);
    } else if (/\.(js|jsx|json|css|md)$/.test(name)) {
      files.push(path);
    }
  }
  return files;
}

let failed = false;

for (const dir of SCAN_DIRS) {
  const full = join(root, dir);
  try {
    for (const file of walk(full)) {
      const rel = relative(root, file).replace(/\\/g, "/");
      if (BANNED_EXCLUDE.some((p) => rel === p || rel.endsWith(p))) continue;
      const text = readFileSync(file, "utf8");
      for (const pattern of BANNED) {
        if (pattern.test(text)) {
          console.error(`BANNED pattern ${pattern} in ${relative(root, file)}`);
          failed = true;
        }
      }
    }
  } catch {
    /* dir may not exist */
  }
}

try {
  const envExample = readFileSync(join(root, ".env.example"), "utf8");
  if (!envExample.includes("SESSION_SECRET")) {
    console.error("Missing SESSION_SECRET in .env.example");
    failed = true;
  }
} catch {
  console.error("Missing web/.env.example");
  failed = true;
}

try {
  const env = readFileSync(join(root, ".env"), "utf8");
  if (WARN_DEFAULT_SECRET.test(env) && process.env.NODE_ENV === "production") {
    console.warn("WARN: SESSION_SECRET still default in .env");
  }
} catch {
  /* local .env optional in CI */
}

if (failed) {
  console.error("\nPre-deploy check FAILED");
  process.exit(1);
}

console.log("Pre-deploy check OK");

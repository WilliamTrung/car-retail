/**
 * predeploy:check — fail the deploy gate if banned brand strings remain in source.
 * Placeholder brand: Volta / VOLTA AUTO. Edit BANNED below when the list grows.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Case-insensitive banned tokens (substring match). */
const BANNED = ["vinfast", "vinfastauto.com"];

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SELF = path.normalize(path.join(ROOT, "scripts", "predeploy-check.mjs"));

const SRC_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".json", ".css"]);
const SEED_FILES = [
  "prisma/seed.ts",
  "prisma/seed.js",
  "prisma/seed-bootstrap.js",
  "prisma/seed-scraped.js",
  "prisma/seed-media-data.js",
  "prisma/seed-media-urls.js",
];

const SKIP_DIR_NAMES = new Set([
  "node_modules",
  ".next",
  "dist",
  "coverage",
  "__tests__",
]);

/**
 * @param {string} abs
 * @returns {boolean}
 */
function isExcluded(abs) {
  const norm = path.normalize(abs);
  if (norm === SELF) return true;

  const rel = path.relative(ROOT, norm).split(path.sep).join("/");
  if (rel.startsWith("docs/") || rel === "docs") return true;
  if (rel.startsWith("scripts/scrape-reference/output/")) return true;
  if (rel === "prisma/seed-mock.js") return true;

  const base = path.basename(norm);
  if (/\.test\./.test(base) || /\.spec\./.test(base)) return true;

  const parts = rel.split("/");
  for (const part of parts) {
    if (SKIP_DIR_NAMES.has(part)) return true;
  }
  return false;
}

/**
 * @param {string} dirAbs
 * @param {(abs: string) => boolean} filter
 * @param {string[]} out
 */
function walkFiles(dirAbs, filter, out) {
  if (!existsSync(dirAbs)) return;
  /** @type {import("node:fs").Dirent[]} */
  const entries = readdirSync(dirAbs, { withFileTypes: true, recursive: true });
  for (const ent of entries) {
    // Node recursive Dirent: `parentPath` (Node 20.12+) or `path` (older)
    const parent =
      /** @type {{ parentPath?: string; path?: string }} */ (ent).parentPath ??
      /** @type {{ path?: string }} */ (ent).path ??
      dirAbs;
    const abs = path.join(parent, ent.name);
    if (ent.isDirectory()) continue;
    if (!ent.isFile()) continue;
    if (isExcluded(abs)) continue;
    if (!filter(abs)) continue;
    out.push(abs);
  }
}

/**
 * @returns {string[]}
 */
function collectScanTargets() {
  /** @type {string[]} */
  const files = [];

  walkFiles(path.join(ROOT, "messages"), (abs) => abs.endsWith(".json"), files);

  walkFiles(
    path.join(ROOT, "src"),
    (abs) => SRC_EXTS.has(path.extname(abs).toLowerCase()),
    files,
  );

  for (const rel of SEED_FILES) {
    const abs = path.join(ROOT, rel);
    if (!existsSync(abs) || !statSync(abs).isFile()) continue;
    if (isExcluded(abs)) continue;
    files.push(abs);
  }

  // Deterministic file order
  return [...new Set(files.map((f) => path.normalize(f)))].sort((a, b) =>
    path.relative(ROOT, a).localeCompare(path.relative(ROOT, b)),
  );
}

/**
 * @param {string} abs
 * @returns {{ file: string; line: number; token: string }[]}
 */
function scanFile(abs) {
  const rel = path.relative(ROOT, abs).split(path.sep).join("/");
  const text = readFileSync(abs, "utf8");
  // LF-agnostic: split on \n after stripping \r
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  /** @type {{ file: string; line: number; token: string }[]} */
  const hits = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    const lower = line.toLowerCase();
    for (const token of BANNED) {
      if (lower.includes(token.toLowerCase())) {
        hits.push({ file: rel, line: i + 1, token });
      }
    }
  }
  return hits;
}

function main() {
  const targets = collectScanTargets();
  /** @type {{ file: string; line: number; token: string }[]} */
  const hits = [];

  for (const abs of targets) {
    hits.push(...scanFile(abs));
  }

  hits.sort((a, b) => {
    const fc = a.file.localeCompare(b.file);
    if (fc !== 0) return fc;
    if (a.line !== b.line) return a.line - b.line;
    return a.token.localeCompare(b.token);
  });

  if (hits.length > 0) {
    for (const h of hits) {
      console.log(`${h.file}:${h.line}: ${h.token}`);
    }
    console.error(
      `\npredeploy:check FAILED — ${hits.length} banned-branding hit(s) in ${targets.length} file(s) scanned.`,
    );
    process.exit(1);
  }

  console.log(
    `predeploy:check OK — 0 hits in ${targets.length} file(s) scanned.`,
  );
  process.exit(0);
}

main();

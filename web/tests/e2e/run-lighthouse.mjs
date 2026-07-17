import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const e2eDir = path.dirname(fileURLToPath(import.meta.url));
const artifactsDir = path.join(e2eDir, "artifacts");
mkdirSync(artifactsDir, { recursive: true });

const targets = [
  { path: "/vi", slug: "vi-home" },
  { path: "/vi/models/city-ev-compact", slug: "vi-model" },
];

const summary = [];

for (const target of targets) {
  const url = `${baseURL}${target.path}`;
  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });

  try {
    const result = await lighthouse(url, {
      logLevel: "error",
      output: ["json", "html"],
      port: chrome.port,
      onlyCategories: ["performance"],
    });

    const lhr = result?.lhr;
    if (!lhr) {
      throw new Error(`Lighthouse returned no report for ${url}`);
    }

    const jsonPath = path.join(artifactsDir, `lighthouse-${target.slug}.json`);
    const htmlPath = path.join(artifactsDir, `lighthouse-${target.slug}.html`);
    writeFileSync(jsonPath, result.report[0]);
    writeFileSync(htmlPath, result.report[1]);

    const lcpAudit = lhr.audits["largest-contentful-paint"];
    const clsAudit = lhr.audits["cumulative-layout-shift"];
    const tbtAudit = lhr.audits["total-blocking-time"];
    const lcpElementAudit = lhr.audits["largest-contentful-paint-element"];
    const lcpSnippet =
      lcpElementAudit?.details?.items?.[0]?.node?.snippet ??
      lcpElementAudit?.details?.items?.[0]?.node?.selector ??
      lcpElementAudit?.displayValue ??
      null;

    summary.push({
      url: target.path,
      lcpMs: lcpAudit?.numericValue ?? 0,
      cls: clsAudit?.numericValue ?? 1,
      tbtMs: tbtAudit?.numericValue ?? 0,
      lcpElement: lcpSnippet,
      scores: {
        performance: lhr.categories.performance?.score ?? 0,
      },
    });
  } finally {
    try {
      await chrome.kill();
    } catch {
      // Windows may EPERM on temp dir cleanup when AV locks chrome-launcher temp.
    }
  }
}

writeFileSync(
  path.join(artifactsDir, "cwv-summary.json"),
  JSON.stringify(summary, null, 2),
);
console.log(JSON.stringify(summary, null, 2));

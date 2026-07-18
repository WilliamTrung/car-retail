/**
 * One-shot generator for committed neutral raster placeholders.
 * Run: node prisma/generate-seed-assets.mjs
 * Requires sharp (dev/transitive). Output is committed; seed runtime does not need sharp.
 */
import sharp from "sharp";
import { mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "seed-assets");

function hashHue(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 360;
}

function hsl(h, s, l) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  const r = Math.round(f(0) * 255);
  const g = Math.round(f(8) * 255);
  const b = Math.round(f(4) * 255);
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

const assets = [
  ["models/city-ev/hero.webp", 1600, 900, "city-ev-hero"],
  ["models/city-ev/gallery-2.webp", 1200, 800, "city-ev-g2"],
  ["models/city-ev/gallery-3.webp", 1200, 800, "city-ev-g3"],
  ["models/city-ev/gallery-4.webp", 1200, 800, "city-ev-g4"],
  ["models/city-ev/gallery-5.webp", 1200, 800, "city-ev-g5"],
  ["models/family-suv/hero.webp", 1600, 900, "family-suv-hero"],
  ["models/family-suv/gallery-2.webp", 1200, 800, "family-suv-g2"],
  ["models/urban-mpv/hero.webp", 1600, 900, "urban-mpv-hero"],
  ["models/urban-mpv/gallery-2.webp", 1200, 800, "urban-mpv-g2"],
  ["models/cargo-van/hero.webp", 1600, 900, "cargo-van-hero"],
  ["models/cargo-van/gallery-2.webp", 1200, 800, "cargo-van-g2"],
  ["models/metro/hero.webp", 1600, 900, "metro-hero"],
  ["models/metro/gallery-2.webp", 1200, 800, "metro-g2"],
  ["models/limo/hero.webp", 1600, 900, "limo-hero"],
  ["models/limo/gallery-2.webp", 1200, 800, "limo-g2"],
  ["heroes/seed-hero-1.webp", 1920, 800, "hero-1"],
  ["news/news-1.webp", 1200, 675, "news-1"],
  ["news/news-2.webp", 1200, 675, "news-2"],
  ["news/news-3.webp", 1200, 675, "news-3"],
  ["delivery/delivery-1.webp", 1200, 800, "delivery-1"],
  ["delivery/delivery-2.webp", 1200, 800, "delivery-2"],
  ["delivery/delivery-3.webp", 1200, 800, "delivery-3"],
  ["delivery/delivery-4.webp", 1200, 800, "delivery-4"],
  ["delivery/delivery-5.webp", 1200, 800, "delivery-5"],
];

for (const [rel, w, h, seed] of assets) {
  const hue = hashHue(seed);
  const c1 = hsl(hue, 28, 42);
  const c2 = hsl((hue + 40) % 360, 22, 28);
  const c3 = hsl((hue + 180) % 360, 18, 55);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <ellipse cx="${Math.round(w * 0.72)}" cy="${Math.round(h * 0.38)}" rx="${Math.round(w * 0.22)}" ry="${Math.round(h * 0.18)}" fill="${c3}" opacity="0.35"/>
    <rect x="${Math.round(w * 0.12)}" y="${Math.round(h * 0.58)}" width="${Math.round(w * 0.55)}" height="${Math.round(h * 0.12)}" rx="8" fill="#ffffff" opacity="0.18"/>
  </svg>`;
  const out = join(root, rel);
  mkdirSync(dirname(out), { recursive: true });
  await sharp(Buffer.from(svg)).webp({ quality: 82 }).toFile(out);
  console.log("wrote", rel);
}
console.log("done", assets.length);

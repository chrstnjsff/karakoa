// Derives the raster brand files in public/ from the sources in
// src/assets/brand/ and scripts/brand/favicon.svg. Run with `npm run brand`.
// sharp ships with Astro, so nothing extra is installed.
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const brand = join(root, "src", "assets", "brand");
const out = join(root, "public");
mkdirSync(out, { recursive: true });

const navy = "#0c2a3f";

// Home-screen icon: the full-bleed app icon, iOS rounds the corners.
await sharp(join(brand, "karakoa-app-icon.png")).resize(180, 180).png().toFile(join(out, "apple-touch-icon.png"));

// Tab icon: the simplified mark, rendered from the SVG so edges stay crisp.
const favicon = join(dirname(fileURLToPath(import.meta.url)), "favicon.svg");
await sharp(favicon, { density: 384 }).resize(32, 32).png().toFile(join(out, "favicon-32.png"));
copyFileSync(favicon, join(out, "favicon.svg"));

// Share image 1200x630: the night logo centred on navy.
const night = await sharp(join(brand, "karakoa-night.png")).resize({ width: 1200 }).toBuffer();
const nightMeta = await sharp(night).metadata();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: navy } })
  .composite([{ input: night, top: Math.round((630 - (nightMeta.height ?? 562)) / 2), left: 0 }])
  .png({ compressionLevel: 9 })
  .toFile(join(out, "og.png"));

console.log("brand assets written to public/");

import sharp from "sharp";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const svg = readFileSync(resolve(root, "public/icon.svg"));

const targets = [
  { size: 192, file: "public/icon-192.png" },
  { size: 512, file: "public/icon-512.png" },
  { size: 180, file: "public/apple-touch-icon.png" },
  { size: 32, file: "public/favicon-32.png" },
];

for (const { size, file } of targets) {
  await sharp(svg).resize(size, size).png().toFile(resolve(root, file));
  console.log(`✓ ${file} (${size}x${size})`);
}

// Generate maskable icon (extra padding so the logo isn't clipped on Android masks)
await sharp(svg)
  .resize(410, 410)
  .extend({
    top: 51,
    bottom: 51,
    left: 51,
    right: 51,
    background: { r: 9, g: 9, b: 11, alpha: 1 },
  })
  .png()
  .toFile(resolve(root, "public/icon-maskable-512.png"));
console.log("✓ public/icon-maskable-512.png (512x512 maskable)");

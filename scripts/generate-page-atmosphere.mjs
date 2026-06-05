import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const CANVAS_WIDTH = 864;
const TOP_ASSET_HEIGHT = 1536;
const REPEAT_ASSET_HEIGHT = 512;
const FADE_STOPS = [
  { y: 0, alpha: 0 },
  { y: 300, alpha: 0 },
  { y: 600, alpha: 0.12 },
  { y: 948, alpha: 0.56 },
  { y: 1236, alpha: 1 },
  { y: TOP_ASSET_HEIGHT, alpha: 1 },
];

const scriptsDirectory = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptsDirectory, "..");

const variants = [
  {
    label: "light",
    source: "scripts/assets/page-atmosphere-source.avif",
    output: "public/page-atmosphere.avif",
    repeatOutput: "public/page-atmosphere-repeat.avif",
    page: { r: 255, g: 255, b: 255 },
  },
  {
    label: "dark",
    source: "scripts/assets/page-atmosphere-dark-source.avif",
    output: "public/page-atmosphere-dark.avif",
    repeatOutput: "public/page-atmosphere-repeat-dark.avif",
    page: { r: 10, g: 10, b: 10 },
  },
];

for (const variant of variants) {
  await generateTopAtmosphere(variant);
  await generateRepeatTile(variant);
}

console.log("Generated page atmosphere assets with baked 300/600/948/1236px fade stops.");

async function generateTopAtmosphere({ source, output, page }) {
  const sourcePath = resolve(repoRoot, source);
  const outputPath = resolve(repoRoot, output);
  const overlay = createPageOverlay(page);

  await mkdir(dirname(outputPath), { recursive: true });
  await sharp({
    create: {
      width: CANVAS_WIDTH,
      height: TOP_ASSET_HEIGHT,
      channels: 4,
      background: { ...page, alpha: 1 },
    },
  })
    .composite([
      { input: await sharp(sourcePath).ensureAlpha().toBuffer(), left: 0, top: 0 },
      {
        input: overlay,
        raw: { width: CANVAS_WIDTH, height: TOP_ASSET_HEIGHT, channels: 4 },
        left: 0,
        top: 0,
      },
    ])
    .avif({ effort: 6, quality: 82 })
    .toFile(outputPath);
}

async function generateRepeatTile({ repeatOutput, page }) {
  const outputPath = resolve(repoRoot, repeatOutput);

  await mkdir(dirname(outputPath), { recursive: true });
  await sharp({
    create: {
      width: CANVAS_WIDTH,
      height: REPEAT_ASSET_HEIGHT,
      channels: 4,
      background: { ...page, alpha: 1 },
    },
  })
    .avif({ effort: 6, quality: 82 })
    .toFile(outputPath);
}

function createPageOverlay(page) {
  const overlay = Buffer.alloc(CANVAS_WIDTH * TOP_ASSET_HEIGHT * 4);

  for (let y = 0; y < TOP_ASSET_HEIGHT; y += 1) {
    const alpha = fadeAlphaAt(y);
    for (let x = 0; x < CANVAS_WIDTH; x += 1) {
      const offset = (y * CANVAS_WIDTH + x) * 4;
      overlay[offset] = page.r;
      overlay[offset + 1] = page.g;
      overlay[offset + 2] = page.b;
      overlay[offset + 3] = Math.round(alpha * 255);
    }
  }

  return overlay;
}

function fadeAlphaAt(y) {
  for (let index = 0; index < FADE_STOPS.length - 1; index += 1) {
    const current = FADE_STOPS[index];
    const next = FADE_STOPS[index + 1];

    if (y >= current.y && y <= next.y) {
      const range = next.y - current.y;
      const progress = range === 0 ? 1 : (y - current.y) / range;
      return current.alpha + (next.alpha - current.alpha) * progress;
    }
  }

  return FADE_STOPS.at(-1).alpha;
}

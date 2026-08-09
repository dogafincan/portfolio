import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const sourcePath = resolve(repoRoot, "scripts/assets/app-logo-source.png");
const source = await sharp(sourcePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

const FAVICON_BACKGROUND_SRGB = "#000000";
const FAVICON_SUBJECT_SCALE = 0.75;
const IDENTITY_SUBJECT_SCALE = 0.6;
const LIGHT_BACKGROUND_SRGB = "#ffffff";
const DARK_BACKGROUND_SRGB = "#000000";
const MASK_SRGB = "#ffffff";

if (source.info.width !== source.info.height) {
  throw new Error("Portfolio identity source must be square.");
}

const identity = extractIdentityLayers(source.data, source.info);

for (const asset of [
  { background: LIGHT_BACKGROUND_SRGB, path: "public/app-logo-120.png", size: 120 },
  { background: LIGHT_BACKGROUND_SRGB, path: "public/app-logo-120-navbar-light.png", size: 120 },
  { background: DARK_BACKGROUND_SRGB, path: "public/app-logo-120-navbar-dark.png", size: 120 },
  { background: DARK_BACKGROUND_SRGB, path: "public/apple-touch-icon.png", size: 180 },
  { background: DARK_BACKGROUND_SRGB, path: "public/android-chrome-192x192.png", size: 192 },
  { background: DARK_BACKGROUND_SRGB, path: "public/android-chrome-512x512.png", size: 512 },
]) {
  await (
    await renderIdentityAsset(
      asset.size,
      identity.mark,
      source.info,
      identity.markBounds,
      asset.background,
    )
  )
    .png()
    .toFile(resolve(repoRoot, asset.path));
}

const favicon16 = await (
  await renderFavicon(16, identity.mark, source.info, identity.markBounds)
)
  .png()
  .toBuffer();
const favicon32 = await (
  await renderFavicon(32, identity.mark, source.info, identity.markBounds)
)
  .png()
  .toBuffer();

await writeFile(resolve(repoRoot, "public/favicon-16x16.png"), favicon16);
await writeFile(resolve(repoRoot, "public/favicon-32x32.png"), favicon32);
await writeFile(resolve(repoRoot, "public/favicon.ico"), createIco([favicon16, favicon32]));

console.log("Generated Portfolio identity assets from the approved memoji-behind-laptop source.");

async function renderIdentityAsset(size, mark, sourceInfo, markBounds, background) {
  const subjectSize = Math.round(size * IDENTITY_SUBJECT_SCALE);
  const artwork = await sharp(mark, { raw: sourceInfo })
    .extract(markBounds)
    .resize({
      width: subjectSize,
      height: subjectSize,
      fit: "contain",
      background: "transparent",
    })
    .png()
    .toBuffer();
  const inset = Math.floor((size - subjectSize) / 2);

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background,
    },
  }).composite([{ input: artwork, left: inset, top: inset }]);
}

async function renderFavicon(size, mark, sourceInfo, markBounds) {
  const markSize = Math.max(1, Math.round(size * FAVICON_SUBJECT_SCALE));
  const renderedMark = await sharp(mark, { raw: sourceInfo })
    .extract(markBounds)
    .resize({
      width: markSize,
      height: markSize,
      fit: "contain",
      background: "transparent",
    })
    .png()
    .toBuffer();
  const markInset = Math.floor((size - markSize) / 2);
  const radius = Math.max(3, Math.round(size * 0.22));
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><rect width="${size}" height="${size}" rx="${radius}" fill="${MASK_SRGB}"/></svg>`,
  );

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: FAVICON_BACKGROUND_SRGB,
    },
  }).composite([
    { input: renderedMark, left: markInset, top: markInset },
    { input: mask, blend: "dest-in" },
  ]);
}

function extractIdentityLayers(data, info) {
  const background = findConnectedBackground(data, info);
  const mark = Buffer.alloc(data.length);
  let maxX = -1;
  let maxY = -1;
  let minX = info.width;
  let minY = info.height;

  for (let pixel = 0; pixel < info.width * info.height; pixel += 1) {
    const offset = pixel * 4;
    const alpha = data[offset + 3];
    const x = pixel % info.width;
    const y = Math.floor(pixel / info.width);

    if (alpha < 16) {
      continue;
    }

    if (background[pixel] === 1) {
      continue;
    }

    mark[offset] = data[offset];
    mark[offset + 1] = data[offset + 1];
    mark[offset + 2] = data[offset + 2];
    mark[offset + 3] = alpha;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  if (maxX < minX || maxY < minY) {
    throw new Error("Portfolio identity source does not contain a foreground mark.");
  }

  return {
    mark,
    markBounds: {
      left: minX,
      top: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
    },
  };
}

function findConnectedBackground(data, info) {
  const background = new Uint8Array(info.width * info.height);
  const queue = [];
  const enqueue = (x, y) => {
    const pixel = y * info.width + x;
    if (background[pixel] === 1 || !isBackgroundCandidate(data, pixel)) {
      return;
    }
    background[pixel] = 1;
    queue.push(pixel);
  };

  for (let x = 0; x < info.width; x += 1) {
    enqueue(x, 0);
    enqueue(x, info.height - 1);
  }
  for (let y = 0; y < info.height; y += 1) {
    enqueue(0, y);
    enqueue(info.width - 1, y);
  }

  for (let index = 0; index < queue.length; index += 1) {
    const pixel = queue[index];
    const x = pixel % info.width;
    const y = Math.floor(pixel / info.width);
    if (x > 0) enqueue(x - 1, y);
    if (x + 1 < info.width) enqueue(x + 1, y);
    if (y > 0) enqueue(x, y - 1);
    if (y + 1 < info.height) enqueue(x, y + 1);
  }

  return background;
}

function isBackgroundCandidate(data, pixel) {
  const offset = pixel * 4;
  return (
    data[offset + 3] > 0 &&
    data[offset] >= 230 &&
    data[offset + 1] >= 230 &&
    data[offset + 2] >= 230
  );
}

function createIco(frames) {
  const headerSize = 6;
  const entrySize = 16;
  const imageOffset = headerSize + frames.length * entrySize;
  const header = Buffer.alloc(imageOffset);

  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(frames.length, 4);

  let nextOffset = imageOffset;
  frames.forEach((frame, index) => {
    const width = frame.readUInt32BE(16);
    const height = frame.readUInt32BE(20);
    const entryOffset = headerSize + index * entrySize;

    header.writeUInt8(width >= 256 ? 0 : width, entryOffset);
    header.writeUInt8(height >= 256 ? 0 : height, entryOffset + 1);
    header.writeUInt8(0, entryOffset + 2);
    header.writeUInt8(0, entryOffset + 3);
    header.writeUInt16LE(1, entryOffset + 4);
    header.writeUInt16LE(32, entryOffset + 6);
    header.writeUInt32LE(frame.length, entryOffset + 8);
    header.writeUInt32LE(nextOffset, entryOffset + 12);
    nextOffset += frame.length;
  });

  return Buffer.concat([header, ...frames]);
}

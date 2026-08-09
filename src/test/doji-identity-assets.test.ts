import { readFileSync } from "node:fs";

import sharp from "sharp";
import { describe, expect, it } from "vite-plus/test";

type Bounds = {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
};

async function readIdentityStats(image: Buffer) {
  const { data, info } = await sharp(image).ensureAlpha().raw().toBuffer({
    resolveWithObject: true,
  });
  const rgbaAt = (x: number, y: number) => {
    const offset = (y * info.width + x) * 4;
    return Array.from(data.subarray(offset, offset + 4));
  };
  let blackPixels = 0;
  let colorMaxX = -1;
  let colorMaxY = -1;
  let colorMinX = info.width;
  let colorMinY = info.height;
  let coloredPixels = 0;
  let contrastMaxX = -1;
  let contrastMaxY = -1;
  let contrastMinX = info.width;
  let contrastMinY = info.height;
  let maxX = -1;
  let maxY = -1;
  let minX = info.width;
  let minY = info.height;
  let whitePixels = 0;
  let whiteMaxX = -1;
  let whiteMaxY = -1;
  let whiteMinX = info.width;
  let whiteMinY = info.height;
  const backgroundRed = data[0];
  const backgroundGreen = data[1];
  const backgroundBlue = data[2];

  for (let offset = 0; offset < data.length; offset += 4) {
    const pixel = offset / 4;
    const x = pixel % info.width;
    const y = Math.floor(pixel / info.width);
    const red = data[offset];
    const green = data[offset + 1];
    const blue = data[offset + 2];
    const alpha = data[offset + 3];

    if (alpha === 0) {
      continue;
    }

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);

    if (
      Math.max(
        Math.abs(red - backgroundRed),
        Math.abs(green - backgroundGreen),
        Math.abs(blue - backgroundBlue),
      ) > 8
    ) {
      contrastMinX = Math.min(contrastMinX, x);
      contrastMinY = Math.min(contrastMinY, y);
      contrastMaxX = Math.max(contrastMaxX, x);
      contrastMaxY = Math.max(contrastMaxY, y);
    }

    if (Math.max(red, green, blue) - Math.min(red, green, blue) > 8) {
      coloredPixels += 1;
      colorMinX = Math.min(colorMinX, x);
      colorMinY = Math.min(colorMinY, y);
      colorMaxX = Math.max(colorMaxX, x);
      colorMaxY = Math.max(colorMaxY, y);
    }
    if (alpha > 240 && red < 16 && green < 16 && blue < 16) {
      blackPixels += 1;
    }
    if (alpha > 127 && red > 127 && green > 127 && blue > 127) {
      whitePixels += 1;
      whiteMinX = Math.min(whiteMinX, x);
      whiteMinY = Math.min(whiteMinY, y);
      whiteMaxX = Math.max(whiteMaxX, x);
      whiteMaxY = Math.max(whiteMaxY, y);
    }
  }

  return {
    blackPixels,
    coloredBounds: toBounds(colorMinX, colorMinY, colorMaxX, colorMaxY, info.width, info.height),
    coloredPixels,
    contrastBounds: toBounds(
      contrastMinX,
      contrastMinY,
      contrastMaxX,
      contrastMaxY,
      info.width,
      info.height,
    ),
    corners: [
      rgbaAt(0, 0)[3],
      rgbaAt(info.width - 1, 0)[3],
      rgbaAt(0, info.height - 1)[3],
      rgbaAt(info.width - 1, info.height - 1)[3],
    ],
    height: info.height,
    opaqueBounds: toBounds(minX, minY, maxX, maxY, info.width, info.height),
    rgbaAt,
    whiteBounds: toBounds(whiteMinX, whiteMinY, whiteMaxX, whiteMaxY, info.width, info.height),
    whitePixels,
    width: info.width,
  };
}

function toBounds(
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
  width: number,
  height: number,
): Bounds {
  return {
    bottom: height - maxY - 1,
    height: maxY - minY + 1,
    left: minX,
    right: width - maxX - 1,
    top: minY,
    width: maxX - minX + 1,
  };
}

function expectCentered(bounds: Bounds, tolerance = 1) {
  expect(Math.abs(bounds.left - bounds.right)).toBeLessThanOrEqual(tolerance);
  expect(Math.abs(bounds.top - bounds.bottom)).toBeLessThanOrEqual(tolerance);
}

describe("Portfolio identity assets", () => {
  it("generates every derivative from the approved memoji-behind-laptop source", () => {
    const generator = readFileSync(
      new URL("../../scripts/generate-identity-assets.mjs", import.meta.url),
      "utf8",
    );

    expect(generator).toContain('"scripts/assets/app-logo-source.png"');
    expect(generator).toContain("extractIdentityLayers");
    expect(generator).not.toContain(".svg");
    expect(generator).not.toContain("favicon-mark");
  });

  it("keeps full-color unmasked identity artwork on white or black backgrounds", async () => {
    for (const [fileName, size, background] of [
      ["app-logo-120.png", 120, [255, 255, 255, 255]],
      ["apple-touch-icon.png", 180, [0, 0, 0, 255]],
      ["android-chrome-192x192.png", 192, [0, 0, 0, 255]],
      ["android-chrome-512x512.png", 512, [0, 0, 0, 255]],
    ] as const) {
      const stats = await readIdentityStats(
        readFileSync(new URL(`../../public/${fileName}`, import.meta.url)),
      );

      expect(stats.width).toBe(size);
      expect(stats.height).toBe(size);
      expect(stats.coloredPixels).toBeGreaterThan(size);
      expect(stats.corners).toEqual([255, 255, 255, 255]);
      expect(stats.rgbaAt(0, 0)).toEqual(background);
      expectCentered(stats.contrastBounds, Math.ceil(size * 0.02));
    }
  });

  it("uses identical centered navbar geometry on white and black backgrounds", async () => {
    const [light, dark] = await Promise.all(
      ["app-logo-120-navbar-light.png", "app-logo-120-navbar-dark.png"].map((fileName) =>
        readIdentityStats(readFileSync(new URL(`../../public/${fileName}`, import.meta.url))),
      ),
    );

    expect(light.opaqueBounds).toEqual({
      bottom: 0,
      height: 120,
      left: 0,
      right: 0,
      top: 0,
      width: 120,
    });
    expect(dark.opaqueBounds).toEqual(light.opaqueBounds);
    expect(light.contrastBounds).toEqual(dark.contrastBounds);
    expectCentered(light.contrastBounds, 2);
    expect(light.corners).toEqual([255, 255, 255, 255]);
    expect(dark.corners).toEqual([255, 255, 255, 255]);
    expect(light.rgbaAt(0, 0)).toEqual([255, 255, 255, 255]);
    expect(dark.rgbaAt(0, 0)).toEqual([0, 0, 0, 255]);
    expect(light.coloredPixels).toBeGreaterThan(500);
    expect(dark.coloredPixels).toBeGreaterThan(500);
  });

  it("uses the full-color source subject on black with rounded transparent corners", async () => {
    for (const fileName of ["favicon-16x16.png", "favicon-32x32.png"]) {
      const stats = await readIdentityStats(
        readFileSync(new URL(`../../public/${fileName}`, import.meta.url)),
      );

      expect(stats.corners).toEqual([0, 0, 0, 0]);
      expect(stats.blackPixels).toBeGreaterThan(20);
      expect(stats.whitePixels).toBeGreaterThan(2);
      expect(stats.coloredPixels).toBeGreaterThan(2);
      expect(stats.width).toBe(stats.height);
      expectCentered(stats.contrastBounds, 2);
    }
  });

  it("keeps both rounded PNG frames in favicon.ico", async () => {
    const faviconIco = readFileSync(new URL("../../public/favicon.ico", import.meta.url));
    const iconCount = faviconIco.readUInt16LE(4);

    expect(iconCount).toBeGreaterThanOrEqual(2);

    for (let index = 0; index < iconCount; index += 1) {
      const entryOffset = 6 + index * 16;
      const byteLength = faviconIco.readUInt32LE(entryOffset + 8);
      const imageOffset = faviconIco.readUInt32LE(entryOffset + 12);
      const frame = faviconIco.subarray(imageOffset, imageOffset + byteLength);

      expect(frame.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
      const stats = await readIdentityStats(frame);
      expect(stats.coloredPixels).toBeGreaterThan(0);
      expect(stats.corners).toEqual([0, 0, 0, 0]);
    }
  });
});

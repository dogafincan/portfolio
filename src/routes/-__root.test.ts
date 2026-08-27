import { readFileSync } from "node:fs";

import sharp from "sharp";
import { describe, expect, it } from "vite-plus/test";

function readPngSize(path: string) {
  const image = readFileSync(new URL(path, import.meta.url));

  expect(image.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");

  return {
    width: image.readUInt32BE(16),
    height: image.readUInt32BE(20),
  };
}

async function readPngCornerRgba(path: string) {
  const image = readFileSync(new URL(path, import.meta.url));
  const { data } = await sharp(image).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  return Array.from(data.subarray(0, 4));
}

describe("RootDocument head", () => {
  it("declares app manifest, shared logo assets, and mobile chrome colors", () => {
    const source = readFileSync(new URL("./__root.tsx", import.meta.url), "utf8");
    const manifest = readFileSync(new URL("../../public/manifest.json", import.meta.url), "utf8");
    const assetSource = readFileSync(
      new URL("../lib/portfolio.assets.ts", import.meta.url),
      "utf8",
    );
    const generator = readFileSync(
      new URL("../../scripts/generate-identity-assets.mjs", import.meta.url),
      "utf8",
    );

    expect(source).toContain('const APP_CHROME_COLOR = "#ffffff";');
    expect(source).toContain('const APP_CHROME_COLOR_DARK = "#090909";');
    expect(source).toContain('content: "width=device-width, initial-scale=1, viewport-fit=cover"');
    expect(source).toContain(
      'import geistLatinWghtNormal from "@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url";',
    );
    expect(source).toMatch(
      /rel: "preload"[\s\S]*href: geistLatinWghtNormal[\s\S]*as: "font"[\s\S]*type: "font\/woff2"[\s\S]*crossOrigin: "anonymous"[\s\S]*rel: "stylesheet"[\s\S]*href: appCss/,
    );
    expect(source).toContain('name="theme-color"');
    expect(source).toContain("content={APP_CHROME_COLOR}");
    expect(source).toContain('media="(prefers-color-scheme: light)"');
    expect(source).toContain("content={APP_CHROME_COLOR_DARK}");
    expect(source).toContain('media="(prefers-color-scheme: dark)"');
    expect(source).toContain("<body>");
    expect(source).not.toContain('<body className="bg-background">');
    expect(source).toContain('rel: "manifest"');
    expect(assetSource).toContain('APP_ICON_ASSET_VERSION = "2026082701"');
    expect(generator).toContain('IDENTITY_ASSET_VERSION = "2026082701"');
    expect(source).toContain('href: versionAppAsset("/manifest.json")');
    expect(source).toContain('href: versionAppAsset("/favicon.ico")');
    expect(source).not.toContain('href: "/favicon.svg"');
    expect(source).toContain('href: versionAppAsset("/favicon-16x16.png")');
    expect(source).toContain('href: versionAppAsset("/favicon-32x32.png")');
    expect(source).toContain('rel: "apple-touch-icon"');
    expect(source).toContain('href: versionAppAsset("/apple-touch-icon.png")');
    expect(source).not.toContain("favicon-light");
    expect(source).not.toContain("favicon-dark");
    expect(manifest).toContain('"/android-chrome-192x192.png?v=2026082701"');
    expect(manifest).toContain('"/android-chrome-512x512.png?v=2026082701"');
    expect(manifest).toContain('"theme_color": "#FFFFFF"');
    expect(manifest).toContain('"background_color": "#FCFCFC"');
    expect(manifest).toContain('"short_name": "Doga Fincan"');
    expect(manifest).toContain('"name": "Doga Fincan"');
    expect(readPngSize("../../public/app-logo-120.png")).toEqual({ width: 120, height: 120 });
    expect(readPngSize("../../public/apple-touch-icon.png")).toEqual({ width: 180, height: 180 });
    expect(readPngSize("../../public/android-chrome-192x192.png")).toEqual({
      width: 192,
      height: 192,
    });
    expect(readPngSize("../../public/android-chrome-512x512.png")).toEqual({
      width: 512,
      height: 512,
    });
  });

  it("keeps the Portfolio install identity on the approved black canvas", async () => {
    for (const fileName of [
      "apple-touch-icon.png",
      "android-chrome-192x192.png",
      "android-chrome-512x512.png",
    ]) {
      await expect(readPngCornerRgba(`../../public/${fileName}`)).resolves.toEqual([0, 0, 0, 255]);
    }
  });

  it("mounts restore recovery and a visible root error fallback", () => {
    const source = readFileSync(new URL("./__root.tsx", import.meta.url), "utf8");

    expect(source).toContain('from "../components/app-recovery"');
    expect(source).toMatch(
      /<body>[\s\S]*<AppErrorBoundary>[\s\S]*\{children\}[\s\S]*<\/AppErrorBoundary>[\s\S]*<AppRecovery \/>[\s\S]*<Scripts \/>[\s\S]*<\/body>/,
    );
    expect(source).toContain(
      "{isStaticNotFoundDocument ? <StaticNotFoundHead /> : <HeadContent />}",
    );
  });

  it("serves fingerprinted build assets with immutable browser caching", () => {
    const headers = readFileSync(new URL("../../public/_headers", import.meta.url), "utf8");

    expect(headers).toContain("/assets/*");
    expect(headers).toContain("Cache-Control: public, max-age=31536000, immutable");
  });
});

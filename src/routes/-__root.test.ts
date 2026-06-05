import { readFileSync } from "node:fs";

import { describe, expect, it } from "vite-plus/test";

function readPngSize(path: string) {
  const image = readFileSync(new URL(path, import.meta.url));

  expect(image.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");

  return {
    width: image.readUInt32BE(16),
    height: image.readUInt32BE(20),
  };
}

describe("RootDocument head", () => {
  it("declares app manifest, shared logo assets, and mobile chrome colors", () => {
    const source = readFileSync(new URL("./__root.tsx", import.meta.url), "utf8");
    const manifest = readFileSync(new URL("../../public/manifest.json", import.meta.url), "utf8");

    expect(source).toContain('const APP_CHROME_COLOR = "#58BAD9";');
    expect(source).toContain('const APP_CHROME_COLOR_DARK = "#428FA8";');
    expect(source).toContain('content: "width=device-width, initial-scale=1, viewport-fit=cover"');
    expect(source).toContain(
      'import interLatinWghtNormal from "@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url";',
    );
    expect(source).toMatch(
      /rel: "preload"[\s\S]*href: interLatinWghtNormal[\s\S]*as: "font"[\s\S]*type: "font\/woff2"[\s\S]*crossOrigin: "anonymous"[\s\S]*rel: "stylesheet"[\s\S]*href: appCss/,
    );
    expect(source).toContain('name="theme-color"');
    expect(source).toContain("content={APP_CHROME_COLOR}");
    expect(source).toContain('media="(prefers-color-scheme: light)"');
    expect(source).toContain("content={APP_CHROME_COLOR_DARK}");
    expect(source).toContain('media="(prefers-color-scheme: dark)"');
    expect(source).toContain("<body>");
    expect(source).not.toContain('<body className="bg-background">');
    expect(source).toContain('rel: "manifest"');
    expect(source).toContain('href: "/manifest.json"');
    expect(source).toContain('href: "/favicon.ico"');
    expect(source).not.toContain('href: "/favicon.svg"');
    expect(source).toContain('href: "/favicon-16x16.png"');
    expect(source).toContain('href: "/favicon-32x32.png"');
    expect(source).toContain('rel: "apple-touch-icon"');
    expect(source).toContain('href: "/apple-touch-icon.png"');
    expect(source).not.toContain("favicon-light");
    expect(source).not.toContain("favicon-dark");
    expect(manifest).toContain('"/android-chrome-192x192.png"');
    expect(manifest).toContain('"/android-chrome-512x512.png"');
    expect(manifest).toContain('"theme_color": "#58BAD9"');
    expect(manifest).toContain('"background_color": "#58BAD9"');
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
});

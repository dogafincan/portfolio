import { readFileSync } from "node:fs";

import { describe, expect, it } from "vite-plus/test";

describe("RootDocument head", () => {
  it("declares app manifest, shared logo assets, and mobile chrome colors", () => {
    const source = readFileSync(new URL("./__root.tsx", import.meta.url), "utf8");
    const manifest = readFileSync(new URL("../../public/manifest.json", import.meta.url), "utf8");

    expect(source).toContain('const APP_CHROME_COLOR = "#b9d0f8";');
    expect(source).toContain('const APP_CHROME_COLOR_DARK = "#3f8fc2";');
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
    expect(source).toContain('rel: "manifest"');
    expect(source).toContain('href: "/manifest.json"');
    expect(source).toContain('href: "/favicon.svg"');
    expect(source).toContain('href: "/favicon-16x16.png"');
    expect(source).toContain('href: "/favicon-32x32.png"');
    expect(source).toContain('rel: "apple-touch-icon"');
    expect(source).toContain('href: "/apple-touch-icon.png"');
    expect(source).not.toContain("favicon-light");
    expect(source).not.toContain("favicon-dark");
    expect(manifest).toContain('"/android-chrome-192x192.png"');
    expect(manifest).toContain('"/android-chrome-512x512.png"');
    expect(manifest).toContain('"theme_color": "#b9d0f8"');
    expect(manifest).toContain('"background_color": "#b9d0f8"');
  });
});

import { readFileSync } from "node:fs";

import { describe, expect, it } from "vite-plus/test";

const ATMOSPHERE_ASSET_SIZE = { width: 864, height: 720 };
const ATMOSPHERE_ASSETS = ["public/page-atmosphere.avif", "public/page-atmosphere-dark.avif"];

function readAvifIntrinsicSize(assetPath: string) {
  const image = readFileSync(assetPath);
  let offset = image.indexOf("ispe", 0, "ascii");

  while (offset !== -1) {
    if (offset >= 4 && offset + 16 <= image.length && image.readUInt32BE(offset - 4) >= 20) {
      return {
        width: image.readUInt32BE(offset + 8),
        height: image.readUInt32BE(offset + 12),
      };
    }

    offset = image.indexOf("ispe", offset + 4, "ascii");
  }

  throw new Error(`Missing AVIF ispe size box in ${assetPath}.`);
}

describe("global styles", () => {
  it("uses the system color scheme for dark mode", () => {
    const styles = readFileSync("src/styles.css", "utf8");

    expect(styles).toContain("@media (prefers-color-scheme: dark)");
    expect(styles).toContain("color-scheme: light;");
    expect(styles).toContain("color-scheme: dark;");
    expect(styles.match(/--background: oklch\(0.145 0 0\);/g)).toHaveLength(2);
    expect(styles.match(/--portfolio-page-background: var\(--background\);/g)).toHaveLength(3);
    expect(styles).not.toContain("--portfolio-page-background: var(--portfolio-app-chrome-color);");
    expect(styles).not.toContain("@custom-variant dark (&:is(.dark *));");
  });

  it("keeps mobile chrome colors while letting the lower page resolve to white or dark background", () => {
    const styles = readFileSync("src/styles.css", "utf8");
    const rootStart = styles.indexOf(":root {");
    const rootEnd = styles.indexOf("\n}\n\n.dark", rootStart);
    const lightRoot = styles.slice(rootStart, rootEnd);
    const darkClassStart = styles.indexOf(".dark {");
    const darkClassEnd = styles.indexOf("\n}\n\n@media", darkClassStart);
    const darkClass = styles.slice(darkClassStart, darkClassEnd);
    const darkMediaStart = styles.indexOf("@media (prefers-color-scheme: dark)");
    const darkMedia = styles.slice(darkMediaStart, styles.indexOf("\n}\n\n@media", darkMediaStart));

    expect(styles.match(/--portfolio-app-chrome-color:/g)).toHaveLength(3);
    expect(lightRoot).toContain("--portfolio-app-chrome-color: #58bad9;");
    expect(darkClass).toContain("--portfolio-app-chrome-color: #428fa8;");
    expect(darkMedia).toContain("--portfolio-app-chrome-color: #428fa8;");
    expect(lightRoot).toContain("--portfolio-page-background: var(--background);");
    expect(darkClass).toContain("--portfolio-page-background: var(--background);");
    expect(darkMedia).toContain("--portfolio-page-background: var(--background);");
  });

  it("uses the pattern artwork as fixed-length body background layers that fade into the page background", () => {
    const styles = readFileSync("src/styles.css", "utf8");
    const rootStart = styles.indexOf(":root {");
    const rootEnd = styles.indexOf("\n}\n\n.dark", rootStart);
    const lightRoot = styles.slice(rootStart, rootEnd);
    const darkClassStart = styles.indexOf(".dark {");
    const darkClassEnd = styles.indexOf("\n}\n\n@media", darkClassStart);
    const darkClass = styles.slice(darkClassStart, darkClassEnd);
    const darkMediaStart = styles.indexOf("@media (prefers-color-scheme: dark)");
    const darkMedia = styles.slice(darkMediaStart, styles.indexOf("\n}\n\n@media", darkMediaStart));

    expect(lightRoot).toContain(
      '--portfolio-header-atmosphere-image: url("/page-atmosphere.avif");',
    );
    expect(darkClass).toContain(
      '--portfolio-header-atmosphere-image: url("/page-atmosphere-dark.avif");',
    );
    expect(darkMedia).toContain(
      '--portfolio-header-atmosphere-image: url("/page-atmosphere-dark.avif");',
    );
    expect(styles).toContain("--portfolio-header-atmosphere-height: 96rem;");
    expect(styles).toContain("--portfolio-header-atmosphere-size: 180% auto;");
    expect(styles).toContain("--portfolio-header-atmosphere-fade-start: 18.75rem;");
    // The first visible page-background mix lands at 37.5rem / 600px.
    // The first visible page-background mix lands at 37.5rem / 600px.
    expect(styles).toContain("--portfolio-header-atmosphere-fade-soft: 37.5rem;");
    expect(styles).toContain("--portfolio-header-atmosphere-fade-strong: 59.25rem;");
    expect(styles).toContain("--portfolio-header-atmosphere-fade-end: 77.25rem;");
    expect(styles.match(/--portfolio-header-atmosphere-fade-start:/g)).toHaveLength(1);
    expect(styles).not.toMatch(
      /--portfolio-header-atmosphere-(?:height|fade-[^:]+): [^;]*(?:svh|vh|dvh|lvh|%)/,
    );
    expect(styles).not.toContain("--portfolio-header-cloud-image");
    expect(styles).not.toContain('url("/header-clouds');
  });

  it("keeps atmosphere artwork top-cropped so it cannot repaint lower mobile gutters", () => {
    for (const assetPath of ATMOSPHERE_ASSETS) {
      expect(readAvifIntrinsicSize(assetPath)).toEqual(ATMOSPHERE_ASSET_SIZE);
    }
  });

  it("keeps the atmosphere on body backgrounds so it cannot add scroll height", () => {
    const styles = readFileSync("src/styles.css", "utf8");
    const htmlStart = styles.indexOf("html {");
    const htmlEnd = styles.indexOf("\n  }\n", htmlStart);
    const bodyStart = styles.indexOf("body {", htmlEnd);
    const bodyEnd = styles.indexOf("\n  }\n", bodyStart);
    const htmlBlock = styles.slice(htmlStart, htmlEnd);
    const bodyBlock = styles.slice(bodyStart, bodyEnd);

    expect(htmlBlock).toContain("background: var(--portfolio-page-background);");
    expect(bodyBlock).toContain("background-color: var(--portfolio-page-background);");
    expect(bodyBlock).toContain("background-image:");
    expect(bodyBlock).toContain("linear-gradient(");
    expect(bodyBlock).toContain("transparent var(--portfolio-header-atmosphere-fade-start),");
    expect(bodyBlock).toContain(
      "color-mix(in oklab, var(--portfolio-page-background) 12%, transparent)",
    );
    expect(bodyBlock).toContain(
      "color-mix(in oklab, var(--portfolio-page-background) 56%, transparent)",
    );
    expect(bodyBlock).toContain(
      "var(--portfolio-page-background) var(--portfolio-header-atmosphere-fade-end)",
    );
    expect(bodyBlock).toContain("var(--portfolio-header-atmosphere-image)");
    expect(bodyBlock).toContain("background-repeat: no-repeat, no-repeat;");
    expect(bodyBlock).toContain("100% var(--portfolio-header-atmosphere-height)");
    expect(bodyBlock).toContain("var(--portfolio-header-atmosphere-size);");
    expect(bodyBlock).not.toContain("height: var(--portfolio-header-atmosphere-height);");
    expect(bodyBlock).not.toContain("position: absolute;");
    expect(styles).not.toContain("body::before");
    expect(styles).not.toContain("body::after");
    expect(styles).not.toContain("main.app-shell::before");
    expect(styles).not.toContain("--portfolio-header-clearance");
  });

  it("styles the root top-edge iOS tint sentinel for Safari safe-area sampling", () => {
    const styles = readFileSync("src/styles.css", "utf8");
    const sentinelStart = styles.indexOf("[data-ios-safari-top-tint] {");
    const sentinelEnd = styles.indexOf("\n      }\n", sentinelStart);
    const sentinelBlock = styles.slice(sentinelStart, sentinelEnd);

    expect(styles).toContain("@supports (-webkit-touch-callout: none)");
    expect(styles).toContain("@media (hover: none) and (pointer: coarse)");
    expect(styles).toContain("[data-ios-safari-top-tint]");
    expect(sentinelBlock).toContain("position: fixed;");
    expect(sentinelBlock).toContain("inset: 0 0 auto;");
    expect(sentinelBlock).toContain("height: max(7rem, env(safe-area-inset-top, 0px));");
    expect(sentinelBlock).toContain("background-color: var(--portfolio-app-chrome-color);");
    expect(sentinelBlock).toContain("pointer-events: none;");
    expect(sentinelBlock).toContain("z-index: 0;");
  });

  it("uses the lower page background token for root safe areas and body color", () => {
    const styles = readFileSync("src/styles.css", "utf8");
    const htmlStart = styles.indexOf("html {");
    const htmlEnd = styles.indexOf("\n  }\n", htmlStart);
    const bodyStart = styles.indexOf("body {", htmlEnd);
    const bodyEnd = styles.indexOf("\n  }\n", bodyStart);
    const htmlBlock = styles.slice(htmlStart, htmlEnd);
    const bodyBlock = styles.slice(bodyStart, bodyEnd);

    expect(htmlBlock).toContain("background: var(--portfolio-page-background);");
    expect(bodyBlock).toContain("background-color: var(--portfolio-page-background);");
    expect(htmlBlock).not.toContain("background: var(--portfolio-app-chrome-color);");
    expect(bodyBlock).not.toContain("background-color: var(--portfolio-app-chrome-color);");
  });

  it("does not use global styles to swap the header logo by theme", () => {
    const styles = readFileSync("src/styles.css", "utf8");

    expect(styles).not.toContain('[data-slot="app-logo-for-light-mode"]');
    expect(styles).not.toContain('[data-slot="app-logo-for-dark-mode"]');
  });

  it("defines softened iMessage-blue primary button colors for light and dark schemes", () => {
    const styles = readFileSync("src/styles.css", "utf8");
    const rootStart = styles.indexOf(":root {");
    const rootEnd = styles.indexOf("\n}\n\n.dark", rootStart);
    const lightRoot = styles.slice(rootStart, rootEnd);
    const darkClassStart = styles.indexOf(".dark {");
    const darkClassEnd = styles.indexOf("\n}\n\n@media", darkClassStart);
    const darkClass = styles.slice(darkClassStart, darkClassEnd);
    const darkMediaStart = styles.indexOf("@media (prefers-color-scheme: dark)");
    const darkMedia = styles.slice(darkMediaStart, styles.indexOf("\n}\n\n@media", darkMediaStart));

    expect(styles.match(/--button-primary:/g)).toHaveLength(3);
    expect(lightRoot).toContain("--button-primary: color-mix(in oklab, #007aff 90%, #ffffff);");
    expect(lightRoot).toContain(
      "--button-primary-hover: color-mix(in oklab, #0071eb 90%, #ffffff);",
    );
    expect(lightRoot).toContain(
      "--button-primary-active: color-mix(in oklab, #0067d6 90%, #ffffff);",
    );
    expect(lightRoot).toContain("--button-primary-disabled: #9ed2ff;");
    expect(lightRoot).toContain("--button-primary-foreground: #ffffff;");
    expect(lightRoot).toContain(
      "--button-primary-disabled-foreground: color-mix(in oklab, #ffffff 82%, transparent);",
    );
    expect(lightRoot).toContain(
      "--button-primary-ring: color-mix(in oklab, var(--button-primary) 40%, transparent);",
    );
    expect(darkClass).toContain("--button-primary: color-mix(in oklab, #0a84ff 90%, var(--card));");
    expect(darkClass).toContain(
      "--button-primary-hover: color-mix(in oklab, #007aff 90%, var(--card));",
    );
    expect(darkClass).toContain(
      "--button-primary-active: color-mix(in oklab, #006ed6 90%, var(--card));",
    );
    expect(darkClass).toContain("--button-primary-disabled: #1b5f9e;");
    expect(darkClass).toContain("--button-primary-foreground: #ffffff;");
    expect(darkClass).toContain(
      "--button-primary-disabled-foreground: color-mix(in oklab, #ffffff 70%, transparent);",
    );
    expect(darkClass).toContain(
      "--button-primary-ring: color-mix(in oklab, var(--button-primary) 50%, transparent);",
    );
    expect(darkMedia).toContain("--button-primary: color-mix(in oklab, #0a84ff 90%, var(--card));");
  });
});

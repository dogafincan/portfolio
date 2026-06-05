import { readFileSync } from "node:fs";

import { describe, expect, it } from "vite-plus/test";

const ATMOSPHERE_SOURCE_ASSET_SIZE = { width: 864, height: 720 };
const ATMOSPHERE_TOP_ASSET_SIZE = { width: 864, height: 1536 };
const ATMOSPHERE_REPEAT_ASSET_SIZE = { width: 864, height: 512 };
const ATMOSPHERE_SOURCE_ASSETS = [
  "scripts/assets/page-atmosphere-source.avif",
  "scripts/assets/page-atmosphere-dark-source.avif",
];
const ATMOSPHERE_TOP_ASSETS = ["public/page-atmosphere.avif", "public/page-atmosphere-dark.avif"];
const ATMOSPHERE_REPEAT_ASSETS = [
  "public/page-atmosphere-repeat.avif",
  "public/page-atmosphere-repeat-dark.avif",
];

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
    expect(
      styles.match(/--portfolio-page-background: var\(--portfolio-app-chrome-color\);/g),
    ).toHaveLength(3);
    expect(styles).not.toContain("--portfolio-page-background: var(--background);");
    expect(styles).not.toContain("@custom-variant dark (&:is(.dark *));");
  });

  it("uses sampled blue app chrome colors as the root page background", () => {
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
    expect(lightRoot).toContain("--portfolio-app-chrome-color: #5ab6dc;");
    expect(darkClass).toContain("--portfolio-app-chrome-color: #428ca9;");
    expect(darkMedia).toContain("--portfolio-app-chrome-color: #428ca9;");
    expect(lightRoot).toContain("--portfolio-page-background: var(--portfolio-app-chrome-color);");
    expect(darkClass).toContain("--portfolio-page-background: var(--portfolio-app-chrome-color);");
    expect(darkMedia).toContain("--portfolio-page-background: var(--portfolio-app-chrome-color);");
  });

  it("uses generated top and repeat artwork instead of CSS gradient fades", () => {
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
    expect(lightRoot).toContain(
      '--portfolio-page-repeat-image: url("/page-atmosphere-repeat.avif");',
    );
    expect(darkClass).toContain(
      '--portfolio-page-repeat-image: url("/page-atmosphere-repeat-dark.avif");',
    );
    expect(darkMedia).toContain(
      '--portfolio-page-repeat-image: url("/page-atmosphere-repeat-dark.avif");',
    );
    expect(styles).toContain("--portfolio-header-atmosphere-height: 96rem;");
    expect(styles).toContain("--portfolio-header-atmosphere-width: 180%;");
    expect(styles).toContain(
      "--portfolio-header-atmosphere-repeat-start: var(--portfolio-header-atmosphere-height);",
    );
    expect(styles).toContain("--portfolio-header-atmosphere-width: 100%;");
    expect(styles).not.toContain("--portfolio-header-atmosphere-fade-");
    expect(styles).not.toContain("linear-gradient(");
    expect(styles).not.toMatch(
      /--portfolio-header-atmosphere-(?:height|repeat-start): [^;]*(?:svh|vh|dvh|lvh|%)/,
    );
    expect(styles).not.toContain("--portfolio-header-cloud-image");
    expect(styles).not.toContain('url("/header-clouds');
  });

  it("keeps source, generated top, and repeat atmosphere assets at their contract sizes", () => {
    for (const assetPath of ATMOSPHERE_SOURCE_ASSETS) {
      expect(readAvifIntrinsicSize(assetPath)).toEqual(ATMOSPHERE_SOURCE_ASSET_SIZE);
    }

    for (const assetPath of ATMOSPHERE_TOP_ASSETS) {
      expect(readAvifIntrinsicSize(assetPath)).toEqual(ATMOSPHERE_TOP_ASSET_SIZE);
    }

    for (const assetPath of ATMOSPHERE_REPEAT_ASSETS) {
      expect(readAvifIntrinsicSize(assetPath)).toEqual(ATMOSPHERE_REPEAT_ASSET_SIZE);
    }
  });

  it("keeps generated atmosphere artwork on body backgrounds so it cannot add scroll height", () => {
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
    expect(bodyBlock).toContain("var(--portfolio-header-atmosphere-image)");
    expect(bodyBlock).toContain("var(--portfolio-page-repeat-image)");
    expect(bodyBlock).toContain("center var(--portfolio-header-atmosphere-repeat-start);");
    expect(bodyBlock).toContain("background-repeat: no-repeat, repeat-y;");
    expect(bodyBlock).toContain(
      "var(--portfolio-header-atmosphere-width) var(--portfolio-header-atmosphere-height)",
    );
    expect(bodyBlock).toContain("var(--portfolio-header-atmosphere-width) auto;");
    expect(bodyBlock).not.toContain("linear-gradient(");
    expect(bodyBlock).not.toContain("height: var(--portfolio-header-atmosphere-height);");
    expect(bodyBlock).not.toContain("position: absolute;");
    expect(styles).not.toContain("body::before");
    expect(styles).not.toContain("body::after");
    expect(styles).not.toContain("main.app-shell::before");
    expect(styles).not.toContain("--portfolio-header-clearance");
  });

  it("uses the blue page background token for root safe areas and body color", () => {
    const styles = readFileSync("src/styles.css", "utf8");
    const htmlStart = styles.indexOf("html {");
    const htmlEnd = styles.indexOf("\n  }\n", htmlStart);
    const bodyStart = styles.indexOf("body {", htmlEnd);
    const bodyEnd = styles.indexOf("\n  }\n", bodyStart);
    const htmlBlock = styles.slice(htmlStart, htmlEnd);
    const bodyBlock = styles.slice(bodyStart, bodyEnd);

    expect(htmlBlock).toContain("background: var(--portfolio-page-background);");
    expect(bodyBlock).toContain("background-color: var(--portfolio-page-background);");
    expect(styles).toContain("--portfolio-page-background: var(--portfolio-app-chrome-color);");
    expect(styles).not.toContain("--portfolio-page-background: var(--background);");
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

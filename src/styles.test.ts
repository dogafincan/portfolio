import { readFileSync } from "node:fs";

import { describe, expect, it } from "vite-plus/test";

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
    expect(styles).not.toContain("--portfolio-page-background: #20264f;");
    expect(styles).not.toContain("--background: #20264f;");
    expect(styles).not.toContain("@custom-variant dark (&:is(.dark *));");
  });

  it("uses separate light and dark cloud page chrome", () => {
    const styles = readFileSync("src/styles.css", "utf8");
    const rootStart = styles.indexOf(":root {");
    const rootEnd = styles.indexOf("\n}\n\n.dark", rootStart);
    const lightRoot = styles.slice(rootStart, rootEnd);
    const darkClassStart = styles.indexOf(".dark {");
    const darkClassEnd = styles.indexOf("\n}\n\n@media", darkClassStart);
    const darkClass = styles.slice(darkClassStart, darkClassEnd);
    const darkMediaStart = styles.indexOf("@media (prefers-color-scheme: dark)");
    const darkMedia = styles.slice(darkMediaStart, styles.indexOf("\n}\n\n@layer", darkMediaStart));

    expect(styles.match(/--portfolio-app-chrome-color:/g)).toHaveLength(3);
    expect(lightRoot).toContain("--portfolio-app-chrome-color: #43c3ec;");
    expect(lightRoot).toContain('--portfolio-header-cloud-image: url("/header-clouds.avif");');
    expect(lightRoot).toContain("--portfolio-header-cloud-height: 80svh;");
    expect(lightRoot).toContain("--portfolio-header-cloud-position-x: center;");
    expect(lightRoot).toContain("--portfolio-header-cloud-position-y: -5rem;");
    expect(lightRoot).toContain("--portfolio-header-cloud-size: 240% auto;");
    expect(lightRoot).toContain('--portfolio-page-atmosphere-image: url("/page-atmosphere.avif");');
    expect(lightRoot).toContain("--portfolio-page-atmosphere-size: 180% auto;");
    expect(darkClass).toContain("--portfolio-app-chrome-color: #2fa9d1;");
    expect(darkClass).toContain('--portfolio-header-cloud-image: url("/header-clouds-dark.png");');
    expect(darkClass).toContain(
      '--portfolio-page-atmosphere-image: url("/page-atmosphere-dark.png");',
    );
    expect(darkMedia).toContain("--portfolio-app-chrome-color: #2fa9d1;");
    expect(darkMedia).toContain('--portfolio-header-cloud-image: url("/header-clouds-dark.png");');
    expect(darkMedia).toContain(
      '--portfolio-page-atmosphere-image: url("/page-atmosphere-dark.png");',
    );
    expect(styles).not.toContain("--portfolio-hero-gradient-height");
    expect(styles).not.toContain("--portfolio-hero-mesh");
    expect(styles).not.toContain("#d2f2ff");
    expect(styles).not.toContain("#4078bf");
    expect(styles).not.toContain(".dark body::before");
    expect(styles).not.toContain("#5068bd 0%");
    expect(styles).not.toContain("#2189b9 43%");
    expect(styles).not.toContain("#7861c5 100%");
  });

  it("uses the chrome color for root safe areas and page background", () => {
    const styles = readFileSync("src/styles.css", "utf8");
    const htmlStart = styles.indexOf("html {");
    const htmlEnd = styles.indexOf("\n  }\n\n  body", htmlStart);
    const bodyStart = styles.indexOf("body {", htmlEnd);
    const bodyEnd = styles.indexOf("\n  }\n\n  body::before", bodyStart);
    const htmlBlock = styles.slice(htmlStart, htmlEnd);
    const bodyBlock = styles.slice(bodyStart, bodyEnd);

    expect(htmlBlock).toContain("background: var(--portfolio-app-chrome-color);");
    expect(htmlBlock).not.toContain("background: var(--portfolio-page-background);");
    expect(bodyBlock).toContain("background: var(--portfolio-page-background);");
    expect(styles.match(/--portfolio-app-chrome-color: #43c3ec;/g)).toHaveLength(1);
    expect(styles.match(/--portfolio-app-chrome-color: #2fa9d1;/g)).toHaveLength(2);
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
    const darkMedia = styles.slice(darkMediaStart, styles.indexOf("\n}\n\n@layer", darkMediaStart));

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
    expect(darkMedia).toContain(
      "--button-primary-hover: color-mix(in oklab, #007aff 90%, var(--card));",
    );
    expect(darkMedia).toContain(
      "--button-primary-active: color-mix(in oklab, #006ed6 90%, var(--card));",
    );
    expect(darkMedia).toContain("--button-primary-disabled: #1b5f9e;");
    expect(darkMedia).toContain("--button-primary-foreground: #ffffff;");
    expect(darkMedia).toContain(
      "--button-primary-disabled-foreground: color-mix(in oklab, #ffffff 70%, transparent);",
    );
    expect(darkMedia).toContain(
      "--button-primary-ring: color-mix(in oklab, var(--button-primary) 50%, transparent);",
    );
  });

  it("does not use global styles to swap the header logo by theme", () => {
    const styles = readFileSync("src/styles.css", "utf8");

    expect(styles).not.toContain('[data-slot="app-logo-for-light-mode"]');
    expect(styles).not.toContain('[data-slot="app-logo-for-dark-mode"]');
  });

  it("uses a decorative image asset as the primary header cloud field", () => {
    const styles = readFileSync("src/styles.css", "utf8");
    const imageLayerStart = styles.indexOf("body::before");
    const imageLayerEnd = styles.indexOf("body::after", imageLayerStart);
    const atmosphereLayerStart = styles.indexOf("body::after");
    const atmosphereLayerEnd = styles.indexOf("code {", atmosphereLayerStart);
    const imageLayer = styles.slice(imageLayerStart, imageLayerEnd);
    const atmosphereLayer = styles.slice(atmosphereLayerStart, atmosphereLayerEnd);

    expect(imageLayerStart).toBeGreaterThan(-1);
    expect(atmosphereLayerStart).toBeGreaterThan(-1);
    expect(imageLayer).toContain("z-index: 1;");
    expect(imageLayer).toContain("background-image: var(--portfolio-header-cloud-image);");
    expect(imageLayer).toContain("background-position: var(--portfolio-header-cloud-position-x)");
    expect(imageLayer).toContain("var(--portfolio-header-cloud-position-y);");
    expect(imageLayer).toContain("background-repeat: no-repeat;");
    expect(imageLayer).toContain("background-size: var(--portfolio-header-cloud-size);");
    expect(imageLayer).toContain("mask-image: linear-gradient");
    expect(imageLayer).not.toContain("radial-gradient");
    expect(atmosphereLayer).toContain("z-index: 0;");
    expect(atmosphereLayer).toContain("background-image: var(--portfolio-page-atmosphere-image);");
    expect(atmosphereLayer).toContain("background-repeat: repeat-y;");
    expect(atmosphereLayer).toContain("background-size: var(--portfolio-page-atmosphere-size);");
    expect(atmosphereLayer).not.toContain("radial-gradient");
  });

  it("uses image layers instead of a CSS mesh continuation", () => {
    const styles = readFileSync("src/styles.css", "utf8");
    const mediaStart = styles.indexOf("@media (min-width: 640px)");
    const desktopMedia = styles.slice(mediaStart, styles.indexOf("\n}\n\n@layer", mediaStart));

    expect(styles).toContain("--portfolio-header-cloud-height: 80svh;");
    expect(styles).toContain("--portfolio-header-cloud-position-x: center;");
    expect(styles).toContain("--portfolio-header-cloud-position-y: -5rem;");
    expect(styles).toContain("--portfolio-header-cloud-size: 240% auto;");
    expect(desktopMedia).toContain("--portfolio-header-cloud-position-x: center;");
    expect(desktopMedia).toContain("--portfolio-header-cloud-position-y: -6rem;");
    expect(desktopMedia).toContain("--portfolio-header-cloud-size: cover;");
    expect(styles).toContain("--portfolio-page-atmosphere-size: 180% auto;");
    expect(desktopMedia).toContain("--portfolio-page-atmosphere-size: 100% auto;");
    expect(styles).not.toContain("--portfolio-mesh-continuation");
    expect(styles).not.toContain("--portfolio-hero-mesh");
  });

  it("reserves a cloud-free center behind the header identity", () => {
    const styles = readFileSync("src/styles.css", "utf8");
    const clearanceStart = styles.indexOf("main.app-shell::before");
    const clearanceEnd = styles.indexOf("\n  code {", clearanceStart);
    const clearanceLayer = styles.slice(clearanceStart, clearanceEnd);

    expect(styles).toContain("--portfolio-header-clearance-width: 28rem;");
    expect(styles).toContain("--portfolio-header-clearance-height: 14rem;");
    expect(styles).toContain("--portfolio-header-clearance-feather: 2.75rem;");
    expect(clearanceStart).toBeGreaterThan(-1);
    expect(clearanceLayer).toContain("z-index: -1;");
    expect(clearanceLayer).toContain("width: min(var(--portfolio-header-clearance-width), 74vw);");
    expect(clearanceLayer).toContain("height: var(--portfolio-header-clearance-height);");
    expect(clearanceLayer).toContain("background: var(--portfolio-page-background);");
    expect(clearanceLayer).toContain("box-shadow: 0 0 var(--portfolio-header-clearance-feather)");
    expect(clearanceLayer).toContain(
      "var(--portfolio-header-clearance-feather) var(--portfolio-page-background);",
    );
  });

  it("does not add a bottom safe-area fade layer", () => {
    const styles = readFileSync("src/styles.css", "utf8");

    expect(styles).not.toContain("--portfolio-safe-area-fade-height");
    expect(styles).not.toContain("main::after");
    expect(styles).not.toContain("var(--portfolio-app-chrome-color) 100%");
  });

  it("does not style project logo panels with standalone mesh backgrounds", () => {
    const styles = readFileSync("src/styles.css", "utf8");

    expect(styles).not.toContain('[data-slot="project-icon-panel"]');
    expect(styles).not.toContain("#fff0ea;");
    expect(styles).not.toContain("#e7f0ff;");
    expect(styles).not.toContain("#3a2348;");
    expect(styles).not.toContain("#172d4d;");
    expect(styles).not.toContain("PROJECT_ICON_PANEL_STYLES");
  });
});

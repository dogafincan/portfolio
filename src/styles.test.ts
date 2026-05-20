import { readFileSync } from "node:fs";

import { describe, expect, it } from "vite-plus/test";

describe("global styles", () => {
  it("uses the system color scheme for dark mode", () => {
    const styles = readFileSync("src/styles.css", "utf8");

    expect(styles).toContain("@media (prefers-color-scheme: dark)");
    expect(styles).toContain("color-scheme: light;");
    expect(styles).toContain("color-scheme: dark;");
    expect(styles.match(/--background: oklch\(0.145 0 0\);/g)).toHaveLength(2);
    expect(styles).toContain("--portfolio-page-background: var(--background);");
    expect(styles.match(/--portfolio-page-background: #20264f;/g)).toHaveLength(2);
    expect(styles).not.toContain("--background: #20264f;");
    expect(styles).not.toContain("@custom-variant dark (&:is(.dark *));");
  });

  it("keeps the header mesh palette stable across color schemes", () => {
    const styles = readFileSync("src/styles.css", "utf8");
    const rootStart = styles.indexOf(":root {");
    const rootEnd = styles.indexOf("\n}\n\n.dark", rootStart);
    const lightRoot = styles.slice(rootStart, rootEnd);
    const darkClassStart = styles.indexOf(".dark {");
    const darkClassEnd = styles.indexOf("\n}\n\n@media", darkClassStart);
    const darkClass = styles.slice(darkClassStart, darkClassEnd);
    const darkMediaStart = styles.indexOf("@media (prefers-color-scheme: dark)");
    const darkMedia = styles.slice(darkMediaStart, styles.indexOf("\n}\n\n@layer", darkMediaStart));

    expect(styles.match(/--portfolio-app-chrome-color:/g)).toHaveLength(1);
    expect(styles).toContain("--portfolio-app-chrome-color: #d2f2ff;");
    expect(lightRoot).toContain("--portfolio-hero-mesh-pale-blue: #d2f2ff;");
    expect(lightRoot).toContain("--portfolio-hero-mesh-cyan: #c0edff;");
    expect(lightRoot).toContain("--portfolio-hero-mesh-teal: #ccf6ff;");
    expect(lightRoot).toContain("--portfolio-hero-mesh-sky: #b9ecff;");
    expect(lightRoot).toContain("--portfolio-hero-mesh-lavender: #f0e8ff;");
    expect(lightRoot).toContain("--portfolio-hero-mesh-purple: #f4d9f2;");
    expect(lightRoot).not.toContain("--portfolio-hero-mesh-purple: #b68ffe;");
    expect(darkClass).not.toContain("--portfolio-hero-mesh");
    expect(darkClass).not.toContain("--portfolio-app-chrome-color");
    expect(darkMedia).not.toContain("--portfolio-hero-mesh");
    expect(darkMedia).not.toContain("--portfolio-app-chrome-color");
    expect(styles).not.toContain(".dark body::before");
    expect(styles).not.toContain("#5068bd 0%");
    expect(styles).not.toContain("#2189b9 43%");
    expect(styles).not.toContain("#7861c5 100%");
  });

  it("does not use global styles to swap the header logo by theme", () => {
    const styles = readFileSync("src/styles.css", "utf8");

    expect(styles).not.toContain('[data-slot="app-logo-for-light-mode"]');
    expect(styles).not.toContain('[data-slot="app-logo-for-dark-mode"]');
  });

  it("uses a CSS-only mesh background that fades into the theme background", () => {
    const styles = readFileSync("src/styles.css", "utf8");
    const meshLayerStart = styles.indexOf("body::before");
    const meshLayerEnd = styles.indexOf("code {", meshLayerStart);
    const meshLayer = styles.slice(meshLayerStart, meshLayerEnd);

    expect(styles).toContain("--portfolio-hero-gradient-height: 1000px;");
    expect(meshLayer).toContain("position: absolute;");
    expect(meshLayer).not.toContain("position: fixed;");
    expect(meshLayer).toContain("height: var(--portfolio-hero-gradient-height);");
    expect(meshLayer).toContain("var(--portfolio-app-chrome-color) 0%");
    expect(meshLayer).toContain(
      "color-mix(in oklab, var(--portfolio-app-chrome-color) 70%, transparent) 8%",
    );
    expect(meshLayer).toContain("transparent 18%");
    expect(meshLayer).not.toContain("var(--portfolio-app-chrome-color) 2.75rem");
    expect(meshLayer).not.toContain("transparent 7rem");
    expect(meshLayer).toContain("ellipse 38% 26% at 50% 29%");
    expect(meshLayer).toContain("ellipse 48% 42% at 14% 44%");
    expect(meshLayer).toContain("ellipse 50% 42% at 84% 44%");
    expect(meshLayer).toContain("radial-gradient");
    expect(meshLayer).toContain("to bottom");
    expect(meshLayer).toContain("transparent 40%");
    expect(meshLayer).toContain("transparent 82%, var(--portfolio-page-background)");
    expect(meshLayer).toContain("transparent 48%, var(--portfolio-page-background)");
    expect(meshLayer).toContain("var(--portfolio-page-background)");
    expect(meshLayer).not.toContain("scale(");
    expect(meshLayer).not.toContain("scaleX(");
    expect(meshLayer).not.toContain("scaleY(");
    expect(meshLayer).not.toContain("url(");
  });
});

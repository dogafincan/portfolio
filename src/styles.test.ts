import { readFileSync } from "node:fs";

import { describe, expect, it } from "vite-plus/test";

describe("global styles", () => {
  it("uses the system color scheme for dark mode", () => {
    const styles = readFileSync("src/styles.css", "utf8");

    expect(styles).toContain("@media (prefers-color-scheme: dark)");
    expect(styles).toContain("color-scheme: light;");
    expect(styles).toContain("color-scheme: dark;");
    expect(styles).not.toContain("@custom-variant dark (&:is(.dark *));");
  });

  it("does not use global styles to swap the header logo by theme", () => {
    const styles = readFileSync("src/styles.css", "utf8");

    expect(styles).not.toContain('[data-slot="app-logo-for-light-mode"]');
    expect(styles).not.toContain('[data-slot="app-logo-for-dark-mode"]');
  });

  it("uses a CSS-only mesh background that fades into the theme background", () => {
    const styles = readFileSync("src/styles.css", "utf8");
    const rootStart = styles.indexOf(":root {");
    const rootEnd = styles.indexOf("\n}\n\n.dark", rootStart);
    const lightRoot = styles.slice(rootStart, rootEnd);
    const darkClassStart = styles.indexOf(".dark {");
    const darkClassEnd = styles.indexOf("\n}\n\n@media", darkClassStart);
    const darkClass = styles.slice(darkClassStart, darkClassEnd);
    const darkMediaStart = styles.indexOf("@media (prefers-color-scheme: dark)");
    const darkMedia = styles.slice(darkMediaStart, styles.indexOf("\n}\n\n@layer", darkMediaStart));
    const meshLayerStart = styles.indexOf("body::before");
    const meshLayerEnd = styles.indexOf("code {", meshLayerStart);
    const meshLayer = styles.slice(meshLayerStart, meshLayerEnd);

    expect(styles).toContain("--portfolio-hero-gradient-height: 1000px;");
    expect(styles).toContain("--portfolio-app-chrome-color: #dbe7ff;");
    expect(styles).toContain("--portfolio-app-chrome-color: #5068bd;");
    expect(lightRoot).toContain("--portfolio-hero-mesh-pale-blue: #dbe7ff;");
    expect(lightRoot).toContain("--portfolio-hero-mesh-cyan: #c7efff;");
    expect(lightRoot).toContain("--portfolio-hero-mesh-teal: #ccecf5;");
    expect(lightRoot).toContain("--portfolio-hero-mesh-sky: #d2ecff;");
    expect(lightRoot).toContain("--portfolio-hero-mesh-lavender: #e3ddff;");
    expect(lightRoot).toContain("--portfolio-hero-mesh-purple: #d9ceff;");
    expect(lightRoot).not.toContain("--portfolio-hero-mesh-purple: #b68ffe;");
    expect(darkClass).toContain("--portfolio-hero-mesh-pale-blue: #bbc8fe;");
    expect(darkClass).toContain("--portfolio-hero-mesh-cyan: #79ccf6;");
    expect(darkClass).toContain("--portfolio-hero-mesh-teal: #76c2db;");
    expect(darkClass).toContain("--portfolio-hero-mesh-sky: #93c7e7;");
    expect(darkClass).toContain("--portfolio-hero-mesh-lavender: #c5c0fd;");
    expect(darkClass).toContain("--portfolio-hero-mesh-purple: #b68ffe;");
    expect(darkMedia).toContain("--portfolio-hero-mesh-pale-blue: #bbc8fe;");
    expect(darkMedia).toContain("--portfolio-hero-mesh-cyan: #79ccf6;");
    expect(darkMedia).toContain("--portfolio-hero-mesh-teal: #76c2db;");
    expect(darkMedia).toContain("--portfolio-hero-mesh-sky: #93c7e7;");
    expect(darkMedia).toContain("--portfolio-hero-mesh-lavender: #c5c0fd;");
    expect(darkMedia).toContain("--portfolio-hero-mesh-purple: #b68ffe;");
    expect(styles).toContain(".dark body::before");
    expect(styles).toContain("#5068bd 0%");
    expect(styles).toContain("#2189b9 43%");
    expect(styles).toContain("#7861c5 100%");
    expect(meshLayer).toContain("position: absolute;");
    expect(meshLayer).not.toContain("position: fixed;");
    expect(meshLayer).toContain("height: var(--portfolio-hero-gradient-height);");
    expect(meshLayer).not.toContain("var(--portfolio-app-chrome-color)");
    expect(meshLayer).not.toContain("transparent 7rem");
    expect(meshLayer).toContain("ellipse 38% 26% at 50% 29%");
    expect(meshLayer).toContain("ellipse 48% 42% at 14% 44%");
    expect(meshLayer).toContain("ellipse 50% 42% at 84% 44%");
    expect(meshLayer).toContain("radial-gradient");
    expect(meshLayer).toContain("to bottom");
    expect(meshLayer).toContain("transparent 40%");
    expect(meshLayer).toContain("transparent 82%, var(--background)");
    expect(meshLayer).toContain("transparent 48%, var(--background)");
    expect(meshLayer).toContain("var(--background)");
    expect(meshLayer).not.toContain("scale(");
    expect(meshLayer).not.toContain("scaleX(");
    expect(meshLayer).not.toContain("scaleY(");
    expect(meshLayer).not.toContain("url(");
  });
});

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

  it("uses distinct light and dark header mesh palettes", () => {
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
    expect(lightRoot).toContain("--portfolio-app-chrome-color: #d2f2ff;");
    expect(lightRoot).toContain("--portfolio-hero-mesh-highlight: white;");
    expect(lightRoot).toContain("--portfolio-hero-mesh-pale-blue: #d2f2ff;");
    expect(lightRoot).toContain("--portfolio-hero-mesh-cyan: #c0edff;");
    expect(lightRoot).toContain("--portfolio-hero-mesh-teal: #ccf6ff;");
    expect(lightRoot).toContain("--portfolio-hero-mesh-sky: #b9ecff;");
    expect(lightRoot).toContain("--portfolio-hero-mesh-lavender: #f0e8ff;");
    expect(lightRoot).toContain("--portfolio-hero-mesh-purple: #f4d9f2;");
    expect(lightRoot).toContain(
      "--portfolio-hero-mesh-left-shape: var(--portfolio-hero-mesh-purple);",
    );
    expect(lightRoot).toContain(
      "--portfolio-hero-mesh-right-shape: var(--portfolio-hero-mesh-purple);",
    );
    expect(lightRoot).toContain(
      "--portfolio-hero-mesh-bottom-shape: var(--portfolio-hero-mesh-lavender);",
    );
    expect(lightRoot).not.toContain("--portfolio-hero-mesh-purple: #b68ffe;");
    expect(lightRoot).toContain("--portfolio-hero-mesh-core-highlight-start: 82%;");
    expect(lightRoot).toContain("--portfolio-hero-mesh-wash-highlight-start: 24%;");
    expect(lightRoot).toContain("--portfolio-hero-mesh-left-transparent: 18%;");
    expect(darkClass).toContain("--portfolio-app-chrome-color: #4078bf;");
    expect(darkClass).toContain("--portfolio-hero-mesh-highlight: #4078bf;");
    expect(darkClass).toContain("--portfolio-hero-mesh-pale-blue: #4078bf;");
    expect(darkClass).toContain("--portfolio-hero-mesh-cyan: #4b91c8;");
    expect(darkClass).toContain("--portfolio-hero-mesh-teal: #528bd0;");
    expect(darkClass).toContain("--portfolio-hero-mesh-sky: #607fd8;");
    expect(darkClass).toContain("--portfolio-hero-mesh-lavender: #7b74d2;");
    expect(darkClass).toContain("--portfolio-hero-mesh-purple: #9670c4;");
    expect(darkClass).toContain(
      "--portfolio-hero-mesh-left-shape: var(--portfolio-hero-mesh-cyan);",
    );
    expect(darkClass).toContain(
      "--portfolio-hero-mesh-right-shape: var(--portfolio-hero-mesh-purple);",
    );
    expect(darkClass).toContain(
      "--portfolio-hero-mesh-bottom-shape: var(--portfolio-hero-mesh-teal);",
    );
    expect(darkClass).toContain("--portfolio-hero-mesh-core-highlight-start: 34%;");
    expect(darkClass).toContain("--portfolio-hero-mesh-wash-highlight-start: 10%;");
    expect(darkClass).toContain("--portfolio-hero-mesh-left-transparent: 6%;");
    expect(darkMedia).toContain("--portfolio-app-chrome-color: #4078bf;");
    expect(darkMedia).toContain("--portfolio-hero-mesh-highlight: #4078bf;");
    expect(darkMedia).toContain("--portfolio-hero-mesh-pale-blue: #4078bf;");
    expect(darkMedia).toContain("--portfolio-hero-mesh-cyan: #4b91c8;");
    expect(darkMedia).toContain("--portfolio-hero-mesh-teal: #528bd0;");
    expect(darkMedia).toContain("--portfolio-hero-mesh-sky: #607fd8;");
    expect(darkMedia).toContain("--portfolio-hero-mesh-lavender: #7b74d2;");
    expect(darkMedia).toContain("--portfolio-hero-mesh-purple: #9670c4;");
    expect(darkMedia).toContain(
      "--portfolio-hero-mesh-left-shape: var(--portfolio-hero-mesh-cyan);",
    );
    expect(darkMedia).toContain(
      "--portfolio-hero-mesh-right-shape: var(--portfolio-hero-mesh-purple);",
    );
    expect(darkMedia).toContain(
      "--portfolio-hero-mesh-bottom-shape: var(--portfolio-hero-mesh-teal);",
    );
    expect(darkMedia).toContain("--portfolio-hero-mesh-core-highlight-start: 34%;");
    expect(darkMedia).toContain("--portfolio-hero-mesh-wash-highlight-start: 10%;");
    expect(darkMedia).toContain("--portfolio-hero-mesh-left-transparent: 6%;");
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
    expect(styles).toContain("--portfolio-app-chrome-color: #d2f2ff;");
    expect(styles).toContain("--portfolio-app-chrome-color: #4078bf;");
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
    expect(meshLayer).toContain("var(--portfolio-hero-mesh-core-highlight-start)");
    expect(meshLayer).toContain("var(--portfolio-hero-mesh-wash-highlight-start)");
    expect(meshLayer).toContain("var(--portfolio-hero-mesh-left-transparent)");
    expect(meshLayer).toContain("var(--portfolio-hero-mesh-left-shape)");
    expect(meshLayer).toContain("var(--portfolio-hero-mesh-right-shape)");
    expect(meshLayer).toContain("var(--portfolio-hero-mesh-bottom-shape)");
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

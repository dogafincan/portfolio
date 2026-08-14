import { readFileSync } from "node:fs";

import { describe, expect, it } from "vite-plus/test";

const GEIST_STEPS = Array.from({ length: 10 }, (_, index) => (index + 1) * 100);
const GEIST_FAMILIES = [
  "gray",
  "gray-alpha",
  "blue",
  "red",
  "amber",
  "green",
  "teal",
  "purple",
  "pink",
] as const;
const GEIST_TOKENS = [
  "background-100",
  "background-200",
  ...GEIST_FAMILIES.flatMap((family) => GEIST_STEPS.map((step) => `${family}-${step}`)),
];

function getBlock(styles: string, selector: string) {
  const start = styles.indexOf(`${selector} {`);
  const end = styles.indexOf("\n}", start);

  expect(start).toBeGreaterThan(-1);
  expect(end).toBeGreaterThan(start);

  return styles.slice(start, end);
}

describe("global styles", () => {
  it("imports the standalone Geist palette and exposes every Tailwind alias", () => {
    const styles = readFileSync("src/styles.css", "utf8");
    const paletteImport = '@import "./styles/geist-colors.css";';

    expect(styles).toContain(paletteImport);
    expect(styles.indexOf(paletteImport)).toBeGreaterThan(
      styles.indexOf('@import "@fontsource-variable/geist";'),
    );
    expect(styles.indexOf(paletteImport)).toBeLessThan(styles.indexOf("@custom-variant dark"));
    for (const token of GEIST_TOKENS) {
      expect(styles).toContain(`--color-ds-${token}: var(--ds-${token});`);
    }
    expect(styles.match(/--color-ds-[a-z-]+-\d+:/g)).toHaveLength(92);
  });

  it("maps shadcn semantics to Geist roles with the documented app-owned surfaces", () => {
    const styles = readFileSync("src/styles.css", "utf8");
    const mappings = {
      foreground: "gray-1000",
      "card-foreground": "gray-1000",
      "popover-foreground": "gray-1000",
      "secondary-foreground": "gray-1000",
      skeleton: "gray-300",
      accent: "gray-200",
      "accent-foreground": "gray-1000",
      destructive: "red-900",
      input: "gray-alpha-400",
    } as const;

    for (const [semantic, geist] of Object.entries(mappings)) {
      expect(styles).toContain(`--${semantic}: var(--ds-${geist});`);
    }

    expect(styles).toContain("--muted-foreground: light-dark(oklch(31% 0 0), oklch(83% 0 0));");
    expect(styles).toContain("--color-page-title-accent: var(--page-title-accent);");
    expect(styles).toContain("--page-title-accent: var(--info-foreground);");
    expect(styles).toContain(
      "--primary: light-dark(oklch(0.6 0.2508 258.230011), var(--ds-blue-700));",
    );
    expect(styles).toContain("--color-quiet-foreground: var(--quiet-foreground);");
    expect(styles).toContain("--quiet-foreground: var(--ds-gray-900);");
    expect(styles).toContain("--color-skeleton: var(--skeleton);");
    expect(styles).toContain("--contrast-foreground: oklch(100% 0 0);");
    expect(styles).toContain("--primary-foreground: var(--contrast-foreground);");
    expect(styles).toContain(
      "--background: light-dark(oklch(99.11% 0 0), var(--ds-background-200));",
    );
    expect(styles).toContain("--card: light-dark(var(--ds-background-100), oklch(0.14 0 0));");
    expect(styles).toContain("--popover: light-dark(var(--ds-background-100), oklch(0.14 0 0));");
    expect(styles).toContain(
      "--border: light-dark(oklch(0 0 0 / 0.075), oklch(100% 0 0 / 10.1961%));",
    );
    expect(styles).toContain("--ring: light-dark(var(--ds-blue-700), var(--ds-blue-900));");
    expect(styles).not.toMatch(/#[\da-fA-F]{3,8}\b|\b(?:hsl|hsla|rgb|rgba|lab)\(/);
  });

  it("defines exact Geist interaction state aliases", () => {
    const styles = readFileSync("src/styles.css", "utf8");
    const mappings = {
      "focus-ring": "blue-400",
    } as const;

    for (const [semantic, geist] of Object.entries(mappings)) {
      expect(styles).toContain(`--color-${semantic}: var(--${semantic});`);
      expect(styles).toContain(`--${semantic}: var(--ds-${geist});`);
    }

    expect(styles).toContain(
      "--control-hover: light-dark(var(--ds-gray-100), var(--ds-gray-200));",
    );
    expect(styles).toContain(
      "--control-active: light-dark(var(--ds-gray-200), var(--ds-gray-300));",
    );
    expect(styles).toContain("--color-secondary-hover: var(--secondary-hover);");
    expect(styles).toContain("--secondary-hover: var(--control-hover);");
    expect(styles).toContain("--color-destructive-hover: var(--destructive-hover);");
    expect(styles).toContain(
      "--destructive-hover: light-dark(var(--ds-red-200), var(--control-hover));",
    );
    expect(styles).toContain(
      "--primary-hover: light-dark(var(--ds-blue-700), var(--ds-blue-800));",
    );
    expect(styles).toContain(
      "--primary-active: light-dark(oklch(55% 0.245 258.04), var(--ds-blue-800));",
    );
    for (const semantic of ["control-hover", "control-active", "primary-hover", "primary-active"]) {
      expect(styles).toContain(`--color-${semantic}: var(--${semantic});`);
    }

    expect(styles).toContain("--color-control: var(--control);");
    expect(styles).toContain("--control: var(--muted);");
    expect(styles).toContain("@apply border-border outline-focus-ring;");
    expect(styles).not.toContain("outline-ring/50");
  });

  it("defines bright and muted warning and destructive button roles", () => {
    const styles = readFileSync("src/styles.css", "utf8");

    for (const semantic of [
      "warning-hover",
      "warning-active",
      "warning-strong",
      "warning-strong-foreground",
      "warning-strong-hover",
      "warning-strong-active",
      "destructive-active",
      "destructive-strong",
      "destructive-strong-foreground",
      "destructive-strong-hover",
      "destructive-strong-active",
    ]) {
      expect(styles).toContain(`--color-${semantic}: var(--${semantic});`);
    }

    expect(styles).toContain("--warning-strong: oklch(0.72 0.18 70);");
    expect(styles).toContain("--warning-strong-foreground: oklch(0.2 0.035 70);");
    expect(styles).toContain("--destructive-strong: oklch(0.55 0.232 25.29);");
    expect(styles).toContain("--destructive-strong-foreground: var(--contrast-foreground);");
  });

  it("sets one global Lucide stroke metric without component-local styling", () => {
    const styles = readFileSync("src/styles.css", "utf8");
    const lucideBlock = getBlock(styles, "svg.lucide");

    expect(styles).toContain("--lucide-stroke-width: 2.2;");
    expect(lucideBlock).toContain("stroke-width: var(--lucide-stroke-width);");
  });

  it("uses one light and dark muted surface for neutral states and inputs", () => {
    const styles = readFileSync("src/styles.css", "utf8");

    expect(styles).toContain("--muted: light-dark(oklab(0.98 0 0), oklch(0.17 0 0));");
    expect(styles).toContain("--control: var(--muted);");
    expect(styles).toContain("--secondary: var(--muted);");
    expect(styles).not.toContain("color-mix(");
    expect(styles).not.toContain("--muted: var(--ds-gray-100);");
  });

  it("maps light alerts to tone surfaces and dark alerts to the muted surface", () => {
    const styles = readFileSync("src/styles.css", "utf8");

    expect(styles).toContain("--color-status-surface: var(--status-surface);");
    expect(styles).toContain("--status-surface: var(--muted);");
    expect(styles).toContain("--info: light-dark(var(--ds-blue-100), var(--muted));");
    expect(styles).toContain("--info-border: var(--ds-blue-400);");
    expect(styles).toContain(
      "--info-foreground: light-dark(oklch(63% 0.24 256.99), var(--ds-blue-900));",
    );
    expect(styles).toContain("--success: light-dark(var(--ds-green-100), var(--muted));");
    expect(styles).toContain("--success-border: var(--ds-green-400);");
    expect(styles).toContain(
      "--success-foreground: light-dark(oklch(0.7 0.214 145.179993), var(--ds-green-900));",
    );
    expect(styles).toContain("--warning: light-dark(var(--ds-amber-100), var(--muted));");
    expect(styles).toContain("--warning-border: var(--ds-amber-400);");
    expect(styles).toContain(
      "--warning-foreground: light-dark(oklch(0.7 0.1991 64.279999), oklch(0.72 0.1991 64.28));",
    );
    expect(styles).toContain("--color-info: var(--info);");
    expect(styles).toContain("--color-info-border: var(--info-border);");
    expect(styles).toContain("--color-success: var(--success);");
    expect(styles).toContain("--color-success-border: var(--success-border);");
    expect(styles).toContain("--color-warning: var(--warning);");
    expect(styles).toContain("--color-warning-border: var(--warning-border);");
    expect(styles).toContain("--destructive-surface: light-dark(var(--ds-red-100), var(--muted));");
    expect(styles).toContain("--destructive-border: var(--ds-red-400);");
    expect(styles).toContain(
      "--destructive-foreground: light-dark(var(--ds-red-700), var(--ds-red-900));",
    );
    expect(styles).toContain("--color-destructive-foreground: var(--destructive-foreground);");
  });

  it("defines blue chart and sidebar semantics", () => {
    const styles = readFileSync("src/styles.css", "utf8");

    expect(styles).toContain("--chart-1: var(--ds-blue-700);");
    expect(styles).toContain("--chart-2: var(--ds-blue-900);");
    expect(styles).toContain("--chart-3: var(--ds-blue-600);");
    expect(styles).toContain("--chart-4: var(--ds-blue-800);");
    expect(styles).toContain("--chart-5: var(--ds-blue-1000);");
    expect(styles).toContain("--sidebar: var(--ds-background-100);");
    expect(styles).toContain("--sidebar-border: var(--ds-gray-alpha-400);");
  });

  it("maps colored badges to light tones and dark neutral surfaces", () => {
    const styles = readFileSync("src/styles.css", "utf8");
    const foregroundMappings = {
      "badge-neutral-foreground": "gray-1000",
    } as const;

    for (const [semantic, geist] of Object.entries(foregroundMappings)) {
      expect(styles).toContain(`--color-${semantic}: var(--${semantic});`);
      expect(styles).toContain(`--${semantic}: var(--ds-${geist});`);
    }

    expect(styles).toContain("--badge-info-foreground: var(--info-foreground);");
    expect(styles).toContain("--badge-success-foreground: var(--success-foreground);");
    expect(styles).toContain("--badge-warning-foreground: var(--warning-foreground);");
    expect(styles).toContain("--badge-destructive-foreground: var(--destructive-foreground);");

    for (const semantic of [
      "badge-neutral",
      "badge-neutral-strong",
      "badge-info-strong",
      "badge-success-strong",
      "badge-warning-strong",
      "badge-destructive-strong",
    ]) {
      expect(styles).toContain(`--${semantic}: var(--status-surface);`);
    }

    expect(styles).toContain("--badge-info: light-dark(var(--ds-blue-100), var(--muted));");
    expect(styles).toContain("--badge-success: light-dark(var(--ds-green-100), var(--muted));");
    expect(styles).toContain("--badge-warning: light-dark(var(--ds-amber-100), var(--muted));");
    expect(styles).toContain("--badge-destructive: light-dark(var(--ds-red-100), var(--muted));");
    expect(styles).toContain("--color-badge-info-active: var(--badge-info-active);");
    expect(styles).toContain(
      "--badge-info-hover: light-dark(var(--ds-blue-200), var(--control-hover));",
    );
    expect(styles).toContain(
      "--badge-info-active: light-dark(var(--ds-blue-300), var(--control-active));",
    );
    expect(styles).toContain(
      "--badge-header-info: light-dark(var(--ds-blue-100), oklch(0.19 0 0));",
    );
    expect(styles).toContain(
      "--badge-header-info-hover: light-dark(var(--ds-blue-200), var(--control-hover));",
    );
    expect(styles).toContain(
      "--badge-header-info-active: light-dark(var(--ds-blue-300), var(--control-active));",
    );
    expect(styles).toContain(
      "--badge-success-hover: light-dark(var(--ds-green-200), var(--control-hover));",
    );
    expect(styles).toContain(
      "--badge-success-active: light-dark(var(--ds-green-300), var(--control-active));",
    );
    expect(styles).toContain(
      "--badge-warning-hover: light-dark(var(--ds-amber-200), var(--control-hover));",
    );
    expect(styles).toContain(
      "--badge-warning-active: light-dark(var(--ds-amber-300), var(--control-active));",
    );
    expect(styles).toContain(
      "--badge-destructive-hover: light-dark(var(--ds-red-200), var(--control-hover));",
    );
    expect(styles).toContain(
      "--badge-destructive-active: light-dark(var(--ds-red-300), var(--control-active));",
    );
  });

  it("maps information controls to light blue and dark neutral surfaces", () => {
    const styles = readFileSync("src/styles.css", "utf8");

    for (const semantic of [
      "control-info",
      "control-info-foreground",
      "control-info-hover",
      "control-info-active",
    ]) {
      expect(styles).toContain(`--color-${semantic}: var(--${semantic});`);
    }

    expect(styles).toContain("--control-info: light-dark(var(--ds-blue-100), var(--muted));");
    expect(styles).toContain("--control-info-foreground: var(--badge-info-foreground);");
    expect(styles).toContain(
      "--control-info-hover: light-dark(var(--ds-blue-200), var(--control-hover));",
    );
    expect(styles).toContain(
      "--control-info-active: light-dark(var(--ds-blue-300), var(--control-active));",
    );
  });

  it("uses one semantic map with system and explicit theme resolution", () => {
    const styles = readFileSync("src/styles.css", "utf8");

    expect(styles).toContain("@media (prefers-color-scheme: dark)");
    expect(styles).toContain(":root:not(.light) {");
    expect(styles).toContain(".light {");
    expect(styles).toContain(".dark {");
    expect(
      styles.match(
        /--background: light-dark\(oklch\(99\.11% 0 0\), var\(--ds-background-200\)\);/g,
      ),
    ).toHaveLength(1);
    expect(styles.match(/--portfolio-app-chrome-color: var\(--card\);/g)).toHaveLength(1);
    expect(styles.match(/--portfolio-page-background: var\(--background\);/g)).toHaveLength(1);
    expect(styles).toContain("@custom-variant dark (&:is(.dark *));");
  });

  it("uses coordinated app-owned page, raised-surface, and chrome colors", () => {
    const styles = readFileSync("src/styles.css", "utf8");

    expect(styles).toContain(
      "--background: light-dark(oklch(99.11% 0 0), var(--ds-background-200));",
    );
    expect(styles).toContain("--card: light-dark(var(--ds-background-100), oklch(0.14 0 0));");
    expect(styles).toContain("--popover: light-dark(var(--ds-background-100), oklch(0.14 0 0));");
    expect(styles).toContain("--portfolio-app-chrome-color: var(--card);");
    expect(styles).toContain("--portfolio-page-background: var(--background);");
  });

  it("defines shared surface, overlay, and motion roles for component recipes", () => {
    const styles = readFileSync("src/styles.css", "utf8");

    expect(styles).toContain("--ds-surface-inset: 1.5rem;");
    expect(styles).toContain("--ds-surface-section-gap: 1.5rem;");
    expect(styles).toContain("--ds-surface-stack-gap: 0.75rem;");
    expect(styles).toContain("--ds-control-height: 2.75rem;");
    expect(styles).toContain("--color-overlay-scrim: var(--overlay-scrim);");
    expect(styles).toContain("--overlay-scrim: oklch(0% 0 0 / 30%);");
    expect(styles).toContain("--ds-motion-duration-fast: 150ms;");
    expect(styles).toContain("--ds-motion-duration-medium: 300ms;");
    expect(styles).toContain("--ds-motion-duration-drawer: 450ms;");
    expect(styles).toContain("--ds-motion-ease-standard: cubic-bezier(0.2, 0, 0, 1);");
    expect(styles).toContain("--ds-motion-ease-drawer: cubic-bezier(0.22, 1, 0.36, 1);");
  });

  it("keeps standard controls at 44px while supporting safe compact affordances", () => {
    const styles = readFileSync("src/styles.css", "utf8");

    expect(styles).toContain(".control-target {");
    expect(styles).toContain("min-width: var(--ds-control-height);");
    expect(styles).toContain("min-height: var(--ds-control-height);");
    expect(styles).toContain(".compact-control-target {");
    expect(styles).toContain("min-width: 2rem;");
    expect(styles).toContain("min-height: 2rem;");
    expect(getBlock(styles, ".expanded-control-target")).not.toContain("position:");
    expect(styles).toContain(".expanded-control-target::after {");
    expect(styles).toContain("width: max(100%, var(--ds-control-height));");
    expect(styles).toContain("height: max(100%, var(--ds-control-height));");
    expect(styles).not.toContain("@media (any-pointer: coarse)");
  });

  it("uses solid root chrome backgrounds instead of cloud or atmosphere artwork", () => {
    const styles = readFileSync("src/styles.css", "utf8");
    const htmlBlock = getBlock(styles, "html");
    const bodyBlock = getBlock(styles, "body");

    expect(htmlBlock).toContain("background: var(--portfolio-app-chrome-color);");
    expect(bodyBlock).toContain("background-color: var(--portfolio-app-chrome-color);");
    expect(bodyBlock).not.toContain("background-image");
    expect(bodyBlock).not.toContain("linear-gradient(");
    expect(styles).not.toContain("--snapshot-header-atmosphere");
    expect(styles).not.toContain("--snapshot-page-repeat-image");
    expect(styles).not.toContain("--snapshot-bottom-chrome");
    expect(styles).not.toContain("page-atmosphere");
    expect(styles).not.toContain("header-clouds");
    expect(styles).not.toContain("body::before");
    expect(styles).not.toContain("body::after");
    expect(styles).not.toContain("main.app-shell::before");
  });

  it("keeps viewport overscroll on the root layers without making the body a scroll container", () => {
    const styles = readFileSync("src/styles.css", "utf8");
    const htmlBlock = getBlock(styles, "html");
    const bodyBlock = getBlock(styles, "body");

    expect(htmlBlock).toContain("@apply overscroll-y-none font-sans;");
    expect(bodyBlock).toContain("overflow-x: clip;");
    expect(bodyBlock).not.toContain("overflow-x: hidden;");
    expect(bodyBlock).not.toContain("overflow-y:");
  });

  it("assigns vertical safe areas to app chrome and horizontal insets to content", () => {
    const styles = readFileSync("src/styles.css", "utf8");
    const appShellBlock = getBlock(styles, ".app-shell");
    const navbarBlock = getBlock(styles, ".app-navbar");
    const footerBlock = getBlock(styles, ".app-footer");
    const chromeContentBlock = getBlock(styles, ".app-chrome-content");

    expect(styles).toContain("--portfolio-app-shell-padding-block-start: 2rem;");
    expect(styles.match(/--portfolio-app-shell-padding-block-start: 4rem;/g)).toHaveLength(2);
    expect(styles).not.toContain("--portfolio-app-shell-padding-block-start: 5rem;");
    expect(styles).toContain("--portfolio-app-shell-padding-block-end: 3rem;");
    expect(styles).toContain("--portfolio-app-shell-padding-inline: 0.75rem;");
    expect(styles).toContain("--portfolio-app-shell-padding-inline: 1.5rem;");
    expect(styles).toContain("--portfolio-app-shell-padding-inline: 2rem;");
    expect(appShellBlock).toContain("env(safe-area-inset-right, 0px)");
    expect(appShellBlock).toContain("env(safe-area-inset-left, 0px)");
    expect(appShellBlock).not.toContain("env(safe-area-inset-top, 0px)");
    expect(appShellBlock).not.toContain("env(safe-area-inset-bottom, 0px)");
    expect(appShellBlock).toContain("var(--portfolio-app-shell-padding-block-start)");
    expect(appShellBlock).toContain("var(--portfolio-app-shell-padding-block-end)");
    expect(appShellBlock).toContain("var(--portfolio-app-shell-padding-inline)");
    expect(navbarBlock).toContain("height: calc(3.5rem + env(safe-area-inset-top, 0px));");
    expect(navbarBlock).toContain("padding-top: env(safe-area-inset-top, 0px);");
    expect(footerBlock).toContain("min-height: calc(3.5rem + env(safe-area-inset-bottom, 0px));");
    expect(footerBlock).toContain("padding-bottom: env(safe-area-inset-bottom, 0px);");
    expect(chromeContentBlock).toContain("env(safe-area-inset-right, 0px)");
    expect(chromeContentBlock).toContain("env(safe-area-inset-left, 0px)");
    expect(styles).not.toMatch(/body[^}]*env\(safe-area-inset-/);
  });

  it("does not use global styles to swap the header logo by theme", () => {
    const styles = readFileSync("src/styles.css", "utf8");

    expect(styles).not.toContain('[data-slot="app-logo-for-light-mode"]');
    expect(styles).not.toContain('[data-slot="app-logo-for-dark-mode"]');
  });

  it("does not keep app-specific primary button color tokens outside the preset", () => {
    const styles = readFileSync("src/styles.css", "utf8");

    expect(styles).not.toContain("--button-primary");
  });

  it("uses pointer cursors for links and enabled button controls", () => {
    const styles = readFileSync("src/styles.css", "utf8");

    expect(styles).toContain(
      [
        "a[href],",
        "  button:not(:disabled),",
        '  [role="button"]:not(:disabled) {',
        "    cursor: pointer;",
        "  }",
      ].join("\n"),
    );
  });
});

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
  it("uses the stock shadcn radius foundation and derived scale", () => {
    const styles = readFileSync("src/styles.css", "utf8");

    expect(styles).toContain("--radius: 0.625rem;");
    expect(styles).not.toContain("--radius: 0.875rem;");
    expect(styles).toContain("--radius-sm: calc(var(--radius) * 0.6);");
    expect(styles).toContain("--radius-md: calc(var(--radius) * 0.8);");
    expect(styles).toContain("--radius-lg: var(--radius);");
    expect(styles).toContain("--radius-xl: calc(var(--radius) * 1.4);");
    expect(styles).toContain("--radius-2xl: calc(var(--radius) * 1.8);");
    expect(styles).toContain("--radius-3xl: calc(var(--radius) * 2.2);");
    expect(styles).toContain("--radius-4xl: calc(var(--radius) * 2.6);");
  });

  it("imports the standalone Geist palette and exposes every Tailwind alias", () => {
    const styles = readFileSync("src/styles.css", "utf8");
    const paletteImport = '@import "./styles/geist-colors.css";';

    expect(styles).toContain(paletteImport);
    expect(styles.indexOf(paletteImport)).toBeGreaterThan(
      styles.indexOf('@import "@fontsource-variable/geist";'),
    );
    expect(styles.indexOf(paletteImport)).toBeLessThan(styles.indexOf("@theme inline"));
    for (const token of GEIST_TOKENS) {
      expect(styles).toContain(`--color-ds-${token}: var(--ds-${token});`);
    }
    expect(styles.match(/--color-ds-[a-z-]+-\d+:/g)).toHaveLength(92);
  });

  it("maps shadcn neutral text and Geist chromatic roles with app-owned surfaces", () => {
    const styles = readFileSync("src/styles.css", "utf8");
    const mappings = {
      skeleton: "gray-300",
      destructive: "red-900",
    } as const;

    for (const [semantic, geist] of Object.entries(mappings)) {
      expect(styles).toContain(`--${semantic}: var(--ds-${geist});`);
    }

    expect(styles).toContain("--accent: var(--control-hover);");
    expect(styles).toContain("--foreground: light-dark(oklch(0.145 0 0), oklch(0.985 0 0));");
    expect(styles).toContain("--muted-foreground: light-dark(oklch(0.556 0 0), oklch(0.708 0 0));");
    for (const semantic of [
      "card-foreground",
      "popover-foreground",
      "secondary-foreground",
      "accent-foreground",
      "badge-neutral-foreground",
      "sidebar-foreground",
      "sidebar-accent-foreground",
    ]) {
      expect(styles).toContain(`--${semantic}: var(--foreground);`);
    }
    expect(styles).toContain("--color-page-title-accent: var(--page-title-accent);");
    expect(styles).toContain("--page-title-accent: var(--info-foreground);");
    expect(styles).toContain(
      "--primary: light-dark(oklch(0.6 0.2508 258.230011), var(--ds-blue-700));",
    );
    expect(styles).toContain("--color-quiet-foreground: var(--quiet-foreground);");
    expect(styles).toContain("--quiet-foreground: var(--muted-foreground);");
    expect(styles).toContain("--color-skeleton: var(--skeleton);");
    expect(styles).toContain("--contrast-foreground: oklch(100% 0 0);");
    expect(styles).toContain("--primary-foreground: var(--contrast-foreground);");
    expect(styles).toContain("--background: var(--ds-background-200);");
    expect(styles).toContain("--card: light-dark(var(--ds-background-100), oklch(0.16 0 0));");
    expect(styles).toContain("--popover: light-dark(var(--ds-background-100), oklch(0.16 0 0));");
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

    expect(styles).toContain("--control-hover: light-dark(oklch(0.965 0 0), oklch(0.225 0 0));");
    expect(styles).toContain("--control-active: light-dark(oklch(0.95 0 0), oklch(0.25 0 0));");
    expect(styles).toContain("--color-secondary-hover: var(--secondary-hover);");
    expect(styles).toContain("--secondary-hover: var(--control-hover);");
    expect(styles).toContain("--color-destructive-hover: var(--destructive-hover);");
    expect(styles).toContain("--destructive-hover: var(--ds-red-200);");
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

  it("defines filled success, warning, and destructive button roles", () => {
    const styles = readFileSync("src/styles.css", "utf8");

    for (const semantic of [
      "success-strong",
      "success-strong-foreground",
      "success-strong-hover",
      "success-strong-active",
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

    expect(styles).toContain("--success-strong: oklch(0.67 0.19 147);");
    expect(styles).toContain("--success-strong-foreground: oklch(0.18 0.04 147);");
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

  it("uses the subtle neutral surface ladder without changing shell or border roles", () => {
    const styles = readFileSync("src/styles.css", "utf8");

    expect(styles).toContain("--background: var(--ds-background-200);");
    expect(styles).toContain("--card: light-dark(var(--ds-background-100), oklch(0.16 0 0));");
    expect(styles).toContain(
      "--border: light-dark(oklch(0 0 0 / 0.075), oklch(100% 0 0 / 10.1961%));",
    );
    expect(styles).toContain("--muted: light-dark(oklch(0.98 0 0), oklch(0.2 0 0));");
    expect(styles).toContain("--input: light-dark(oklch(0.922 0 0), oklch(1 0 0 / 15%));");
    expect(styles).toContain("--accent: var(--control-hover);");
    expect(styles).toContain("--control-hover: light-dark(oklch(0.965 0 0), oklch(0.225 0 0));");
    expect(styles).toContain("--control-active: light-dark(oklch(0.95 0 0), oklch(0.25 0 0));");
    expect(styles).toContain("--item-muted: var(--muted);");
    expect(styles).toContain(
      "--item-avatar-background: light-dark(var(--card), var(--background));",
    );
    expect(styles).toContain("--color-item-muted: var(--item-muted);");
    expect(styles).toContain("--color-item-avatar-background: var(--item-avatar-background);");
    expect(styles).toContain("--control: var(--muted);");
    expect(styles).toContain("--secondary: var(--muted);");
    expect(styles).not.toContain("color-mix(");
    expect(styles).not.toContain("--muted: var(--ds-gray-100);");
  });

  it("keeps persistent muted fills separate from neutral interaction states", () => {
    const attachment = readFileSync("src/components/ui/attachment.tsx", "utf8");
    const field = readFileSync("src/components/ui/field.tsx", "utf8");

    expect(attachment).toContain("has-[>a,>button]:hover:bg-control-hover");
    expect(attachment).not.toContain("has-[>a,>button]:hover:bg-muted");
    expect(field).toContain("has-data-checked:bg-control-hover");
    expect(field).not.toContain("has-data-checked:bg-muted");
  });

  it("maps chromatic surfaces and borders to scheme-aware Geist tone families", () => {
    const styles = readFileSync("src/styles.css", "utf8");

    expect(styles).toContain("--info: var(--ds-blue-100);");
    expect(styles).toContain("--info-border: var(--ds-blue-400);");
    expect(styles).toContain("--info-hover: var(--ds-blue-200);");
    expect(styles).toContain("--info-active: var(--ds-blue-300);");
    expect(styles).toContain(
      "--info-foreground: light-dark(oklch(63% 0.24 256.99), var(--ds-blue-900));",
    );
    expect(styles).toContain("--success: var(--ds-green-100);");
    expect(styles).toContain("--success-border: var(--ds-green-400);");
    expect(styles).toContain("--success-hover: var(--ds-green-200);");
    expect(styles).toContain("--success-active: var(--ds-green-300);");
    expect(styles).toContain(
      "--success-foreground: light-dark(oklch(0.7 0.214 145.179993), var(--ds-green-900));",
    );
    expect(styles).toContain("--warning: var(--ds-amber-100);");
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
    expect(styles).toContain("--destructive-surface: var(--ds-red-100);");
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

  it("maps chromatic badges to scheme-aware Geist tone families", () => {
    const styles = readFileSync("src/styles.css", "utf8");
    expect(styles).toContain("--color-badge-neutral-foreground: var(--badge-neutral-foreground);");
    expect(styles).toContain("--badge-neutral-foreground: var(--foreground);");
    expect(styles).toContain("--badge-neutral: var(--muted);");
    expect(styles).toContain("--badge-neutral-strong: var(--muted);");

    expect(styles).toContain("--badge-info-foreground: var(--info-foreground);");
    expect(styles).toContain("--badge-success-foreground: var(--success-foreground);");
    expect(styles).toContain("--badge-warning-foreground: var(--warning-foreground);");
    expect(styles).toContain("--badge-destructive-foreground: var(--destructive-foreground);");

    expect(styles).toContain("--badge-info-strong: var(--primary);");
    expect(styles).toContain("--badge-success-strong: var(--success-strong);");
    expect(styles).toContain("--badge-warning-strong: var(--warning-strong);");
    expect(styles).toContain("--badge-destructive-strong: var(--destructive-strong);");
    expect(styles).toContain("--badge-info: var(--info);");
    expect(styles).toContain("--badge-success: var(--success);");
    expect(styles).toContain("--badge-warning: var(--warning);");
    expect(styles).toContain("--badge-destructive: var(--destructive-surface);");
    expect(styles).toContain("--color-badge-info-active: var(--badge-info-active);");
    expect(styles).toContain("--badge-info-hover: var(--info-hover);");
    expect(styles).toContain("--badge-info-active: var(--info-active);");
    expect(styles).toContain("--badge-header-info: var(--control-info);");
    expect(styles).toContain("--badge-header-info-hover: var(--control-info-hover);");
    expect(styles).toContain("--badge-header-info-active: var(--control-info-active);");
    expect(styles).toContain("--badge-success-hover: var(--success-hover);");
    expect(styles).toContain("--badge-success-active: var(--success-active);");
    expect(styles).toContain("--badge-warning-hover: var(--warning-hover);");
    expect(styles).toContain("--badge-warning-active: var(--warning-active);");
    expect(styles).toContain("--badge-destructive-hover: var(--destructive-hover);");
    expect(styles).toContain("--badge-destructive-active: var(--destructive-active);");
  });

  it("maps information controls to the scheme-aware blue family", () => {
    const styles = readFileSync("src/styles.css", "utf8");

    for (const semantic of [
      "control-info",
      "control-info-foreground",
      "control-info-hover",
      "control-info-active",
    ]) {
      expect(styles).toContain(`--color-${semantic}: var(--${semantic});`);
    }

    expect(styles).toContain("--control-info: var(--ds-blue-100);");
    expect(styles).toContain("--control-info-foreground: var(--badge-info-foreground);");
    expect(styles).toContain("--control-info-hover: var(--ds-blue-200);");
    expect(styles).toContain("--control-info-active: var(--ds-blue-300);");
  });

  it("uses one semantic map with system and explicit theme resolution", () => {
    const styles = readFileSync("src/styles.css", "utf8");

    expect(styles).toContain("@media (prefers-color-scheme: dark)");
    expect(styles).toContain(":root:not(.light) {");
    expect(styles).toContain(".light {");
    expect(styles).toContain(".dark {");
    expect(styles.match(/--background: var\(--ds-background-200\);/g)).toHaveLength(1);
    expect(styles.match(/--portfolio-app-chrome-color: var\(--card\);/g)).toHaveLength(1);
    expect(styles.match(/--portfolio-page-background: var\(--background\);/g)).toHaveLength(1);
    expect(styles).not.toContain("@custom-variant dark");
  });

  it("uses coordinated app-owned page, raised-surface, and chrome colors", () => {
    const styles = readFileSync("src/styles.css", "utf8");

    expect(styles).toContain("--background: var(--ds-background-200);");
    expect(styles).toContain("--card: light-dark(var(--ds-background-100), oklch(0.16 0 0));");
    expect(styles).toContain("--popover: light-dark(var(--ds-background-100), oklch(0.16 0 0));");
    expect(styles).toContain("--portfolio-app-chrome-color: var(--card);");
    expect(styles).toContain("--portfolio-page-background: var(--background);");
  });

  it("defines shared surface, overlay, and motion roles for component recipes", () => {
    const styles = readFileSync("src/styles.css", "utf8");

    expect(styles).toContain("--ds-surface-inset: 1.5rem;");
    expect(styles).toContain("--ds-surface-section-gap: 1.5rem;");
    expect(styles).toContain("--ds-surface-stack-gap: 0.75rem;");
    expect(styles).toContain("--ds-button-height: 2.25rem;");
    expect(styles).toContain("--ds-control-height: 2.25rem;");
    expect(styles).toContain("--color-overlay-scrim: var(--overlay-scrim);");
    expect(styles).toContain("--overlay-scrim: oklch(0% 0 0 / 30%);");
    expect(styles).toContain("--ds-motion-duration-fast: 150ms;");
    expect(styles).toContain("--ds-motion-duration-medium: 300ms;");
    expect(styles).toContain("--ds-motion-duration-drawer: 450ms;");
    expect(styles).toContain("--ds-motion-ease-standard: cubic-bezier(0.2, 0, 0, 1);");
    expect(styles).toContain("--ds-motion-ease-drawer: cubic-bezier(0.22, 1, 0.36, 1);");
  });

  it("keeps Buttons, fields, and expanded targets at 36px with safe compact affordances", () => {
    const styles = readFileSync("src/styles.css", "utf8");

    expect(styles).toContain(".button-target {");
    expect(styles).toContain("min-width: var(--ds-button-height);");
    expect(styles).toContain("min-height: var(--ds-button-height);");
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

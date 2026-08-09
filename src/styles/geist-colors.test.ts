import { existsSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vite-plus/test";

const PALETTE_PATH = "src/styles/geist-colors.css";
const STEPS = Array.from({ length: 10 }, (_, index) => (index + 1) * 100);
const FAMILIES = [
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
const EXPECTED_TOKENS = [
  "--ds-background-100",
  "--ds-background-200",
  ...FAMILIES.flatMap((family) => STEPS.map((step) => `--ds-${family}-${step}`)),
].sort();

function readPalette() {
  expect(existsSync(PALETTE_PATH), `${PALETTE_PATH} should exist`).toBe(true);
  return existsSync(PALETTE_PATH) ? readFileSync(PALETTE_PATH, "utf8") : "";
}

function getTokenNames(styles: string) {
  return [
    ...new Set([...styles.matchAll(/^\s*(--ds-[a-z-]+-\d+):/gm)].map((match) => match[1])),
  ].sort();
}

describe("Geist color palette", () => {
  it("records the source and complete public token inventory", () => {
    const styles = readPalette();

    expect(styles).toContain("Source: https://vercel.com/geist/colors");
    expect(styles).toContain("Synced: 2026-07-10");
    expect(getTokenNames(styles)).toEqual(EXPECTED_TOKENS);
    expect(EXPECTED_TOKENS).toHaveLength(92);
  });

  it("pairs light and dark values through the active color scheme", () => {
    const styles = readPalette();

    expect(styles).toContain("color-scheme: light dark;");
    expect(styles).toContain(".light {");
    expect(styles).toContain("color-scheme: light;");
    expect(styles).toContain(".dark {");
    expect(styles).toContain("color-scheme: dark;");
    expect(styles.match(/light-dark\(/g)).toHaveLength(92);
  });

  it("authors every light and dark primitive in canonical OKLCH", () => {
    const styles = readPalette();

    expect(styles).toContain(
      "--ds-background-100: light-dark(oklch(100% 0 0), oklch(14.5747% 0 0));",
    );
    expect(styles).toContain(
      "--ds-gray-1000: light-dark(oklch(20.4405% 0 0), oklch(94.6558% 0 0));",
    );
    expect(styles).toContain(
      "--ds-gray-alpha-100: light-dark(oklch(0% 0 0 / 5.098%), oklch(100% 0 0 / 5.8824%));",
    );
    expect(styles).toContain(
      "--ds-gray-alpha-400: light-dark(oklch(0% 0 0 / 7.8431%), oklch(100% 0 0 / 14.1176%));",
    );
    expect(styles).toContain(
      "--ds-blue-700: light-dark(oklch(57.61% 0.2508 258.23), oklch(57.61% 0.2321 258.23));",
    );
    expect(styles).toContain(
      "--ds-blue-100: light-dark(oklch(97.32% 0.0141 251.56), oklch(22.17% 0.069 259.89));",
    );
    expect(styles).toContain(
      "--ds-amber-100: light-dark(oklch(97.48% 0.0331 85.79), oklch(22.46% 0.0538 76.04));",
    );
    expect(styles).toContain(
      "--ds-green-100: light-dark(oklch(97.59% 0.0289 145.42), oklch(23.09% 0.0716 149.68));",
    );
    expect(styles).toContain(
      "--ds-red-100: light-dark(oklch(96.5% 0.0223 13.09), oklch(22.1% 0.0657 15.11));",
    );
    expect(styles).toContain(
      "--ds-red-700: light-dark(oklch(62.56% 0.2524 23.03), oklch(62.56% 0.2234 23.03));",
    );
    expect(styles).toContain(
      "--ds-red-900: light-dark(oklch(54.99% 0.232 25.29), oklch(69.96% 0.2136 22.03));",
    );
    expect(styles).toContain(
      "--ds-amber-900: light-dark(oklch(52.79% 0.1496 54.65), oklch(77.21% 0.1991 64.28));",
    );
    expect(styles).toContain(
      "--ds-amber-800: light-dark(oklch(77.21% 0.1991 64.28), oklch(77.21% 0.1991 64.28));",
    );
    expect(styles).toContain(
      "--ds-green-900: light-dark(oklch(51.75% 0.1453 147.65), oklch(73.1% 0.2158 148.29));",
    );
    expect(styles).toContain(
      "--ds-teal-900: light-dark(oklch(52.08% 0.1251 182.93), oklch(74.56% 0.1765 182.8));",
    );
    expect(styles).toContain(
      "--ds-purple-900: light-dark(oklch(47.18% 0.2579 304), oklch(69.87% 0.2037 309.51));",
    );
    expect(styles).toContain(
      "--ds-pink-900: light-dark(oklch(53.5% 0.2058 2.84), oklch(69.36% 0.2223 3.91));",
    );
    expect(styles.match(/oklch\(/g)).toHaveLength(184);
    expect(styles).not.toMatch(/#[\da-fA-F]{3,8}\b|\b(?:hsl|hsla|rgb|rgba|lab)\(/);
    expect(styles).not.toContain("color-gamut: p3");
  });
});

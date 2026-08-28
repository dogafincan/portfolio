import { readFileSync } from "node:fs";

import { describe, expect, it } from "vite-plus/test";

const config = readFileSync("wrangler.assets.jsonc", "utf8");
const headers = readFileSync("public/_headers", "utf8");
const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
  scripts: Record<string, string>;
};

describe("public delivery hardening", () => {
  it("deploys the migration-locked public app as assets only", () => {
    expect(config).toContain('"directory": "./dist/client"');
    expect(config).toContain('"not_found_handling": "404-page"');
    for (const forbidden of [
      "main",
      "binding",
      "run_worker_first",
      "services",
      "ratelimits",
      "observability",
      "triggers",
    ]) {
      expect(config).not.toMatch(new RegExp(`"${forbidden}"\\s*:`));
    }
  });

  it("names the assets-only config from every public deploy command", () => {
    expect(packageJson.scripts.deploy).toContain("--config wrangler.assets.jsonc");
    expect(packageJson.scripts["deploy:dry-run"]).toContain("--config wrangler.assets.jsonc");
  });

  it("keeps application documents mutable and versioned assets immutable", () => {
    const documentPaths = ["/", "/submit", "/og-preview", "/404.html"].flatMap((pathname) =>
      pathname !== "/" && !pathname.includes(".") ? [pathname, `${pathname}/`] : [pathname],
    );
    for (const pathname of documentPaths) {
      expect(headers).toContain(`${pathname}\n  Cache-Control: no-store`);
    }
    expect(headers).toContain("/assets/*\n  Cache-Control: public, max-age=31536000, immutable");
  });
});

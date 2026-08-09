import { readFileSync } from "node:fs";

import { describe, expect, it } from "vite-plus/test";

const config = readFileSync("wrangler.assets.jsonc", "utf8");
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
});

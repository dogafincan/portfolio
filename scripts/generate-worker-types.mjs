import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const result = spawnSync(
  process.platform === "win32" ? "wrangler.cmd" : "wrangler",
  ["types", "--config", "wrangler.jsonc", "--env-file", "/dev/null"],
  { stdio: "inherit" },
);

if (result.error) {
  throw result.error;
}
if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

// Wrangler's runtime declarations can contain whitespace-only line endings.
// Normalize only that generated noise so `git diff --check` stays meaningful
// after every isolated type-generation run.
const outputPath = new URL("../worker-configuration.d.ts", import.meta.url);
const generated = readFileSync(outputPath, "utf8");
const normalized = generated.replace(/[ \t]+$/gmu, "");
if (normalized !== generated) {
  writeFileSync(outputPath, normalized);
}

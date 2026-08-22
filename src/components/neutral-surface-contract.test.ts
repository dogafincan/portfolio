import { readdirSync, readFileSync } from "node:fs";
import { join, sep } from "node:path";

import { describe, expect, it } from "vite-plus/test";

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return entry.isFile() && /\.(?:ts|tsx)$/u.test(path) ? [path] : [];
  });
}

describe("neutral surface adoption", () => {
  it("keeps product Items outlined unless a neutral fill is explicitly approved", () => {
    const violations = sourceFiles("src/components")
      .filter((path) => !path.includes(`${sep}ui${sep}`))
      .filter((path) => !path.endsWith(".test.ts") && !path.endsWith(".test.tsx"))
      .filter((path) => readFileSync(path, "utf8").includes('variant="muted"'));

    expect(violations).toEqual([]);
  });
});

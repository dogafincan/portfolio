import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vite-plus/test";

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    const stats = statSync(path);

    if (stats.isDirectory()) {
      return sourceFiles(path);
    }

    return /\.(ts|tsx)$/.test(entry) ? [path] : [];
  });
}

describe("icon system", () => {
  it("keeps product UI icons on Lucide", () => {
    const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const componentsJson = JSON.parse(readFileSync("components.json", "utf8")) as {
      iconLibrary?: string;
    };
    const srcFilesWithHugeiconsImports = sourceFiles("src").filter((path) => {
      const source = readFileSync(path, "utf8");
      return /from\s+["']@hugeicons\//.test(source);
    });
    const srcFilesWithLucideImports = sourceFiles("src").filter((path) => {
      const source = readFileSync(path, "utf8");
      return /from\s+["']lucide-react["']/.test(source);
    });

    expect(packageJson.dependencies?.["lucide-react"]).toBeDefined();
    expect(componentsJson.iconLibrary).toBe("lucide");
    expect(packageJson.dependencies?.["@hugeicons/core-free-icons"]).toBeUndefined();
    expect(packageJson.dependencies?.["@hugeicons/react"]).toBeUndefined();
    expect(packageJson.devDependencies?.["@hugeicons/core-free-icons"]).toBeUndefined();
    expect(packageJson.devDependencies?.["@hugeicons/react"]).toBeUndefined();
    expect(srcFilesWithHugeiconsImports).toEqual([]);
    expect(srcFilesWithLucideImports.length).toBeGreaterThan(0);
  });
});

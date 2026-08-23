import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

const componentsDirectory = fileURLToPath(new URL("./", import.meta.url));
const legacyDialogPrimitive = fileURLToPath(new URL("./ui/dialog.tsx", import.meta.url));
const representativePopupSources = [
  readFileSync(new URL("./project-submission-form.tsx", import.meta.url), "utf8"),
];

function productionComponentSources(directory: string): Array<{ path: string; source: string }> {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = directory + "/" + entry.name;

    if (entry.isDirectory()) {
      return productionComponentSources(path);
    }
    if (!entry.name.endsWith(".tsx") || entry.name.includes(".test.")) {
      return [];
    }

    return [{ path, source: readFileSync(path, "utf8") }];
  });
}

describe("universal app-owned popup contract", () => {
  it("keeps Dialog and AlertDialog primitives out of product source", () => {
    expect(existsSync(legacyDialogPrimitive)).toBe(false);

    for (const { path, source } of productionComponentSources(componentsDirectory)) {
      expect(source, path).not.toMatch(
        /from\s+["']@\/components\/ui\/(?:dialog|alert-dialog)["']/u,
      );
      expect(source, path).not.toMatch(/<(?:Dialog|AlertDialog)(?:\s|>)/u);
      expect(source, path).not.toContain('role="dialog"');
      expect(source, path).not.toMatch(/<ConnectModal(?:\s|>)/u);
    }
  });

  it("uses responsive-center swipe-aware Drawers for retained popup workflows", () => {
    for (const source of representativePopupSources) {
      expect(source).toContain('from "@/components/ui/drawer"');
      expect(source).toContain("<Drawer");
      expect(source).toContain('placement="responsive-center"');
      expect(source).toContain("showSwipeHandle");
    }
  });
});

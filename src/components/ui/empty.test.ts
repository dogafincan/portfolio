import { readFileSync } from "node:fs";

import { describe, expect, it } from "vite-plus/test";

describe("Empty layout contract", () => {
  it("fills unused space below empty content", () => {
    const source = readFileSync("src/components/ui/empty.tsx", "utf8");

    expect(source).toContain("flex-1 self-stretch");
    expect(source).toContain("border-dashed");
    expect(source).toContain("border-boundary");
    expect(source).toContain("px-6 py-10");
    expect(source).toContain("sm:px-12");
    expect(source).not.toContain("sm:p-12");
  });
});

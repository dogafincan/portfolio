import { readFileSync } from "node:fs";

import { describe, expect, it } from "vite-plus/test";

describe("Empty layout contract", () => {
  it("fills unused space below empty content", () => {
    const source = readFileSync("src/components/ui/empty.tsx", "utf8");

    expect(source).toContain("flex-1 self-stretch");
    expect(source).toContain("border-dashed");
  });
});

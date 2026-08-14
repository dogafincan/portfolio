import { readFileSync } from "node:fs";

import { describe, expect, it } from "vite-plus/test";

describe("portfolio page-header action contract", () => {
  it("keeps one owner-profile badge and omits Doji utility actions", () => {
    const headerSource = readFileSync("src/components/app-header.tsx", "utf8");

    expect(headerSource).toContain('export const X_PROFILE_URL = "https://x.com/dogafincan";');
    expect(headerSource).toContain(
      'export const PORTFOLIO_BADGE_LABEL = "Follow Doga Fincan on X";',
    );
    expect(headerSource).toContain('data-lucide="x-profile-link"');
    expect(headerSource).not.toContain("WalletControl");
    expect(headerSource).not.toContain('data-slot="app-header-actions"');
    expect(headerSource).not.toContain("Submit project");
  });
});

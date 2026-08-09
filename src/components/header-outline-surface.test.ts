import { readFileSync } from "node:fs";

import { describe, expect, it } from "vite-plus/test";

describe("page-header outline surfaces", () => {
  it("uses the card surface for submission and connected-wallet actions", () => {
    const headerSource = readFileSync("src/components/app-header.tsx", "utf8");
    const walletSource = readFileSync("src/components/wallet-control.tsx", "utf8");

    expect(headerSource).toContain('cn(buttonVariants({ variant: "outline" }), "bg-card")');
    expect(walletSource).toContain('className={isConnected ? "bg-card" : undefined}');
  });
});

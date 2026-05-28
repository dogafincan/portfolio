import { describe, expect, it } from "vite-plus/test";

import { buttonVariants } from "./button";

describe("button variants", () => {
  it("uses dedicated iMessage-blue tokens for primary button states", () => {
    const primary = buttonVariants();

    expect(primary).toContain("bg-[var(--button-primary)]");
    expect(primary).toContain("text-[var(--button-primary-foreground)]");
    expect(primary).toContain("hover:bg-[var(--button-primary-hover)]");
    expect(primary).toContain("active:bg-[var(--button-primary-active)]");
    expect(primary).toContain("aria-expanded:bg-[var(--button-primary-active)]");
    expect(primary).toContain("focus-visible:border-[var(--button-primary)]");
    expect(primary).toContain("focus-visible:ring-[var(--button-primary-ring)]");
    expect(primary).toContain("disabled:bg-[var(--button-primary-disabled)]");
    expect(primary).toContain("disabled:text-[var(--button-primary-disabled-foreground)]");
    expect(primary).toContain("disabled:opacity-100");
    expect(primary).not.toContain("bg-primary");
    expect(primary).not.toContain("text-primary-foreground");
  });

  it("keeps non-primary variants off the primary button color tokens", () => {
    expect(buttonVariants({ variant: "outline" })).not.toContain("--button-primary");
    expect(buttonVariants({ variant: "secondary" })).not.toContain("--button-primary");
    expect(buttonVariants({ variant: "ghost" })).not.toContain("--button-primary");
  });
});

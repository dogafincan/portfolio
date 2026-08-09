import { describe, expect, it } from "vite-plus/test";

import { buttonVariants } from "./button";

describe("button variants", () => {
  it("uses the preset primary button tokens", () => {
    const primary = buttonVariants();

    expect(primary).toContain("bg-primary");
    expect(primary).toContain("border-transparent");
    expect(primary).toContain("text-primary-foreground");
    expect(primary).toContain("control-target");
    expect(primary).toContain("text-base");
    expect(primary).toContain("leading-6");
    expect(primary).not.toContain("tracking-tight");
    expect(primary).toContain("hover:bg-primary-hover");
    expect(primary).toContain("active:bg-primary-active");
    expect(primary).toContain("focus-visible:ring-focus-ring");
    expect(primary).toContain("aria-invalid:ring-destructive-border");
    expect(primary).toContain("disabled:opacity-50");
    expect(primary).not.toContain("--button-primary");
  });

  it("keeps non-primary variants on preset semantic tokens", () => {
    const outline = buttonVariants({ variant: "outline" });
    const info = buttonVariants({ variant: "info" });
    const secondary = buttonVariants({ variant: "secondary" });
    const ghost = buttonVariants({ variant: "ghost" });
    const destructive = buttonVariants({ variant: "destructive" });

    expect(outline).toContain("border-border");
    expect(outline).not.toContain("border-transparent");
    expect(outline).not.toContain("bg-background");
    expect(outline).not.toContain("bg-card");
    expect(outline).not.toContain("dark:bg-transparent");
    expect(outline).toContain("hover:bg-muted");
    expect(outline).toContain("active:bg-control-active");
    expect(info).toContain("bg-control-info");
    expect(info).toContain("text-control-info-foreground");
    expect(info).toContain("hover:bg-control-info-hover");
    expect(info).toContain("active:bg-control-info-active");
    expect(secondary).toContain("bg-secondary");
    expect(secondary).toContain("hover:bg-secondary-hover");
    expect(ghost).toContain("hover:bg-control-hover");
    expect(destructive).toContain("bg-destructive-surface");
    expect(destructive).toContain("text-destructive-foreground");
    expect(destructive).toContain("hover:bg-destructive-hover");
  });

  it("keeps link buttons on the shared blue foreground role", () => {
    expect(buttonVariants({ variant: "link" })).toContain("text-info-foreground");
  });

  it("keeps every text button size on the universal 44px height", () => {
    const sizes = ["xs", "sm", "default", "lg"] as const;

    for (const size of sizes) {
      expect(buttonVariants({ size })).toContain("h-11");
      expect(buttonVariants({ size })).toContain("control-target");
    }

    const large = buttonVariants({ size: "lg" });
    expect(large).toContain("text-base");
    expect(large).toContain("leading-6");
    expect(large).not.toContain("tracking-tight");
    expect(large).not.toContain("font-semibold");
  });

  it("keeps every icon button on a real 44px square", () => {
    const sizes = ["icon-xs", "icon-sm", "icon", "icon-lg"] as const;

    for (const size of sizes) {
      expect(buttonVariants({ size })).toContain("size-11");
      expect(buttonVariants({ size })).toContain("control-target");
    }
  });

  it("keeps compact button sizes on compact typography", () => {
    expect(buttonVariants({ size: "xs" })).toContain("text-sm");
    expect(buttonVariants({ size: "sm" })).toContain("text-sm");
  });
});

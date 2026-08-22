import { describe, expect, it } from "vite-plus/test";

import { buttonVariants } from "./button";

describe("button variants", () => {
  it("uses the preset primary button tokens", () => {
    const primary = buttonVariants();

    expect(primary).toContain("bg-primary");
    expect(primary).toContain("border-transparent");
    expect(primary).toContain("text-primary-foreground");
    expect(primary).toContain("button-target");
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

  it("keeps ordinary secondary actions on the neutral outline hierarchy", () => {
    const outline = buttonVariants({ variant: "outline" });
    const secondary = buttonVariants({ variant: "secondary" });
    const ghost = buttonVariants({ variant: "ghost" });
    const destructive = buttonVariants({ variant: "destructive" });

    expect(outline).toContain("border-border");
    expect(outline).not.toContain("border-transparent");
    expect(outline).not.toContain("bg-background");
    expect(outline).not.toContain("bg-card");
    expect(outline).not.toContain("dark:bg-transparent");
    expect(outline).toContain("bg-transparent");
    expect(outline).toContain("text-foreground");
    expect(outline).not.toContain("text-info-foreground");
    expect(outline).toContain("hover:bg-muted");
    expect(outline).toContain("hover:text-foreground");
    expect(outline).toContain("aria-expanded:bg-muted");
    expect(outline).toContain("aria-expanded:text-foreground");
    expect(outline).toContain("dark:hover:bg-input/30");
    expect(outline).not.toContain("active:bg-control-active");
    expect(outline).not.toContain("aria-expanded:bg-accent");
    expect(secondary).toContain("bg-secondary");
    expect(secondary).toContain("hover:bg-secondary-hover");
    expect(ghost).toContain("hover:bg-control-hover");
    expect(destructive).toContain("bg-destructive-strong");
    expect(destructive).toContain("text-destructive-strong-foreground");
    expect(destructive).toContain("hover:bg-destructive-strong-hover");
  });

  it("provides filled semantic actions and alert-matched muted tones", () => {
    const success = buttonVariants({ variant: "success" });
    const infoMuted = buttonVariants({ variant: "info-muted" });
    const warning = buttonVariants({ variant: "warning" });
    const warningMuted = buttonVariants({ variant: "warning-muted" });
    const destructive = buttonVariants({ variant: "destructive" });
    const destructiveMuted = buttonVariants({ variant: "destructive-muted" });

    expect(success).toContain("bg-success-strong");
    expect(success).toContain("text-success-strong-foreground");
    expect(success).toContain("active:bg-success-strong-active");
    expect(infoMuted).toContain("border-transparent");
    expect(infoMuted).toContain("bg-info");
    expect(infoMuted).toContain("text-info-foreground");
    expect(infoMuted).toContain("hover:bg-control-info-hover");
    expect(infoMuted).toContain("active:bg-control-info-active");
    expect(infoMuted).not.toContain("border-border");
    expect(warning).toContain("bg-warning-strong");
    expect(warning).toContain("text-warning-strong-foreground");
    expect(warning).toContain("active:bg-warning-strong-active");
    expect(warningMuted).toContain("border-transparent");
    expect(warningMuted).toContain("bg-warning");
    expect(warningMuted).toContain("text-warning-foreground");
    expect(warningMuted).toContain("hover:bg-warning-hover");
    expect(warningMuted).toContain("active:bg-warning-active");
    expect(warningMuted).not.toContain("border-border");
    expect(destructive).toContain("bg-destructive-strong");
    expect(destructive).toContain("active:bg-destructive-strong-active");
    expect(destructiveMuted).toContain("border-transparent");
    expect(destructiveMuted).toContain("bg-destructive-surface");
    expect(destructiveMuted).toContain("text-destructive-foreground");
    expect(destructiveMuted).toContain("hover:bg-destructive-hover");
    expect(destructiveMuted).toContain("active:bg-destructive-active");
    expect(destructiveMuted).not.toContain("border-border");
  });

  it("keeps link buttons on the shared blue foreground role", () => {
    expect(buttonVariants({ variant: "link" })).toContain("text-info-foreground");
  });

  it("keeps every text button size on the universal 36px height", () => {
    const sizes = ["xs", "sm", "default", "lg"] as const;

    for (const size of sizes) {
      expect(buttonVariants({ size })).toContain("h-9");
      expect(buttonVariants({ size })).toContain("button-target");
    }

    const large = buttonVariants({ size: "lg" });
    expect(large).toContain("text-base");
    expect(large).toContain("leading-6");
    expect(large).not.toContain("tracking-tight");
    expect(large).not.toContain("font-semibold");
  });

  it("keeps every icon button on a real 36px square", () => {
    const sizes = ["icon-xs", "icon-sm", "icon", "icon-lg"] as const;

    for (const size of sizes) {
      expect(buttonVariants({ size })).toContain("size-9");
      expect(buttonVariants({ size })).toContain("button-target");
    }
  });

  it("keeps compact button sizes on compact typography", () => {
    expect(buttonVariants({ size: "xs" })).toContain("text-sm");
    expect(buttonVariants({ size: "sm" })).toContain("text-sm");
  });
});

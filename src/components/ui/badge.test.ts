import { describe, expect, it } from "vite-plus/test";

import { badgeVariants } from "./badge";

describe("badge variants", () => {
  it("uses a subtle neutral treatment by default", () => {
    const badge = badgeVariants();

    expect(badge).toContain("bg-badge-neutral");
    expect(badge).toContain("text-badge-neutral-foreground");
    expect(badge).toContain("[a]:hover:bg-control-hover");
    expect(badge).toContain("[a]:active:bg-control-active");
    expect(badge).not.toContain("bg-primary");
  });

  it.each([
    ["info", "bg-badge-info", "text-badge-info-foreground"],
    ["success", "bg-badge-success", "text-badge-success-foreground"],
    ["warning", "bg-badge-warning", "text-badge-warning-foreground"],
    ["destructive", "bg-badge-destructive", "text-badge-destructive-foreground"],
  ] as const)("supports the subtle %s treatment", (variant, background, foreground) => {
    const badge = badgeVariants({ variant });

    expect(badge).toContain(background);
    expect(badge).toContain(foreground);
  });

  it.each([
    ["success", "bg-badge-success-hover", "bg-badge-success-active"],
    ["warning", "bg-badge-warning-hover", "bg-badge-warning-active"],
    ["destructive", "bg-badge-destructive-hover", "bg-badge-destructive-active"],
  ] as const)(
    "keeps linked %s badge interactions in their tone family",
    (variant, hover, active) => {
      const badge = badgeVariants({ variant });

      expect(badge).toContain(`[a]:hover:${hover}`);
      expect(badge).toContain(`[a]:active:${active}`);
    },
  );

  it("gives linked info badges subtle semantic hover and active treatments", () => {
    const badge = badgeVariants({ variant: "info" });

    expect(badge).toContain("[a]:hover:bg-badge-info-hover");
    expect(badge).toContain("[a]:active:bg-badge-info-active");
  });

  it.each(["outline", "ghost"] as const)(
    "gives clickable %s badges neutral hover and active treatments",
    (variant) => {
      const badge = badgeVariants({ variant });

      expect(badge).toContain(
        variant === "outline" ? "[a]:hover:bg-control-hover" : "hover:bg-control-hover",
      );
      expect(badge).toContain(
        variant === "outline" ? "[a]:active:bg-control-active" : "active:bg-control-active",
      );
    },
  );

  it("provides a dedicated header information treatment", () => {
    const badge = badgeVariants({ variant: "header-info" });

    expect(badge).toContain("bg-badge-header-info");
    expect(badge).toContain("text-badge-header-info-foreground");
    expect(badge).toContain("[a]:hover:bg-badge-header-info-hover");
    expect(badge).toContain("[a]:active:bg-badge-header-info-active");
  });

  it.each(["outline", "ghost"] as const)(
    "keeps the %s variant on the shared status surface",
    (variant) => {
      expect(badgeVariants({ variant })).toContain("bg-status-surface");
    },
  );

  it("gives the blue-foreground link variant the information surface", () => {
    const badge = badgeVariants({ variant: "link" });

    expect(badge).toContain("bg-badge-info");
    expect(badge).toContain("text-info-foreground");
    expect(badge).toContain("hover:bg-badge-info-hover");
    expect(badge).toContain("active:bg-badge-info-active");
  });

  it.each([
    ["neutral-strong", "bg-badge-neutral-strong", "text-contrast-foreground"],
    ["info-strong", "bg-badge-info-strong", "text-contrast-foreground"],
    ["success-strong", "bg-badge-success-strong", "text-contrast-foreground"],
    ["warning-strong", "bg-badge-warning-strong", "text-badge-warning-strong-foreground"],
    ["destructive-strong", "bg-badge-destructive-strong", "text-contrast-foreground"],
  ] as const)("supports the %s opt-in", (variant, background, foreground) => {
    const badge = badgeVariants({ variant });

    expect(badge).toContain(background);
    expect(badge).toContain(foreground);
  });
});

// @vitest-environment jsdom

import { render } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function expectClassTokens(element: Element | null, tokens: string[]) {
  expect(element).toBeTruthy();
  const classTokens = element?.className.split(/\s+/) ?? [];

  for (const token of tokens) {
    expect(classTokens).toContain(token);
  }
}

function expectToneSurface(element: Element | null, surface: string) {
  expectClassTokens(element, ["border", "border-transparent", surface]);
  expect(element?.className).not.toContain("bg-transparent");
  expect(element?.className).not.toMatch(/border-(?:info|success|warning|destructive)-border/);
}

describe("Alert", () => {
  it("matches Item title and description typography with preset icon sizing", () => {
    const { container } = render(
      <Alert>
        <svg aria-hidden="true" />
        <AlertTitle>Alert title</AlertTitle>
        <AlertDescription>Alert description</AlertDescription>
      </Alert>,
    );

    const alert = container.querySelector('[data-slot="alert"]');
    const alertTitle = container.querySelector('[data-slot="alert-title"]');
    const alertDescription = container.querySelector('[data-slot="alert-description"]');

    expectClassTokens(alertTitle, ["text-base", "leading-6", "font-medium", "tracking-[-0.01em]"]);
    expectClassTokens(alert, ["text-base", "bg-info", "text-info-foreground"]);
    expectClassTokens(alertDescription, [
      "text-left",
      "text-base",
      "leading-6",
      "font-normal",
      "text-pretty",
      "text-muted-foreground",
    ]);
    expect(alertDescription?.className).not.toContain("text-balance");
    expect(alert?.className).toContain("gap-0.5");
    expect(alert?.className).toContain("*:[svg:not([class*='size-'])]:size-4");
    expect(alert?.className).toContain("*:[svg]:translate-y-[3px]");
  });

  it("uses transparent borders, semantic surfaces, and foreground families for every variant", () => {
    const variants = ["default", "destructive", "info", "success", "warning"] as const;
    const { container } = render(
      <>
        {variants.map((variant) => (
          <Alert
            key={variant}
            data-testid={`${variant}-alert`}
            variant={variant === "default" ? undefined : variant}
          >
            <svg aria-hidden="true" />
            <AlertTitle>{variant}</AlertTitle>
            <AlertDescription>{variant} description</AlertDescription>
          </Alert>
        ))}
      </>,
    );

    const expectedTokens = {
      default: [
        "border-transparent",
        "bg-info",
        "text-info-foreground",
        "*:data-[slot=alert-description]:text-info-foreground",
      ],
      destructive: [
        "border-transparent",
        "bg-destructive-surface",
        "text-destructive-foreground",
        "*:data-[slot=alert-description]:text-destructive-foreground",
      ],
      info: [
        "border-transparent",
        "bg-info",
        "text-info-foreground",
        "*:data-[slot=alert-description]:text-info-foreground",
      ],
      success: [
        "border-transparent",
        "bg-success",
        "text-success-foreground",
        "*:data-[slot=alert-description]:text-success-foreground",
      ],
      warning: [
        "border-transparent",
        "bg-warning",
        "text-warning-foreground",
        "*:data-[slot=alert-description]:text-warning-foreground",
      ],
    } as const;

    for (const variant of variants) {
      const alert = container.querySelector(`[data-testid="${variant}-alert"]`);

      expectClassTokens(alert, [...expectedTokens[variant]]);
      expectToneSurface(alert, expectedTokens[variant][1]);
      expect(alert?.className).toContain("*:[svg]:text-current");

      if (variant !== "destructive") {
        expect(alert?.className).not.toContain("text-destructive-foreground");
      }
    }
  });
});

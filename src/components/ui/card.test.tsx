// @vitest-environment jsdom

import { render } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Item } from "@/components/ui/item";

describe("Card", () => {
  it("uses the app card surface treatment", () => {
    const { container } = render(
      <>
        <Card>Card content</Card>
        <Item variant="outline">Item content</Item>
      </>,
    );
    const card = container.querySelector('[data-slot="card"]');
    const outlineItem = container.querySelector('[data-slot="item"]');

    expect(card?.className).toContain("bg-card");
    expect(card?.className).toContain("border");
    expect(card?.className).toContain("border-border");
    expect(card?.className).not.toContain("shadow");
    expect(card?.className).not.toContain("ring-1");
    expect(card?.className).not.toContain("ring-foreground");
    expect(outlineItem?.className).toContain("border");
    expect(outlineItem?.className).toContain("border-border");
  });

  it("owns the shared section and main-area spacing", () => {
    const { container } = render(
      <Card size="sm">
        <CardHeader>Header</CardHeader>
        <CardContent>
          <FieldGroup>
            <div>Main item one</div>
            <div>Main item two</div>
          </FieldGroup>
        </CardContent>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );
    const card = container.querySelector('[data-slot="card"]');
    const content = container.querySelector('[data-slot="card-content"]');
    const footer = container.querySelector('[data-slot="card-footer"]');

    expect(card?.className).toContain("gap-(--ds-surface-section-gap)");
    expect(card?.className).toContain("py-(--ds-surface-inset)");
    expect(content?.className).toContain("flex");
    expect(content?.className).toContain("min-h-0");
    expect(content?.className.split(/\s+/)).not.toContain("flex-1");
    expect(content?.className).toContain("flex-col");
    expect(content?.className).toContain("gap-(--ds-surface-stack-gap)");
    expect(content?.className).toContain("px-(--ds-surface-inset)");
    expect(content?.className).toContain(
      "[&>[data-slot=field-group]]:gap-(--ds-surface-stack-gap)",
    );
    expect(footer?.className).toContain("gap-(--ds-surface-stack-gap)");
    expect(footer?.className).toContain("px-(--ds-surface-inset)");
  });

  it("keeps section and stack gaps invariant in the small card variant", () => {
    const { container } = render(<Card size="sm">Compact card</Card>);
    const card = container.querySelector('[data-slot="card"]');

    expect(card?.className).toContain("data-[size=sm]:[--ds-surface-inset:--spacing(4)]");
    expect(card?.className).not.toContain("data-[size=sm]:[--ds-surface-section-gap:");
    expect(card?.className).not.toContain("data-[size=sm]:[--ds-surface-stack-gap:");
  });
});

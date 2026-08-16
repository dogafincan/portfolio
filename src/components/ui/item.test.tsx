// @vitest-environment jsdom

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { render } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import { Alert } from "@/components/ui/alert";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";

const DESCRIPTION_CUTOFF_UTILITY =
  /\b(?:line-clamp(?:-[^\s"'`}]+)?|truncate|text-ellipsis|overflow-hidden)\b/u;

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return sourceFiles(path);
    }
    return entry.isFile() && path.endsWith(".tsx") ? [path] : [];
  });
}

function descriptionCutoffViolations() {
  const violations: string[] = [];
  for (const path of sourceFiles("src")) {
    const source = readFileSync(path, "utf8");
    const descriptionBlocks = source.matchAll(/<([A-Z][A-Za-z]*Description)\b[\s\S]*?<\/\1>/gu);
    const descriptionPrimitives = source.matchAll(
      /function\s+[A-Za-z]+Description\b[\s\S]*?^\}/gmu,
    );

    for (const match of [...descriptionBlocks, ...descriptionPrimitives]) {
      if (DESCRIPTION_CUTOFF_UTILITY.test(match[0])) {
        violations.push(path);
      }
    }
  }
  return [...new Set(violations)];
}

describe("Item", () => {
  it("uses exact Geist muted and focus colors", () => {
    const { container } = render(<Item variant="muted">Muted summary</Item>);
    const item = container.querySelector('[data-slot="item"]');

    expect(item?.className).toContain("bg-item-muted");
    expect(item?.className).toContain("[&_[data-slot=item-description]]:text-foreground");
    expect(item?.className).toContain("focus-visible:ring-focus-ring");
    expect(item?.className.split(/\s+/)).not.toContain("bg-muted");
    expect(item?.className).not.toContain("bg-muted/50");
    expect(item?.className).not.toContain("ring-ring/50");
  });

  it("uses the preset item and alert icon treatment", () => {
    const { container } = render(
      <>
        <Alert>
          <svg aria-hidden="true" />
        </Alert>
        <Item>
          <ItemMedia variant="icon">
            <svg aria-hidden="true" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Item title</ItemTitle>
            <ItemDescription>Item description</ItemDescription>
          </ItemContent>
        </Item>
      </>,
    );

    const alert = container.querySelector('[data-slot="alert"]');
    const itemMedia = container.querySelector('[data-slot="item-media"]');
    const itemTitle = container.querySelector('[data-slot="item-title"]');
    const itemDescription = container.querySelector('[data-slot="item-description"]');

    expect(alert?.className).toContain("*:[svg:not([class*='size-'])]:size-4");
    expect(alert?.className).toContain("*:[svg]:translate-y-[3px]");
    expect(itemMedia?.className).toContain("[&_svg:not([class*='size-'])]:size-4");
    expect(itemMedia?.className).toContain(
      "group-has-data-[slot=item-description]/item:translate-y-[3px]",
    );
    expect(itemMedia?.className).toContain(
      "group-has-data-[slot=item-description]/item:self-start",
    );
    const itemContent = container.querySelector('[data-slot="item-content"]');
    expect(itemContent?.className).toContain("min-w-0");
    expect(itemContent?.className).toContain("gap-1");
    expect(itemMedia?.querySelector("svg")?.getAttribute("stroke-width")).toBeNull();
    expect(itemTitle?.className).toContain("line-clamp-1");
    expect(itemTitle?.className).toContain("text-base");
    expect(itemTitle?.className).toContain("leading-6");
    expect(itemTitle?.className).toContain("tracking-[-0.01em]");
    expect(itemDescription?.className).toContain("whitespace-normal");
    expect(itemDescription?.className).toContain("break-words");
    expect(itemDescription?.className).toContain("text-muted-foreground");
    expect(itemDescription?.className).not.toMatch(DESCRIPTION_CUTOFF_UTILITY);
    expect(itemDescription?.className).toContain("text-base");
    expect(itemDescription?.className).toContain("leading-6");
  });

  it("keeps non-icon media on the preset vertical offset", () => {
    const { container } = render(
      <Item>
        <ItemMedia>
          <span aria-hidden="true" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Avatar item</ItemTitle>
          <ItemDescription>Avatar description</ItemDescription>
        </ItemContent>
      </Item>,
    );

    expect(container.querySelector('[data-slot="item-media"]')?.className).toContain(
      "group-has-data-[slot=item-description]/item:translate-y-0.5",
    );
  });

  it("owns the avatar and image container background", () => {
    const { container } = render(
      <Item>
        <ItemMedia variant="image">
          <img alt="" />
        </ItemMedia>
      </Item>,
    );

    expect(container.querySelector('[data-slot="item-media"]')?.className).toContain(
      "bg-item-avatar-background",
    );
  });

  it("never cuts off semantic description text", () => {
    expect(descriptionCutoffViolations()).toEqual([]);
  });
});

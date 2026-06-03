// @vitest-environment jsdom

import { render } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import { OgImagePreview } from "@/components/og-image-preview";

describe("OgImagePreview", () => {
  it("uses the top-cropped page-atmosphere artwork without the app fade gradient", () => {
    const { container } = render(<OgImagePreview seed="preview" title="Doga Fincan" />);
    const preview = container.querySelector("[data-og-preview]");
    const background = container.querySelector('[data-og-background="page-atmosphere"]');
    const backgroundStyle = background?.getAttribute("style") ?? "";

    expect(preview?.getAttribute("style")).toContain(
      "background: var(--portfolio-app-chrome-color);",
    );
    expect(backgroundStyle).toContain('background-image: url("/page-atmosphere.avif");');
    expect(backgroundStyle).toContain("background-position: center top;");
    expect(backgroundStyle).toContain("background-size: 100%;");
    expect(backgroundStyle).not.toContain("linear-gradient");
    expect(backgroundStyle).not.toContain("header-clouds");
    expect(container.innerHTML).not.toContain('data-og-background="clouds"');
    expect(container.innerHTML).not.toContain("--portfolio-page-background");
    expect(container.innerHTML).not.toContain("color-mix");
    expect(container.innerHTML).not.toContain("mask-image");
  });
});

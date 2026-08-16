// @vitest-environment jsdom

import { render } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import { OgImagePreview } from "@/components/og-image-preview";
import { PORTFOLIO_BADGE_LABEL, X_PROFILE_URL } from "@/components/app-header";
import { dojiTypography } from "@/lib/doji-ui";
import {
  PORTFOLIO_PAGE_SUBTITLE,
  PORTFOLIO_PAGE_TITLE,
  PORTFOLIO_PAGE_TITLE_ACCENT,
} from "@/lib/portfolio-page-copy";

describe("OgImagePreview", () => {
  it("composes a solid dark social image from the real navbar and page header", () => {
    const { container } = render(<OgImagePreview seed="preview" title="Doga Fincan Portfolio" />);
    const preview = container.querySelector("[data-og-preview]");
    const navbar = container.querySelector('[data-slot="app-navbar"]');
    const brand = navbar?.querySelector('[data-slot="app-navbar-brand"]');
    const logo = navbar?.querySelector('[data-slot="app-navbar-logo"]');
    const headerSection = container.querySelector('[data-slot="og-preview-header"]');
    const safeRegion = container.querySelector('[data-slot="og-preview-safe-region"]');
    const title = safeRegion?.querySelector('[data-slot="app-header-title"]');
    const accent = safeRegion?.querySelector('[data-slot="app-header-title-accent"]');
    const subtitle = safeRegion?.querySelector('[data-slot="app-header-subtitle"]');
    const discovery = safeRegion?.querySelector('[data-slot="badge"]');

    expect(preview?.getAttribute("style")).toContain("color-scheme: dark");
    expect(preview?.className).toContain("h-[630px]");
    expect(preview?.className).toContain("w-[1200px]");
    expect(preview?.className).toContain("bg-background");
    expect(container.innerHTML).not.toContain("page-atmosphere");
    expect(container.innerHTML).not.toContain("linear-gradient");
    expect(container.innerHTML).not.toContain("drop-shadow");

    expect(navbar?.getAttribute("data-variant")).toBe("social");
    expect(navbar?.className).toContain("h-28");
    expect(navbar?.className).toContain("bg-card");
    expect(brand?.getAttribute("href")).toBe("/");
    expect(brand?.textContent).toContain("Doga Fincan");
    expect(logo?.getAttribute("src")).toBe("/app-logo-120-navbar-light.png");
    expect(logo?.previousElementSibling?.getAttribute("srcset")).toBe(
      "/app-logo-120-navbar-dark.png",
    );
    expect(logo?.getAttribute("sizes")).toBe("80px");
    expect(logo?.getAttribute("width")).toBe("80");
    expect(logo?.getAttribute("height")).toBe("80");
    expect(logo?.className).not.toContain("rounded");
    expect(logo?.parentElement?.className).not.toContain("overflow-hidden");

    expect(headerSection?.className).toContain("px-16");
    expect(headerSection?.className).toContain("pt-5");
    expect(headerSection?.className).toContain("pb-24");
    expect(safeRegion?.className).toContain("items-start");
    expect(title?.textContent).toBe(PORTFOLIO_PAGE_TITLE);
    expect(title?.className).toContain(dojiTypography.socialTitle);
    expect(title?.className).toContain("max-w-[900px]");
    expect(accent?.textContent).toBe(PORTFOLIO_PAGE_TITLE_ACCENT);
    expect(accent?.className).toContain("text-page-title-accent");
    expect(subtitle?.textContent).toBe(PORTFOLIO_PAGE_SUBTITLE);
    expect(subtitle?.className).toContain(dojiTypography.socialSubtitle);
    expect(subtitle?.className).toContain("max-w-[860px]");
    expect(discovery?.textContent).toContain(PORTFOLIO_BADGE_LABEL);
    expect(discovery?.getAttribute("href")).toBe(X_PROFILE_URL);
    expect(discovery?.querySelector('[data-lucide="x-profile-link"]')).not.toBeNull();
    expect(discovery?.className).toContain("h-14");
    expect(container.querySelector('[data-slot="app-header-actions"]')).toBeNull();
    expect(container.textContent).not.toContain("Connect wallet");
    expect(container.textContent).not.toContain("Submit project");
  });
});

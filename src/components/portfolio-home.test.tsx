// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vite-plus/test";

import { AppProviders } from "@/components/app-providers";
import { PortfolioHome } from "@/components/portfolio-home";
import { portfolioProjects } from "@/content/projects";
import {
  PORTFOLIO_PAGE_SUBTITLE,
  PORTFOLIO_PAGE_TITLE,
  PORTFOLIO_PAGE_TITLE_ACCENT,
} from "@/lib/portfolio-page-copy";

function renderPortfolioHome() {
  return render(
    <AppProviders>
      <PortfolioHome />
    </AppProviders>,
  );
}

describe("PortfolioHome", () => {
  afterEach(cleanup);

  it("renders the canonical page identity, app chrome, and real project cards", () => {
    const { container } = renderPortfolioHome();
    const title = screen.getByRole("heading", {
      level: 1,
      name: PORTFOLIO_PAGE_TITLE,
    });
    const subtitle = screen.getByText(
      /I’m Doga Fincan, a developer interested in language learning/,
    );
    const main = container.querySelector("main");
    const navbar = container.querySelector('[data-slot="app-navbar"]');
    const navbarContent = container.querySelector('[data-slot="app-navbar-content-rail"]');
    const headerActions = container.querySelector('[data-slot="app-header-actions"]');
    const brand = screen.getByRole("link", { name: "Doga Fincan home" });
    const logo = brand.querySelector("img");
    const footer = container.querySelector("footer");

    expect(main?.className).toContain("app-shell");
    expect(main?.className).toContain("gap-8");
    expect(title.className).toContain("text-3xl");
    expect(title.className).toContain("xl:text-5xl");
    expect(Array.from(PORTFOLIO_PAGE_TITLE)).toHaveLength(40);
    expect(Array.from(PORTFOLIO_PAGE_SUBTITLE)).toHaveLength(155);
    expect(title.querySelector(".text-page-title-accent")?.textContent).toBe(
      PORTFOLIO_PAGE_TITLE_ACCENT,
    );
    expect(PORTFOLIO_PAGE_TITLE.endsWith(PORTFOLIO_PAGE_TITLE_ACCENT)).toBe(true);
    expect(subtitle.className).toContain("text-base");
    expect(subtitle.className).toContain("sm:text-lg");
    expect(navbar?.className).toContain("sticky");
    expect(navbar?.className).toContain("bg-card");
    expect(navbarContent?.className).toContain("h-full");
    expect(navbar?.querySelector('[data-slot="app-header-actions"]')).toBeNull();
    expect(headerActions?.className).toContain("flex-col");
    expect(headerActions?.className).toContain("sm:flex-row");
    expect(headerActions?.className).toContain("sm:[&>*]:px-6");
    expect(headerActions?.className).toContain("xl:mt-2");
    expect(
      headerActions?.previousElementSibling?.querySelector('[data-slot="page-subtitle"]'),
    ).toBeTruthy();
    expect(brand.className).toContain("control-target");
    expect(brand.className).toContain("gap-0.5");
    expect(brand.className).toContain("ml-5");
    expect(brand.textContent).toContain("Doga Fincan");
    expect(logo?.className).toContain("translate-y-px");
    expect(logo?.className).not.toContain("rounded");
    expect(logo?.parentElement?.className).not.toContain("overflow-hidden");
    expect(logo?.getAttribute("src")).toBe("/app-logo-120-navbar-light.png");
    expect(logo?.getAttribute("srcset")).toBe("/app-logo-120-navbar-light.png 120w");
    expect(logo?.previousElementSibling?.getAttribute("srcset")).toBe(
      "/app-logo-120-navbar-dark.png",
    );
    expect(logo?.getAttribute("sizes")).toBe("32px");
    expect(logo?.getAttribute("width")).toBe("32");
    expect(logo?.getAttribute("height")).toBe("32");
    const connectWallet = screen.getByRole("button", { name: "Connect wallet" });
    expect(connectWallet.hasAttribute("disabled")).toBe(false);
    expect(screen.getByRole("link", { name: "Submit project" }).getAttribute("href")).toBe(
      "/submit",
    );
    expect(headerActions?.parentElement?.querySelector("[data-chain-migration-alert]")).toBeNull();
    const discovery = screen.getByRole("link", {
      name: "Create CSV in DojiSnap (opens in a new tab)",
    });
    expect(discovery.getAttribute("href")).toBe("https://dojisnap.xyz");
    expect(discovery.getAttribute("target")).toBe("_blank");
    expect(discovery.className).toContain("expanded-control-target");
    expect(footer?.className).toContain("bg-card");
    expect(footer?.textContent).toContain("Copyright Doga Fincan");

    expect(portfolioProjects.map((project) => project.slug)).toEqual([
      "memerank",
      "sui-swap",
      "sui-airdrop",
      "sui-snapshot",
    ]);
    expect(
      screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent),
    ).toEqual(["Memerank", "Sui Swap", "Sui Airdrop", "Sui Snapshot"]);
  });

  it("keeps each project card content natural-height before its text-only primary action", () => {
    const { container } = renderPortfolioHome();
    const projects = screen.getByRole("region", { name: "Projects" });
    const cards = Array.from(projects.querySelectorAll('[data-slot="card"]'));

    expect(projects.className).toContain("lg:grid-cols-2");
    expect(projects.className).toContain("items-stretch");
    expect(projects.className).not.toContain("bg-muted");
    expect(cards).toHaveLength(portfolioProjects.length);
    for (const card of cards) {
      expect(card.className).toContain("h-full");
      expect(
        card.querySelector('[data-slot="card-content"]')?.className.split(/\s+/),
      ).not.toContain("flex-1");
      expect(card.querySelector('[data-slot="card-footer"]')).toBeTruthy();
    }

    for (const project of portfolioProjects) {
      const item = projects.querySelector(`[data-project="${project.slug}"]`);
      const image = screen.getByAltText(project.iconAlt);
      const action = screen.getByRole("link", { name: `Open ${project.name} app` });

      expect(item?.getAttribute("data-variant")).toBe("muted");
      expect(item?.className).toContain("bg-muted");
      expect(item?.className).not.toContain("bg-muted/50");
      expect(item?.querySelector('[data-slot="item-title"] h2')?.textContent).toBe(project.name);
      expect(item?.querySelector('[data-slot="item-description"]')?.textContent).toBe(
        project.subtitle,
      );
      expect(image.getAttribute("src")).toBe(project.icon);
      expect(image.getAttribute("width")).toBe("48");
      expect(image.getAttribute("height")).toBe("48");
      expect(action.getAttribute("href")).toBe(project.liveUrl);
      expect(action.getAttribute("target")).toBe("_blank");
      expect(action.className).toContain("control-target");
      expect(action.className).toContain("w-full");
      expect(action.querySelector("svg")).toBeNull();
      expect(action.textContent).toBe("Open app");
    }

    expect(container.innerHTML).not.toContain("gradient");
    expect(container.innerHTML).not.toContain("drop-shadow");
    expect(container.innerHTML).not.toContain("page-atmosphere");
  });

  it("keeps profile and project actions keyboard reachable with canonical focus and target geometry", () => {
    renderPortfolioHome();

    const profileLinks = [
      screen.getByRole("link", { name: "Open Doga Fincan on X" }),
      screen.getByRole("link", { name: "Open Doga Fincan on GitHub" }),
    ];
    const projectLinks = portfolioProjects.map((project) =>
      screen.getByRole("link", { name: `Open ${project.name} app` }),
    );

    for (const target of [...profileLinks, ...projectLinks]) {
      expect(target.tabIndex).toBe(0);
      expect(target.className).toContain("control-target");
      expect(target.className).toContain("focus-visible:ring-3");
      expect(target.className).toContain("focus-visible:ring-focus-ring");
    }
    for (const link of profileLinks) {
      expect(link.className).toContain("size-11");
      expect(link.className).toContain("bg-control-info");
      expect(link.querySelector("svg")?.getAttribute("class")).toBe("size-5");
    }
  });
});

// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vite-plus/test";

import { AppProviders } from "@/components/app-providers";
import { PORTFOLIO_BADGE_LABEL, X_PROFILE_URL } from "@/components/app-header";
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
    expect(headerActions).toBeNull();
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
    expect(screen.queryByRole("button", { name: "Connect wallet" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Submit project" })).toBeNull();
    const profileBadge = screen.getByRole("link", {
      name: `${PORTFOLIO_BADGE_LABEL} (opens in a new tab)`,
    });
    expect(profileBadge.getAttribute("href")).toBe(X_PROFILE_URL);
    expect(profileBadge.getAttribute("target")).toBe("_blank");
    expect(profileBadge.className).toContain("expanded-control-target");
    expect(profileBadge.querySelector('[data-lucide="x-profile-link"]')).not.toBeNull();
    expect(footer?.className).toContain("bg-card");
    expect(footer?.textContent).toContain("Copyright Doga Fincan");

    expect(portfolioProjects.map((project) => project.slug)).toEqual([
      "memerank",
      "sui-swap",
      "sui-airdrop",
      "sui-snapshot",
      "doji-registry",
    ]);
    expect(
      screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent),
    ).toEqual(["Doji Rank", "Doji Swap", "Doji Drop", "Doji Snap", "Doji Registry"]);
  });

  it("keeps every project Card at its independent natural height", () => {
    const { container } = renderPortfolioHome();
    const projects = screen.getByRole("region", { name: "Projects" });
    const cards = Array.from(projects.querySelectorAll('[data-slot="card"]'));

    expect(projects.className).toContain("lg:grid-cols-2");
    expect(projects.className).toContain("items-start");
    expect(projects.className).not.toContain("bg-muted");
    expect(cards).toHaveLength(portfolioProjects.length);
    for (const card of cards) {
      expect(card.className).not.toContain("h-full");
      expect(card.querySelector('[data-slot="card-content"]')).not.toBeNull();
      expect(card.querySelector('[data-slot="card-header"]')).toBeNull();
      expect(card.querySelector('[data-slot="card-footer"]')).toBeNull();
    }

    for (const project of portfolioProjects) {
      const card = projects.querySelector(`[data-project="${project.slug}"]`);
      const content = card?.querySelector('[data-slot="card-content"]');
      const copy = content?.querySelector('[data-slot="project-copy"]');
      const title = content?.querySelector('[data-slot="card-title"]');
      const description = content?.querySelector('[data-slot="card-description"]');
      const image = screen.getByAltText(project.logoAlt);
      const picture = image.closest("picture");
      const darkSource = picture?.querySelector("source");
      const action = screen.getByRole("link", {
        name: `Open ${project.name} app (opens in a new tab)`,
      });

      expect(card?.getAttribute("data-slot")).toBe("card");
      expect(card?.getAttribute("data-layout")).toBe("centered-action");
      expect(card?.className).toContain("py-0");
      expect(card?.querySelector('[data-slot="item"]')).toBeNull();
      expect(content?.className).toContain("items-center");
      expect(content?.className).toContain("gap-4");
      expect(content?.className).toContain("py-10");
      expect(content?.className).toContain("text-center");
      expect(copy?.className).toContain("gap-2");
      expect(
        Array.from(content?.children ?? []).map((child) => child.getAttribute("data-slot")),
      ).toEqual(["project-logo-media", "project-copy", null]);
      expect(
        Array.from(card?.children ?? []).map((child) => child.getAttribute("data-slot")),
      ).toEqual(["card-content"]);
      expect(card?.className).toContain("gap-0");
      expect(title?.querySelector("h2")?.textContent).toBe(project.name);
      expect(description?.textContent).toBe(project.subtitle);
      expect(description?.className).toContain("text-muted-foreground");
      expect(description?.className).toContain("text-pretty");
      expect(description?.className).not.toContain("text-foreground");
      expect(picture?.getAttribute("data-slot")).toBe("project-logo-picture");
      expect(image.getAttribute("data-slot")).toBe("project-logo");
      expect(image.getAttribute("src")).toBe(project.logoLight);
      expect(darkSource?.getAttribute("media")).toBe("(prefers-color-scheme: dark)");
      expect(darkSource?.getAttribute("srcset")).toBe(project.logoDark);
      expect(image.getAttribute("width")).toBe("40");
      expect(image.getAttribute("height")).toBe("40");
      const media = image.closest('[data-slot="project-logo-media"]');
      expect(media?.className).toContain("size-10");
      expect(media?.className).toContain("mb-2");
      expect(media?.className).toContain("rounded-xl");
      expect(media?.className).toContain("bg-muted");
      expect(media?.className).toContain("[&_img]:object-contain");
      expect(content?.firstElementChild).toBe(media);
      expect(action.closest('[data-slot="card-content"]')).toBe(content);
      expect(action.getAttribute("href")).toBe(project.liveUrl);
      expect(action.getAttribute("target")).toBe("_blank");
      expect(action.className).toContain("button-target");
      expect(action.className).not.toContain("w-full");
      expect(action.className).toContain("border-border");
      expect(action.className).toContain("bg-transparent");
      expect(action.className).not.toContain("bg-primary");
      const actionIcon = action.querySelector('[data-lucide="open-app-link"]');
      expect(actionIcon).not.toBeNull();
      expect(actionIcon?.getAttribute("data-icon")).toBe("inline-end");
      expect(actionIcon?.getAttribute("aria-hidden")).toBe("true");
      expect(action.lastElementChild).toBe(actionIcon);
      expect(action.textContent).toBe("Open app");
    }

    expect(container.innerHTML).not.toContain("gradient");
    expect(container.innerHTML).not.toContain("drop-shadow");
    expect(container.innerHTML).not.toContain("page-atmosphere");
  });

  it("keeps the single profile badge and project actions keyboard reachable", () => {
    renderPortfolioHome();

    const profileBadge = screen.getByRole("link", {
      name: `${PORTFOLIO_BADGE_LABEL} (opens in a new tab)`,
    });
    const projectLinks = portfolioProjects.map((project) =>
      screen.getByRole("link", {
        name: `Open ${project.name} app (opens in a new tab)`,
      }),
    );

    for (const target of [profileBadge, ...projectLinks]) {
      expect(target.tabIndex).toBe(0);
      expect(target.className).toContain("focus-visible:ring-focus-ring");
    }
    expect(profileBadge.className).toContain("focus-visible:ring-[3px]");
    for (const link of projectLinks) {
      expect(link.className).toContain("focus-visible:ring-3");
      expect(link.className).toContain("button-target");
      expect(link.className).toContain("border-border");
      expect(link.className).not.toContain("bg-primary");
    }
    expect(profileBadge.className).toContain("expanded-control-target");
    expect(document.querySelector('[data-slot="profile-links"]')).toBeNull();
  });
});

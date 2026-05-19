// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vite-plus/test";

import { PortfolioHome } from "@/components/portfolio-home";
import { portfolioProjects } from "@/content/projects";

describe("PortfolioHome", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the portfolio header and real project cards", () => {
    const { container } = render(<PortfolioHome />);
    const title = screen.getByRole("heading", { level: 1, name: "Doga Fincan" });
    const appHeader = title.closest("header");
    const appLogo = container.querySelector('[data-slot="app-logo"]');
    const appLogoImage = container.querySelector('[data-slot="app-logo-image"]');
    const appTitleBlock = title.parentElement;
    const appSubtitle = appTitleBlock?.querySelector("p");

    expect(appHeader?.className).toBe(
      "flex flex-col items-center gap-4 text-center text-foreground",
    );
    expect(appTitleBlock?.className).toBe("flex min-w-0 flex-col gap-2");
    expect(title.className).toBe("text-balance text-4xl leading-tight font-bold tracking-tight");
    expect(appSubtitle?.className).toBe(
      "max-w-[40rem] text-balance text-lg font-medium md:max-w-full",
    );
    expect(appLogo?.className).toBe("relative size-15 shrink-0 overflow-hidden");
    expect(appLogoImage?.getAttribute("src")).toBe("/app-logo-120.png");
    expect(appLogoImage?.getAttribute("srcset")).toBe(
      "/app-logo-120.png 120w, /apple-touch-icon.png 180w",
    );
    expect(screen.queryByText("hello world")).toBeNull();
    expect(portfolioProjects.map((project) => project.slug)).not.toContain("portfolio");
    expect(screen.queryByRole("heading", { level: 3, name: "Portfolio" })).toBeNull();

    for (const project of portfolioProjects) {
      expect(screen.getByRole("heading", { level: 3, name: project.name })).toBeTruthy();
      expect(screen.getByText(project.summary)).toBeTruthy();
      expect(screen.queryByLabelText(`View ${project.name} source`)).toBeNull();

      const image = screen.getByAltText(project.imageAlt);
      expect(image.getAttribute("src")).toBe(project.image);
      expect(image.getAttribute("width")).toBe("1200");
      expect(image.getAttribute("height")).toBe("630");

      if (project.liveUrl) {
        expect(screen.getByLabelText(`Open ${project.name}`).getAttribute("href")).toBe(
          project.liveUrl,
        );
      }
    }
  });

  it("keeps project metadata inside cards and compact muted items", () => {
    const { container } = render(<PortfolioHome />);
    const projectsSection = screen.getByRole("region", { name: "Projects" });
    const projectCards = Array.from(projectsSection.querySelectorAll('[data-slot="card"]'));

    expect(projectCards.length).toBe(portfolioProjects.length);
    expect(projectsSection.getAttribute("data-slot")).toBe("portfolio-workbench");
    expect(projectsSection.className).toBe(
      "grid w-full min-w-0 max-w-full flex-1 grid-cols-[minmax(0,1fr)] items-start gap-6 rounded-[2.75rem] border border-transparent bg-muted p-3 sm:rounded-[3rem] sm:p-6 lg:grid-cols-[22rem_minmax(0,1fr)] dark:border-border dark:bg-background",
    );
    expect(projectsSection.firstElementChild?.className).toBe(
      "grid gap-4 lg:col-span-2 lg:grid-cols-2",
    );
    expect(screen.queryByRole("heading", { level: 2, name: "Projects" })).toBeNull();
    expect(screen.queryByRole("heading", { level: 2, name: "Build Principles" })).toBeNull();
    expect(
      screen.queryByText("Real project surfaces come first here:", { exact: false }),
    ).toBeNull();
    expect(container.querySelector("#principles")).toBeNull();
    expect(projectsSection.nextElementSibling).toBeNull();
    expect(
      screen.queryByText("Built with the same TanStack Start, Vite+", { exact: false }),
    ).toBeNull();
    expect(screen.queryByRole("link", { name: "GitHub" })).toBeNull();
    expect(screen.queryByText("Source")).toBeNull();

    for (const projectCard of projectCards) {
      const stackItem = within(projectCard as HTMLElement)
        .getByText("Stack")
        .closest('[data-slot="item"]');
      const nestedCards = projectCard.querySelectorAll('[data-slot="card"]');

      expect(stackItem?.getAttribute("data-variant")).toBe("muted");
      expect(stackItem?.querySelector('[data-lucide="project-stack"]')).toBeTruthy();
      expect(nestedCards.length).toBe(0);
    }

    expect(container.querySelectorAll("[data-lucide]").length).toBeGreaterThan(0);
  });
});

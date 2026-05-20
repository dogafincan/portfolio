// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
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
    const socialLinks = container.querySelector('[data-slot="profile-links"]');
    const xLink = screen.getByRole("link", { name: "Open Doga Fincan on X" });
    const githubLink = screen.getByRole("link", { name: "Open Doga Fincan on GitHub" });
    const workbench = container.querySelector('[data-slot="portfolio-workbench"]');

    expect(appHeader?.className).toBe(
      "flex flex-col items-center gap-4 text-center text-slate-950",
    );
    expect(appTitleBlock?.className).toBe("flex min-w-0 flex-col gap-2");
    expect(title.className).toBe("text-balance text-4xl leading-tight font-bold tracking-tight");
    expect(appSubtitle?.className).toBe(
      "max-w-[40rem] text-balance text-lg font-medium text-slate-900/80 md:max-w-full",
    );
    expect(appSubtitle?.textContent).toBe(
      "I'm into learning languages, nutrition and exercise, and building cool things. Reach out if you're building something interesting.",
    );
    expect(appSubtitle?.querySelector("span:first-child")?.textContent).toBe(
      "I'm into learning languages, nutrition and exercise, and building cool things.",
    );
    expect(appSubtitle?.querySelector("span:last-child")?.className).toBe("md:block");
    expect(appSubtitle?.querySelector("span:last-child")?.textContent).toBe(
      "Reach out if you're building something interesting.",
    );
    expect(socialLinks?.className).toBe("flex items-center justify-center gap-2 text-slate-950");
    expect(socialLinks?.previousElementSibling).toBe(appTitleBlock);
    expect(socialLinks?.parentElement).toBe(appHeader);
    expect(workbench?.previousElementSibling).toBe(appHeader);
    expect(xLink.getAttribute("href")).toBe("https://x.com/dogafincan");
    expect(xLink.getAttribute("target")).toBe("_blank");
    expect(xLink.getAttribute("rel")).toBe("noreferrer");
    expect(githubLink.getAttribute("href")).toBe("https://github.com/dogafincan");
    expect(githubLink.getAttribute("target")).toBe("_blank");
    expect(githubLink.getAttribute("rel")).toBe("noreferrer");
    for (const link of [xLink, githubLink]) {
      expect(link.className).toBe(
        "inline-flex size-11 items-center justify-center rounded-full text-slate-950 transition-colors hover:bg-slate-950/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950/30",
      );
    }
    expect(socialLinks?.querySelectorAll("svg").length).toBe(2);
    expect(appLogo?.className).toBe("relative size-15 shrink-0 overflow-hidden");
    expect(appLogoImage?.getAttribute("src")).toBe("/app-logo-120.png");
    expect(appLogoImage?.getAttribute("srcset")).toBe(
      "/app-logo-120.png 120w, /apple-touch-icon.png 180w",
    );
    expect(screen.queryByText("hello world")).toBeNull();
    expect(portfolioProjects.map((project) => project.slug)).not.toContain("portfolio");
    expect(portfolioProjects.map((project) => project.slug)).toEqual([
      "sui-airdrop",
      "sui-snapshot",
    ]);
    expect(
      screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent),
    ).toEqual(["Sui Airdrop", "Sui Snapshot"]);
    expect(screen.queryByRole("heading", { level: 3, name: "Portfolio" })).toBeNull();

    for (const project of portfolioProjects) {
      expect(screen.getByRole("heading", { level: 3, name: project.name })).toBeTruthy();
      expect(screen.getByText(project.subtitle)).toBeTruthy();
      expect(screen.queryByLabelText(`View ${project.name} source`)).toBeNull();

      const iconPanel = container.querySelector(
        `[data-slot="project-icon-panel"][data-project="${project.slug}"]`,
      );
      const icon = screen.getByAltText(project.iconAlt);
      expect(iconPanel?.className).toBe(
        "flex min-h-32 w-full items-center justify-center overflow-hidden rounded-[2rem] p-6 sm:min-h-36",
      );
      expect(iconPanel?.firstElementChild).toBe(icon);
      expect(icon.getAttribute("data-slot")).toBe("project-icon");
      expect(icon.getAttribute("src")).toBe(project.icon);
      expect(icon.getAttribute("width")).toBe("60");
      expect(icon.getAttribute("height")).toBe("60");
      expect(icon.className).toBe(
        "size-15 rounded-[1.125rem] shadow-[0_1rem_2.5rem_rgb(15_23_42/0.14)]",
      );

      expect(screen.getByLabelText(`Open ${project.name} app`).getAttribute("href")).toBe(
        project.liveUrl,
      );
      expect(screen.getByLabelText(`Open ${project.name} app`).getAttribute("target")).toBe(
        "_blank",
      );
    }
  });

  it("keeps project cards limited to icon, title, subtitle, and app link", () => {
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
    expect(screen.queryByLabelText("View Sui Airdrop source")).toBeNull();
    expect(screen.queryByLabelText("View Sui Snapshot source")).toBeNull();
    expect(screen.queryByText("Source")).toBeNull();
    expect(screen.queryByText("Live utility")).toBeNull();
    expect(screen.queryByText("Stack")).toBeNull();
    expect(screen.queryByText("Product design,", { exact: false })).toBeNull();
    expect(screen.queryByText("TanStack Start", { exact: false })).toBeNull();
    expect(screen.queryByText("CSV cleanup before", { exact: false })).toBeNull();
    expect(screen.queryByText("Worker-safe snapshot", { exact: false })).toBeNull();
    expect(container.querySelectorAll('[data-slot="project-icon"]').length).toBe(
      portfolioProjects.length,
    );
    expect(container.querySelectorAll('[data-slot="project-icon-panel"]').length).toBe(
      portfolioProjects.length,
    );
    expect(container.querySelector('[data-slot="project-icon-panel"][style]')).toBeNull();
    expect(screen.getAllByRole("link", { name: /Open .* app/ }).length).toBe(
      portfolioProjects.length,
    );
    expect(container.querySelectorAll('[data-icon="inline-start"]').length).toBe(
      portfolioProjects.length,
    );
  });
});

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
    const main = container.querySelector("main");
    const appHeader = title.closest("header");
    const appLogo = container.querySelector('[data-slot="app-logo"]');
    const appLogoImage = container.querySelector('[data-slot="app-logo-image"]');
    const appTitleBlock = title.parentElement;
    const appSubtitle = appTitleBlock?.querySelector("p");
    const socialLinks = container.querySelector('[data-slot="profile-links"]');
    const xLink = screen.getByRole("link", { name: "Open Doga Fincan on X" });
    const githubLink = screen.getByRole("link", { name: "Open Doga Fincan on GitHub" });
    const workbench = container.querySelector('[data-slot="portfolio-workbench"]');

    expect(main?.className).toBe(
      "app-shell relative z-10 mx-auto flex min-h-screen w-full min-w-0 max-w-full flex-col gap-8 px-3 py-10 text-foreground sm:max-w-6xl sm:px-6 lg:px-8",
    );
    expect(main?.firstElementChild).toBe(appHeader);
    expect(appHeader?.parentElement).toBe(main);
    expect(appHeader?.className).toBe("flex flex-col items-center gap-4 text-center text-white");
    expect(appTitleBlock?.className).toBe("flex min-w-0 flex-col gap-2");
    expect(title.className).toBe(
      "text-balance text-4xl leading-tight font-bold tracking-tight text-white",
    );
    expect(appSubtitle).toBeNull();
    expect(appHeader?.textContent).not.toContain("I'm into learning languages");
    expect(socialLinks?.className).toBe(
      "flex -mt-[0.9375rem] -mb-[0.9375rem] items-center justify-center gap-2 text-white",
    );
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
        "inline-flex size-[3.4375rem] items-center justify-center rounded-full text-white hover:bg-white/12 transition-colors focus-visible:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-white/45",
      );
    }
    expect(socialLinks?.querySelectorAll("svg").length).toBe(2);
    for (const icon of socialLinks?.querySelectorAll("svg") ?? []) {
      expect(icon.className.baseVal).toBe("size-[1.5625rem]");
    }
    expect(appLogo?.className).toBe(
      "relative size-15 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-white",
    );
    expect(appLogo?.className).not.toContain("rounded-full");
    expect(appLogoImage?.getAttribute("src")).toBe("/app-logo-120.png");
    expect(appLogoImage?.getAttribute("srcset")).toBe(
      "/app-logo-120.png 120w, /apple-touch-icon.png 180w",
    );
    expect(screen.queryByText("hello world")).toBeNull();
    expect(portfolioProjects.map((project) => project.slug)).not.toContain("portfolio");
    expect(portfolioProjects.map((project) => project.slug)).toEqual([
      "sui-swap",
      "sui-airdrop",
      "sui-snapshot",
    ]);
    expect(
      screen.getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent),
    ).toEqual(["Sui Swap", "Sui Airdrop", "Sui Snapshot"]);
    expect(screen.queryByRole("heading", { level: 3, name: "Portfolio" })).toBeNull();

    for (const project of portfolioProjects) {
      expect(screen.getByRole("heading", { level: 3, name: project.name })).toBeTruthy();
      expect(screen.getByText(project.subtitle)).toBeTruthy();
      expect(screen.queryByLabelText(`View ${project.name} source`)).toBeNull();

      const summaryItem = container.querySelector(
        `[data-slot="project-summary-item"][data-project="${project.slug}"]`,
      );
      const icon = screen.getByAltText(project.iconAlt);
      const iconMedia = summaryItem?.querySelector('[data-slot="item-media"]');
      const itemContent = summaryItem?.querySelector('[data-slot="item-content"]');
      const itemTitle = summaryItem?.querySelector('[data-slot="item-title"]');
      const itemDescription = summaryItem?.querySelector('[data-slot="item-description"]');
      expect(summaryItem?.className).toBe(
        "group/item flex w-full items-center rounded-2xl border text-sm transition-colors duration-100 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [a]:transition-colors [a]:hover:bg-muted border-transparent bg-muted/50 gap-3.5 px-4 py-3.5 min-h-32 flex-nowrap overflow-hidden sm:min-h-36",
      );
      expect(iconMedia?.className).toBe(
        "flex shrink-0 items-center justify-center gap-2 self-center [&_svg]:pointer-events-none [&_svg]:text-current size-[2.8125rem] overflow-hidden rounded-[0.875rem] border border-border bg-background",
      );
      expect(summaryItem?.firstElementChild).toBe(iconMedia);
      expect(iconMedia?.firstElementChild).toBe(icon);
      expect(iconMedia?.nextElementSibling).toBe(itemContent);
      expect(itemContent?.contains(itemTitle ?? null)).toBe(true);
      expect(itemContent?.contains(itemDescription ?? null)).toBe(true);
      expect(itemTitle?.querySelector("h3")?.textContent).toBe(project.name);
      expect(itemDescription?.textContent).toBe(project.subtitle);
      expect(summaryItem?.querySelector('[data-slot="card-title"]')).toBeNull();
      expect(summaryItem?.querySelector('[data-slot="card-description"]')).toBeNull();
      expect(icon.getAttribute("data-slot")).toBe("project-icon");
      expect(icon.getAttribute("src")).toBe(project.icon);
      expect(icon.getAttribute("width")).toBe("45");
      expect(icon.getAttribute("height")).toBe("45");
      expect(icon.className).toBe("size-full object-cover");

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
    expect(screen.queryByLabelText("View Sui Swap source")).toBeNull();
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
    expect(container.querySelectorAll('[data-slot="project-summary-item"]').length).toBe(
      portfolioProjects.length,
    );
    expect(container.querySelector('[data-slot="project-summary-item"][style]')).toBeNull();
    expect(
      container.querySelector('[data-slot="project-summary-item"].bg-muted\\/50'),
    ).toBeTruthy();
    expect(
      container.querySelector(
        '[data-slot="item-media"].shadow-\\[0_1rem_2\\.5rem_rgb\\(15_23_42\\/0\\.14\\)\\]',
      ),
    ).toBeNull();
    expect(container.querySelectorAll('[data-slot="card-title"]').length).toBe(0);
    expect(container.querySelectorAll('[data-slot="card-description"]').length).toBe(0);
    expect(screen.getAllByRole("link", { name: /Open .* app/ }).length).toBe(
      portfolioProjects.length,
    );
    expect(container.querySelectorAll('[data-icon="inline-start"]').length).toBe(
      portfolioProjects.length,
    );
  });

  it("keeps profile and app actions in the keyboard tab order", () => {
    render(<PortfolioHome />);

    const expectedKeyboardTargets = [
      "Open Doga Fincan on X",
      "Open Doga Fincan on GitHub",
      ...portfolioProjects.map((project) => `Open ${project.name} app`),
    ];

    const keyboardTargets = screen.getAllByRole("link").filter((link) => {
      const label = link.getAttribute("aria-label");
      return label !== null && expectedKeyboardTargets.includes(label);
    });

    expect(keyboardTargets.map((link) => link.getAttribute("aria-label"))).toEqual(
      expectedKeyboardTargets,
    );

    for (const target of keyboardTargets) {
      expect(target.tabIndex).toBe(0);
      expect(target.className).toContain("transition-colors");
      expect(target.className).toContain("focus-visible:transition-none");
      expect(target.className).toContain("focus-visible:outline-none");
      expect(target.className).toContain("focus-visible:ring-2");
      expect(target.className).toContain("focus-visible:ring-slate-950/40");
      expect(target.className).toContain("focus-visible:ring-offset-2");
      expect(target.className).toContain("focus-visible:ring-offset-background");
      expect(target.className).not.toContain("focus-visible:outline-4");
      expect(target.className).not.toContain("focus-visible:outline-sky-700");
    }
  });
});

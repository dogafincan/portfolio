import {
  PortfolioPageHeader,
  PortfolioPageShell,
  PORTFOLIO_MAIN_CLASS_NAME,
} from "@/components/app-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { portfolioProjects, type PortfolioProject } from "@/content/projects";
import { PORTFOLIO_PAGE_SUBTITLE, PORTFOLIO_PAGE_TITLE_ACCENT } from "@/lib/portfolio-page-copy";

const PROFILE_LINK_CLASS_NAME =
  "control-target inline-flex size-11 items-center justify-center rounded-full border border-transparent bg-control-info text-control-info-foreground outline-none transition-colors hover:bg-control-info-hover active:bg-control-info-active focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-focus-ring";

function XLogoIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="currentColor"
      focusable="false"
      viewBox="0 0 24 24"
    >
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.51 11.24h-6.66l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z" />
    </svg>
  );
}

function GitHubLogoIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="currentColor"
      focusable="false"
      viewBox="0 0 24 24"
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.29 9.43 7.86 10.96.58.1.79-.25.79-.56v-2.14c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.69 1.25 3.34.96.1-.75.4-1.25.73-1.54-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.47.11-3.06 0 0 .97-.31 3.16 1.18.92-.26 1.9-.38 2.88-.39.98 0 1.96.13 2.88.39 2.2-1.49 3.16-1.18 3.16-1.18.62 1.59.23 2.77.11 3.06.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.4-5.27 5.69.42.36.78 1.07.78 2.16v3.2c0 .31.21.67.8.56A11.52 11.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function ProjectCard({
  project,
  loading = "lazy",
}: {
  project: PortfolioProject;
  loading?: "eager" | "lazy";
}) {
  return (
    <Card className="h-full min-w-0">
      <CardContent>
        <Item className="min-w-0 flex-nowrap" data-project={project.slug} variant="muted">
          <ItemMedia
            className="size-12 overflow-hidden rounded-xl border border-border bg-background"
            variant="image"
          >
            <img
              alt={project.iconAlt}
              className="size-full object-cover"
              data-slot="project-icon"
              decoding="async"
              height="48"
              loading={loading}
              src={project.icon}
              width="48"
            />
          </ItemMedia>
          <ItemContent className="min-w-0">
            <ItemTitle className="line-clamp-none">
              <h2>{project.name}</h2>
            </ItemTitle>
            <ItemDescription>{project.subtitle}</ItemDescription>
          </ItemContent>
        </Item>
      </CardContent>
      <CardFooter>
        <a
          aria-label={`Open ${project.name} app`}
          className={buttonVariants({ className: "w-full" })}
          href={project.liveUrl}
          rel="noreferrer"
          target="_blank"
        >
          Open app
        </a>
      </CardFooter>
    </Card>
  );
}

export function PortfolioHome() {
  return (
    <PortfolioPageShell>
      <main className={PORTFOLIO_MAIN_CLASS_NAME}>
        <PortfolioPageHeader
          title={
            <>
              Explore the useful products{" "}
              <span className="text-page-title-accent">{PORTFOLIO_PAGE_TITLE_ACCENT}</span>
            </>
          }
          subtitle={PORTFOLIO_PAGE_SUBTITLE}
        >
          <nav
            aria-label="Doga Fincan social profiles"
            className="mt-2 flex items-center justify-center gap-2"
            data-slot="profile-links"
          >
            <a
              aria-label="Open Doga Fincan on X"
              className={PROFILE_LINK_CLASS_NAME}
              href="https://x.com/dogafincan"
              rel="noreferrer"
              target="_blank"
              title="X"
            >
              <XLogoIcon />
            </a>
            <a
              aria-label="Open Doga Fincan on GitHub"
              className={PROFILE_LINK_CLASS_NAME}
              href="https://github.com/dogafincan"
              rel="noreferrer"
              target="_blank"
              title="GitHub"
            >
              <GitHubLogoIcon />
            </a>
          </nav>
        </PortfolioPageHeader>

        <section
          aria-label="Projects"
          className="grid w-full min-w-0 items-stretch gap-6 lg:grid-cols-2"
          data-slot="portfolio-workbench"
          id="projects"
        >
          {portfolioProjects.map((project, index) => (
            <ProjectCard
              key={project.slug}
              loading={index === 0 ? "eager" : "lazy"}
              project={project}
            />
          ))}
        </section>
      </main>
    </PortfolioPageShell>
  );
}

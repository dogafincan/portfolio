import {
  PortfolioPageHeader,
  PortfolioPageShell,
  PORTFOLIO_MAIN_CLASS_NAME,
} from "@/components/app-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { portfolioProjects, type PortfolioProject } from "@/content/projects";
import { PORTFOLIO_PAGE_SUBTITLE, PORTFOLIO_PAGE_TITLE_ACCENT } from "@/lib/portfolio-page-copy";
import { ArrowUpRight } from "lucide-react";

function ProjectCard({
  project,
  loading = "lazy",
}: {
  project: PortfolioProject;
  loading?: "eager" | "lazy";
}) {
  return (
    <Card className="min-w-0 gap-0 py-0" data-layout="centered-action" data-project={project.slug}>
      <CardContent className="items-center gap-4 py-10 text-center">
        <div
          className="mb-2 flex size-10 overflow-hidden rounded-xl bg-muted [&_img]:object-contain"
          data-slot="project-logo-media"
        >
          <picture className="block size-full" data-slot="project-logo-picture">
            <source media="(prefers-color-scheme: dark)" srcSet={project.logoDark} />
            <img
              alt={project.logoAlt}
              className="size-full"
              data-slot="project-logo"
              decoding="async"
              height="40"
              loading={loading}
              src={project.logoLight}
              width="40"
            />
          </picture>
        </div>
        <div className="flex max-w-sm flex-col items-center gap-2" data-slot="project-copy">
          <CardTitle>
            <h2>{project.name}</h2>
          </CardTitle>
          <CardDescription className="text-pretty">{project.subtitle}</CardDescription>
        </div>
        <a
          aria-label={`Open ${project.name} app (opens in a new tab)`}
          className={buttonVariants({ variant: "outline" })}
          href={project.liveUrl}
          rel="noreferrer"
          target="_blank"
        >
          Open app
          <ArrowUpRight aria-hidden="true" data-icon="inline-end" data-lucide="open-app-link" />
        </a>
      </CardContent>
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
        />

        <section
          aria-label="Projects"
          className="grid w-full min-w-0 items-start gap-6 lg:grid-cols-2"
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

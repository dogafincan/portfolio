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

function ProjectCard({
  project,
  loading = "lazy",
}: {
  project: PortfolioProject;
  loading?: "eager" | "lazy";
}) {
  return (
    <Card className="min-w-0">
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
          className={buttonVariants({ className: "w-full", variant: "outline" })}
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

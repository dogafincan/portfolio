import { ArrowUpRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { portfolioProjects, type PortfolioProject } from "@/content/projects";
import { cn } from "@/lib/utils";

const HEADER_LOGO = "/app-logo-120.png";
const HEADER_LOGO_SRCSET = "/app-logo-120.png 120w, /apple-touch-icon.png 180w";
const WORKBENCH_CONTAINER_CLASS_NAME =
  "grid w-full min-w-0 max-w-full flex-1 grid-cols-[minmax(0,1fr)] items-start gap-6 rounded-[2.75rem] border border-transparent bg-muted p-3 sm:rounded-[3rem] sm:p-6 lg:grid-cols-[22rem_minmax(0,1fr)] dark:border-border dark:bg-background";
const PROJECT_ICON_PANEL_CLASS_NAME =
  "flex min-h-32 w-full items-center justify-center overflow-hidden rounded-[2rem] p-6 sm:min-h-36";

function ProjectCard({
  project,
  loading = "lazy",
}: {
  project: PortfolioProject;
  loading?: "eager" | "lazy";
}) {
  return (
    <Card className="min-w-0">
      <CardHeader className="gap-4">
        <div
          data-slot="project-icon-panel"
          data-project={project.slug}
          className={PROJECT_ICON_PANEL_CLASS_NAME}
        >
          <img
            data-slot="project-icon"
            src={project.icon}
            alt={project.iconAlt}
            width="60"
            height="60"
            loading={loading}
            decoding="async"
            className="size-15 rounded-[1.125rem] shadow-[0_1rem_2.5rem_rgb(15_23_42/0.14)]"
          />
        </div>
        <CardTitle>
          <h3 className="m-0">{project.name}</h3>
        </CardTitle>
        <CardDescription>{project.subtitle}</CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto flex flex-wrap gap-2">
        <a
          className={cn(buttonVariants({ variant: "default", size: "sm" }))}
          href={project.liveUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${project.name} app`}
        >
          <ArrowUpRight aria-hidden="true" data-icon="inline-start" />
          Open app
        </a>
      </CardFooter>
    </Card>
  );
}

export function PortfolioHome() {
  return (
    <main className="min-h-screen px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 py-8 sm:py-10">
        <header className="flex flex-col items-center gap-4 text-center text-slate-950">
          <div data-slot="app-logo" className="relative size-15 shrink-0 overflow-hidden">
            <img
              data-slot="app-logo-image"
              src={HEADER_LOGO}
              srcSet={HEADER_LOGO_SRCSET}
              sizes="60px"
              width="60"
              height="60"
              loading="eager"
              decoding="async"
              alt=""
              className="size-full"
            />
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <h1 className="text-balance text-4xl leading-tight font-bold tracking-tight">
              Doga Fincan
            </h1>
            <p className="max-w-[40rem] text-balance text-lg font-medium text-slate-900/80 md:max-w-full">
              <span>
                I'm into learning languages, nutrition and exercise, and building cool things.
              </span>{" "}
              <span className="md:block">Reach out if you're building something interesting.</span>
            </p>
          </div>
        </header>

        <section
          id="projects"
          data-slot="portfolio-workbench"
          aria-label="Projects"
          className={WORKBENCH_CONTAINER_CLASS_NAME}
        >
          <div className="grid gap-4 lg:col-span-2 lg:grid-cols-2">
            {portfolioProjects.map((project, index) => (
              <ProjectCard
                key={project.slug}
                project={project}
                loading={index === 0 ? "eager" : "lazy"}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

import { ArrowUpRight, Code2, Layers3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { portfolioPrinciples, portfolioProjects, type PortfolioProject } from "@/content/projects";
import { cn } from "@/lib/utils";

const HEADER_LOGO = "/app-logo-120.png";
const HEADER_LOGO_SRCSET = "/app-logo-120.png 120w, /apple-touch-icon.png 180w";
const WORKBENCH_CONTAINER_CLASS_NAME =
  "grid w-full min-w-0 max-w-full flex-1 grid-cols-[minmax(0,1fr)] items-start gap-6 rounded-[2.75rem] border border-transparent bg-muted p-3 sm:rounded-[3rem] sm:p-6 lg:grid-cols-[22rem_minmax(0,1fr)] dark:border-border dark:bg-background";

function ProjectCard({
  project,
  loading = "lazy",
}: {
  project: PortfolioProject;
  loading?: "eager" | "lazy";
}) {
  return (
    <Card className="min-w-0">
      <img
        src={project.image}
        alt={project.imageAlt}
        width="1200"
        height="630"
        loading={loading}
        decoding="async"
        className="aspect-[1200/630] w-full bg-muted object-cover"
      />
      <CardHeader>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge variant={project.status === "Live utility" ? "default" : "secondary"}>
            {project.status}
          </Badge>
          <span className="text-sm font-medium text-muted-foreground">{project.role}</span>
        </div>
        <CardTitle>
          <h3 className="m-0">{project.name}</h3>
        </CardTitle>
        <CardDescription>{project.summary}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-5">
        <Item variant="muted">
          <ItemMedia variant="icon" className="text-muted-foreground">
            <Layers3 aria-hidden="true" data-lucide="project-stack" />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Stack</ItemTitle>
            <ItemDescription>{project.stack.join(", ")}</ItemDescription>
          </ItemContent>
        </Item>

        <ul className="grid gap-2 text-base text-muted-foreground">
          {project.highlights.map((highlight) => (
            <li key={highlight} className="flex gap-2">
              <span className="mt-[0.72rem] size-1.5 shrink-0 rounded-full bg-primary/70" />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="mt-auto flex flex-wrap gap-2">
        {project.liveUrl ? (
          <a
            className={cn(buttonVariants({ variant: "default", size: "sm" }))}
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${project.name}`}
          >
            <ArrowUpRight aria-hidden="true" data-icon="inline-start" />
            Open
          </a>
        ) : null}
        <a
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          href={project.sourceUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={`View ${project.name} source`}
        >
          <Code2 aria-hidden="true" data-icon="inline-start" />
          Source
        </a>
      </CardFooter>
    </Card>
  );
}

export function PortfolioHome() {
  return (
    <main className="min-h-screen px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 py-8 sm:py-10">
        <header className="flex flex-col items-center gap-4 text-center text-foreground">
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
            <h1 className="text-4xl font-semibold tracking-normal text-balance sm:text-5xl">
              Doga Fincan
            </h1>
            <p className="max-w-[43rem] text-balance text-lg font-medium md:max-w-full">
              Focused web utilities and product systems built with React, Cloudflare, and careful
              user-facing workflows.
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

        <section id="principles" aria-labelledby="principles-heading" className="grid gap-4">
          <div className="flex flex-col gap-2">
            <h2 id="principles-heading" className="text-2xl font-semibold tracking-normal">
              Build Principles
            </h2>
            <p className="max-w-3xl text-base text-muted-foreground">
              These are the durable patterns imported from the sibling Sui apps: useful surfaces,
              clear state ownership, and code organization that stays portable.
            </p>
          </div>

          <ItemGroup className="grid gap-3 md:grid-cols-2">
            {portfolioPrinciples.map(({ title, description, Icon }) => (
              <Item key={title} variant="muted" className="items-start">
                <ItemMedia variant="icon" className="mt-0.5 text-muted-foreground">
                  <Icon aria-hidden="true" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{title}</ItemTitle>
                  <ItemDescription>{description}</ItemDescription>
                </ItemContent>
              </Item>
            ))}
          </ItemGroup>
        </section>

        <footer className="flex flex-col gap-3 border-t pt-6 text-base text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>Built with the same TanStack Start, Vite+, Tailwind, and Cloudflare stack.</span>
          <a
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-fit")}
            href="https://github.com/dogafincan"
            target="_blank"
            rel="noreferrer"
          >
            <Code2 aria-hidden="true" data-icon="inline-start" />
            GitHub
          </a>
        </footer>
      </div>
    </main>
  );
}

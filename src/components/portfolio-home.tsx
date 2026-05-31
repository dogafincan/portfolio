import { ArrowUpRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { portfolioProjects, type PortfolioProject } from "@/content/projects";
import { cn } from "@/lib/utils";

const HEADER_LOGO = "/app-logo-120.png";
const HEADER_LOGO_SRCSET = "/app-logo-120.png 120w, /apple-touch-icon.png 180w";
const PORTFOLIO_MAIN_CLASS_NAME =
  "relative z-10 flex min-h-screen flex-col px-4 py-6 text-foreground sm:px-6 lg:justify-center lg:px-8";
const WORKBENCH_CONTAINER_CLASS_NAME =
  "grid w-full min-w-0 max-w-full flex-1 grid-cols-[minmax(0,1fr)] items-start gap-6 rounded-[2.75rem] border border-transparent bg-muted p-3 sm:rounded-[3rem] sm:p-6 lg:grid-cols-[22rem_minmax(0,1fr)] dark:border-border dark:bg-background";
const PROJECT_SUMMARY_ITEM_CLASS_NAME = "min-h-32 flex-nowrap overflow-hidden sm:min-h-36";
const PROJECT_ICON_MEDIA_CLASS_NAME =
  "size-[2.8125rem] overflow-hidden rounded-[0.875rem] border border-border bg-background";
const KEYBOARD_ACTION_FOCUS_CLASS_NAME =
  "transition-colors focus-visible:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:focus-visible:ring-white/45";
const PROFILE_LINK_CLASS_NAME =
  "inline-flex size-[3.4375rem] items-center justify-center rounded-full text-white transition-colors hover:bg-white/12";

function XLogoIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      className="size-[1.5625rem]"
      fill="currentColor"
    >
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.51 11.24h-6.66l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z" />
    </svg>
  );
}

function GitHubLogoIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      className="size-[1.5625rem]"
      fill="currentColor"
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
    <Card className="min-w-0">
      <CardHeader className="gap-4">
        <Item
          variant="muted"
          data-slot="project-summary-item"
          data-project={project.slug}
          className={PROJECT_SUMMARY_ITEM_CLASS_NAME}
        >
          <ItemMedia className={PROJECT_ICON_MEDIA_CLASS_NAME}>
            <img
              data-slot="project-icon"
              src={project.icon}
              alt={project.iconAlt}
              width="45"
              height="45"
              loading={loading}
              decoding="async"
              className="size-full object-cover"
            />
          </ItemMedia>
          <ItemContent className="min-w-0">
            <ItemTitle>
              <h3 className="m-0">{project.name}</h3>
            </ItemTitle>
            <ItemDescription>{project.subtitle}</ItemDescription>
          </ItemContent>
        </Item>
      </CardHeader>
      <CardFooter className="mt-auto flex flex-wrap gap-2">
        <a
          className={cn(
            buttonVariants({ variant: "default", size: "sm" }),
            KEYBOARD_ACTION_FOCUS_CLASS_NAME,
          )}
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
    <main className={PORTFOLIO_MAIN_CLASS_NAME}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 py-8 sm:py-10">
        <header className="flex flex-col items-center gap-4 text-center text-white">
          <div
            data-slot="app-logo"
            className="relative size-15 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-white"
          >
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
            <p className="max-w-[40rem] text-balance text-lg font-medium text-white/82 md:max-w-full">
              <span>
                I'm into learning languages, nutrition and exercise, and building cool things.
              </span>{" "}
              <span className="md:block">Reach out if you're building something interesting.</span>
            </p>
          </div>
          <nav
            aria-label="Doga Fincan social profiles"
            data-slot="profile-links"
            className="flex items-center justify-center gap-2 text-white"
          >
            <a
              className={cn(PROFILE_LINK_CLASS_NAME, KEYBOARD_ACTION_FOCUS_CLASS_NAME)}
              href="https://x.com/dogafincan"
              target="_blank"
              rel="noreferrer"
              aria-label="Open Doga Fincan on X"
              title="X"
            >
              <XLogoIcon />
            </a>
            <a
              className={cn(PROFILE_LINK_CLASS_NAME, KEYBOARD_ACTION_FOCUS_CLASS_NAME)}
              href="https://github.com/dogafincan"
              target="_blank"
              rel="noreferrer"
              aria-label="Open Doga Fincan on GitHub"
              title="GitHub"
            >
              <GitHubLogoIcon />
            </a>
          </nav>
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

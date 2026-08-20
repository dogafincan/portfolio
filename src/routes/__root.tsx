import type { ReactNode } from "react";
import { HeadContent, Scripts, createRootRoute, useRouterState } from "@tanstack/react-router";

import { AppErrorBoundary, AppRecovery } from "../components/app-recovery";
import { AppProviders } from "@/components/app-providers";
import {
  PortfolioPageHeader,
  PortfolioPageShell,
  PORTFOLIO_MAIN_CLASS_NAME,
} from "@/components/app-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import geistLatinWghtNormal from "@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url";
import appCss from "../styles.css?url";

const APP_CHROME_COLOR = "#ffffff";
const APP_CHROME_COLOR_DARK = "#090909";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      {
        title: "Doga Fincan",
      },
    ],
    links: [
      {
        rel: "preload",
        href: geistLatinWghtNormal,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/x-icon",
        href: "/favicon.ico",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "manifest",
        href: "/manifest.json",
      },
    ],
  }),
  notFoundComponent: NotFoundPage,
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: ReactNode }) {
  const isStaticNotFoundDocument = useRouterState({
    select: (state) => state.location.pathname === "/404.html",
  });

  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content={APP_CHROME_COLOR} media="(prefers-color-scheme: light)" />
        <meta
          name="theme-color"
          content={APP_CHROME_COLOR_DARK}
          media="(prefers-color-scheme: dark)"
        />
        {isStaticNotFoundDocument ? <StaticNotFoundHead /> : <HeadContent />}
      </head>
      <body>
        <AppErrorBoundary>
          <AppProviders>{children}</AppProviders>
        </AppErrorBoundary>
        {isStaticNotFoundDocument ? null : (
          <>
            <AppRecovery />
            <Scripts />
          </>
        )}
      </body>
    </html>
  );
}

export function NotFoundPage() {
  return (
    <PortfolioPageShell>
      <main className={PORTFOLIO_MAIN_CLASS_NAME}>
        <PortfolioPageHeader
          title={
            <>
              This page isn’t in the <span className="text-page-title-accent">portfolio</span>
            </>
          }
          subtitle="The requested address does not match a page in this portfolio. Return home to explore the current projects and live applications."
        />

        <Card className="mx-auto w-full min-w-0 max-w-[45rem]">
          <CardHeader>
            <CardTitle role="heading" aria-level={2}>
              Page not found
            </CardTitle>
            <CardDescription>
              Check the address, or return to the project showcase. No wallet, Registry, or project
              data was requested for this page.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <a className={buttonVariants({ size: "lg" })} href="/">
              Back to Portfolio
            </a>
          </CardFooter>
        </Card>
      </main>
    </PortfolioPageShell>
  );
}

function StaticNotFoundHead() {
  return (
    <>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      <meta name="application-name" content="Doga Fincan" />
      <meta name="description" content="The requested page is not part of this portfolio." />
      <meta name="robots" content="noindex, nofollow" />
      <title>Page not found · Portfolio</title>
      <link
        rel="preload"
        href={geistLatinWghtNormal}
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <link rel="stylesheet" href={appCss} />
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="manifest" href="/manifest.json" />
    </>
  );
}

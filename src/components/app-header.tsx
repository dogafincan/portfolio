import type { ReactNode } from "react";

import { WalletControl } from "@/components/wallet-control";
import { buttonVariants } from "@/components/ui/button";
import { dojiTypography } from "@/lib/doji-ui";
import { cn } from "@/lib/utils";

const HEADER_LOGO_LIGHT = "/app-logo-120-navbar-light.png";
const HEADER_LOGO_DARK = "/app-logo-120-navbar-dark.png";
const HEADER_LOGO_LIGHT_SRCSET = "/app-logo-120-navbar-light.png 120w";

export const PORTFOLIO_APP_NAME = "Doga Fincan";
export const PORTFOLIO_MAIN_CLASS_NAME =
  "app-shell mx-auto flex w-full min-w-0 max-w-full flex-1 flex-col gap-8 sm:max-w-6xl lg:gap-12";

export function PortfolioPageShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("flex min-h-screen min-w-0 flex-col overscroll-none bg-background", className)}
      data-slot="portfolio-app-shell"
    >
      <PortfolioNavbar />
      {children}
      <PortfolioFooter />
    </div>
  );
}

export function PortfolioNavbar({ variant = "app" }: { variant?: "app" | "social" }) {
  if (variant === "social") {
    return (
      <header
        className="flex h-28 shrink-0 items-center border-b border-border bg-card text-card-foreground"
        data-slot="app-navbar"
        data-variant="social"
      >
        <div
          className="app-chrome-content mx-auto flex h-full w-full max-w-6xl items-center"
          data-slot="app-navbar-content-rail"
        >
          <a
            aria-label={`${PORTFOLIO_APP_NAME} home`}
            className="control-target ml-2 flex h-11 min-w-0 items-center gap-3 rounded-xl text-card-foreground outline-none"
            data-slot="app-navbar-brand"
            href="/"
          >
            <picture className="block shrink-0 leading-none">
              <source media="(prefers-color-scheme: dark)" srcSet={HEADER_LOGO_DARK} />
              <img
                alt=""
                className="size-20 translate-y-px"
                decoding="sync"
                data-slot="app-navbar-logo"
                height="80"
                sizes="80px"
                src={HEADER_LOGO_LIGHT}
                srcSet={HEADER_LOGO_LIGHT_SRCSET}
                width="80"
              />
            </picture>
            <span className="translate-y-px font-heading text-[40px] leading-[48px] font-semibold tracking-tight">
              {PORTFOLIO_APP_NAME}
            </span>
          </a>
        </div>
      </header>
    );
  }

  return (
    <header
      className="app-navbar sticky top-0 z-40 shrink-0 border-b border-border bg-card text-card-foreground"
      data-slot="app-navbar"
    >
      <nav
        aria-label={`${PORTFOLIO_APP_NAME} navigation`}
        className="app-chrome-content mx-auto flex min-h-14 w-full max-w-6xl items-center py-2 sm:py-0"
        data-slot="app-navbar-content-rail"
      >
        <a
          aria-label={`${PORTFOLIO_APP_NAME} home`}
          className="control-target flex h-11 min-w-0 items-center gap-0.5 rounded-xl text-card-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-focus-ring"
          data-slot="app-navbar-brand"
          href="/"
        >
          <picture className="block shrink-0 leading-none">
            <source media="(prefers-color-scheme: dark)" srcSet={HEADER_LOGO_DARK} />
            <img
              alt=""
              className="size-8 shrink-0 translate-y-px"
              data-slot="app-navbar-logo"
              decoding="async"
              height="32"
              loading="eager"
              sizes="32px"
              src={HEADER_LOGO_LIGHT}
              srcSet={HEADER_LOGO_LIGHT_SRCSET}
              width="32"
            />
          </picture>
          <span
            className="translate-y-px truncate font-heading text-xl leading-7 font-semibold tracking-tight"
            data-slot="app-navbar-title"
          >
            {PORTFOLIO_APP_NAME}
          </span>
        </a>
      </nav>
    </header>
  );
}

export function PortfolioFooter() {
  return (
    <footer className="app-footer flex shrink-0 border-t border-border bg-card text-card-foreground">
      <div className="app-chrome-content mx-auto flex w-full max-w-6xl items-center justify-center py-3 text-sm leading-5 text-quiet-foreground">
        <p className="text-balance text-center">
          Copyright Doga Fincan {new Date().getFullYear()}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export function PortfolioPageHeader({
  children,
  className,
  staticNotFoundDocument = false,
  subtitle,
  title,
  variant = "page",
  walletControl = <WalletControl />,
}: {
  children?: ReactNode;
  className?: string;
  staticNotFoundDocument?: boolean;
  subtitle?: ReactNode;
  title: ReactNode;
  variant?: "page" | "social";
  walletControl?: ReactNode;
}) {
  const social = variant === "social";
  return (
    <header
      className={cn(
        social
          ? "flex w-full max-w-[1000px] flex-col items-center gap-5 text-center"
          : "flex w-full min-w-0 flex-col items-center gap-4 text-center",
        className,
      )}
    >
      <div
        className={cn(
          "flex min-w-0 flex-col items-center",
          social ? "contents" : "w-full gap-2 px-6 xl:gap-4",
        )}
      >
        <h1
          className={cn(
            social ? "max-w-[900px]" : "max-w-4xl",
            social ? dojiTypography.socialTitle : dojiTypography.pageTitle,
          )}
          data-slot={social ? "app-header-title" : "page-title"}
        >
          {title}
        </h1>
        {subtitle ? (
          <p
            className={cn(
              "mx-auto",
              social ? "max-w-[860px]" : "max-w-4xl",
              social ? dojiTypography.socialSubtitle : dojiTypography.pageSubtitle,
            )}
            data-slot={social ? "app-header-subtitle" : "page-subtitle"}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      {!social ? (
        <div
          className="flex w-full max-w-sm flex-col items-stretch gap-2 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:justify-center sm:[&>*]:px-6 xl:mt-2"
          data-slot="app-header-actions"
        >
          {staticNotFoundDocument ? (
            <a className={buttonVariants()} href="/#connect-wallet">
              Connect wallet
            </a>
          ) : (
            walletControl
          )}
          <a className={cn(buttonVariants({ variant: "outline" }), "bg-card")} href="/submit">
            Submit project
          </a>
        </div>
      ) : null}
      {children}
    </header>
  );
}

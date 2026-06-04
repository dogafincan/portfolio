import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const HEADER_LOGO = "/app-logo-120.png";
const HEADER_LOGO_SRCSET = "/app-logo-120.png 120w, /apple-touch-icon.png 180w";

export function AppHeader({
  children,
  className,
  subtitle,
  title,
}: {
  children?: ReactNode;
  className?: string;
  subtitle?: ReactNode;
  title: string;
}) {
  return (
    <header className={cn("flex flex-col items-center gap-4 text-center text-white", className)}>
      <AppHeaderIdentity subtitle={subtitle} title={title} />
      {children}
    </header>
  );
}

export function AppHeaderIdentity({ subtitle, title }: { subtitle?: ReactNode; title: string }) {
  return (
    <>
      <div
        data-slot="app-logo"
        className="relative size-15 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-white"
        aria-hidden="true"
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
        <h1 className="text-balance text-4xl leading-tight font-bold tracking-tight text-white">
          {title}
        </h1>
        {subtitle ? (
          <p className="max-w-[40rem] text-balance text-lg font-medium text-white md:max-w-full">
            {subtitle}
          </p>
        ) : null}
      </div>
    </>
  );
}

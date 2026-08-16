import { PortfolioNavbar, PortfolioPageHeader } from "@/components/app-header";
import { PORTFOLIO_PAGE_SUBTITLE, PORTFOLIO_PAGE_TITLE_ACCENT } from "@/lib/portfolio-page-copy";

export function OgImagePreview({ seed, title }: { seed: string; title: string }) {
  return (
    <main
      aria-label={`${title} Open Graph image preview`}
      className="dark relative isolate flex h-[630px] w-[1200px] flex-col overflow-hidden bg-background font-sans text-foreground"
      data-og-preview
      data-og-seed={seed}
      style={{ colorScheme: "dark" }}
    >
      <PortfolioNavbar variant="social" />
      <section
        className="relative z-10 flex min-h-0 w-full flex-1 px-16 pt-5 pb-24"
        data-slot="og-preview-header"
      >
        <div
          className="flex size-full items-start justify-center"
          data-slot="og-preview-safe-region"
        >
          <PortfolioPageHeader
            subtitle={PORTFOLIO_PAGE_SUBTITLE}
            title={
              <>
                Explore the useful products{" "}
                <span className="text-page-title-accent" data-slot="app-header-title-accent">
                  {PORTFOLIO_PAGE_TITLE_ACCENT}
                </span>
              </>
            }
            variant="social"
          />
        </div>
      </section>
    </main>
  );
}

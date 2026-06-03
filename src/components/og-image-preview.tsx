import { AppHeader } from "@/components/app-header";

const PAGE_BACKGROUND = "var(--portfolio-app-chrome-color)";
const ATMOSPHERE_IMAGE = 'url("/page-atmosphere.avif")';

export function OgImagePreview({ seed, title }: { seed: string; title: string }) {
  return (
    <main
      aria-label={`${title} Open Graph image preview`}
      className="relative z-10 flex h-[630px] w-[1200px] items-center justify-center overflow-hidden text-white"
      data-og-preview
      data-og-seed={seed}
      style={{ background: PAGE_BACKGROUND }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-no-repeat"
        data-og-background="page-atmosphere"
        style={{
          backgroundImage: ATMOSPHERE_IMAGE,
          backgroundPosition: "center top",
          backgroundSize: "100% auto",
          opacity: 1,
        }}
      />
      <AppHeader
        className="relative z-20 origin-center scale-[2.35] drop-shadow-[0_2px_18px_rgba(0,0,0,0.28)]"
        title={title}
      />
    </main>
  );
}

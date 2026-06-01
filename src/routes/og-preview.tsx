import { createFileRoute } from "@tanstack/react-router";

import { OgImagePreview } from "@/components/og-image-preview";

const PAGE_TITLE = "Doga Fincan";

export const Route = createFileRoute("/og-preview")({
  validateSearch: (search: Record<string, unknown>) => ({
    seed: typeof search.seed === "string" && search.seed.length > 0 ? search.seed : "preview",
  }),
  head: () => ({
    meta: [
      {
        title: `${PAGE_TITLE} Open Graph Preview`,
      },
      {
        name: "robots",
        content: "noindex,nofollow",
      },
    ],
  }),
  component: OgPreviewRoute,
});

function OgPreviewRoute() {
  const { seed } = Route.useSearch();

  return <OgImagePreview seed={seed} title={PAGE_TITLE} />;
}

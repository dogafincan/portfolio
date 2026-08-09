import { createFileRoute } from "@tanstack/react-router";

import { NotFoundPage } from "@/routes/__root";

export const Route = createFileRoute("/404.html")({
  head: () => ({
    meta: [
      { title: "Page not found | Portfolio" },
      { name: "description", content: "The requested page is not part of this portfolio." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: NotFoundPage,
});

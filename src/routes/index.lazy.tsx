import { createLazyFileRoute } from "@tanstack/react-router";

import { PortfolioHome } from "@/components/portfolio-home";

export const Route = createLazyFileRoute("/")({
  component: IndexRoute,
});

function IndexRoute() {
  return <PortfolioHome />;
}

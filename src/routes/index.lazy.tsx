import { createLazyFileRoute } from "@tanstack/react-router";

import { HelloWorld } from "@/components/hello-world";

export const Route = createLazyFileRoute("/")({
  component: IndexRoute,
});

function IndexRoute() {
  return <HelloWorld />;
}

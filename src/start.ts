import { createMiddleware, createStart } from "@tanstack/react-start";

import { guardChainMigrationRequest } from "@/lib/chain-migration.server";
import { guardDynamicApiEnvelope } from "@/lib/dynamic-api-guard.server";

const SERVER_FUNCTION_PATH_PREFIX = "/_serverFn/";

const workerRequestGuard = createMiddleware().server(async ({ request, next }) => {
  const migrationRejection = guardChainMigrationRequest(request);
  if (migrationRejection) {
    return migrationRejection;
  }
  const dynamicApiRejection = guardDynamicApiEnvelope(request);
  if (dynamicApiRejection) {
    return dynamicApiRejection;
  }
  if (!new URL(request.url).pathname.startsWith(SERVER_FUNCTION_PATH_PREFIX)) {
    return next();
  }
  return new Response("Not found", {
    status: 404,
    headers: {
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
});

export const startInstance = createStart(() => ({
  requestMiddleware: [workerRequestGuard],
}));

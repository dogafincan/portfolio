import {
  CHAIN_MIGRATION_API_CODE,
  CHAIN_MIGRATION_API_MESSAGE,
  CHAIN_MIGRATION_API_STATUS,
  CHAIN_MIGRATION_LOCKED,
} from "@/lib/chain-migration";
import { DYNAMIC_API_PATHS } from "@/lib/dynamic-api-guard.server";

const SERVER_FUNCTION_PATH_PREFIX = "/_serverFn/";

export function guardChainMigrationRequest(request: Request): Response | null {
  if (!CHAIN_MIGRATION_LOCKED) {
    return null;
  }

  const pathname = new URL(request.url).pathname;
  if (!DYNAMIC_API_PATHS.includes(pathname) && !pathname.startsWith(SERVER_FUNCTION_PATH_PREFIX)) {
    return null;
  }

  return createChainMigrationUnavailableResponse();
}

export function createChainMigrationUnavailableResponse() {
  return Response.json(
    {
      code: CHAIN_MIGRATION_API_CODE,
      error: CHAIN_MIGRATION_API_MESSAGE,
    },
    {
      status: CHAIN_MIGRATION_API_STATUS,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/json; charset=utf-8",
        "Retry-After": "3600",
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}

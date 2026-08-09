import { CHAIN_MIGRATION_LOCKED } from "@/lib/chain-migration";
import { createChainMigrationUnavailableResponse } from "@/lib/chain-migration.server";

export const REGISTRY_GATEWAY_RATE_LIMIT_MESSAGE =
  "Request rate limit reached. Wait a moment and try again.";
export const REGISTRY_GATEWAY_CONFIGURATION_MESSAGE =
  "Project submissions are not configured for this operation.";

type Environment = {
  PORTFOLIO_PUBLIC_CLIENT_LIMITER?: RateLimiterBinding;
  PORTFOLIO_PUBLIC_LOCATION_LIMITER?: RateLimiterBinding;
  PORTFOLIO_PAID_CLIENT_LIMITER?: RateLimiterBinding;
  PORTFOLIO_PAID_LOCATION_LIMITER?: RateLimiterBinding;
  REGISTRY_PUBLIC_GATEWAY?: ServiceBinding;
};

type RateLimiterBinding = {
  limit(input: { key: string }): Promise<{ success: boolean }>;
};

type ServiceBinding = {
  fetch(request: Request): Promise<Response>;
};

export async function forwardRegistrySubmissionRequest(
  request: Request,
  lane: "challenge" | "paid",
) {
  if (CHAIN_MIGRATION_LOCKED) {
    return createChainMigrationUnavailableResponse();
  }

  try {
    requireSameOrigin(request);
    const environment = await resolveEnvironment();
    await enforceFuses({ request, environment, lane });
    if (!environment.REGISTRY_PUBLIC_GATEWAY) {
      throw new Error(REGISTRY_GATEWAY_CONFIGURATION_MESSAGE);
    }
    return await environment.REGISTRY_PUBLIC_GATEWAY.fetch(request);
  } catch (error) {
    return routeErrorResponse(error);
  }
}

async function resolveEnvironment() {
  try {
    const moduleName = "cloudflare:workers";
    const cloudflare = (await import(moduleName)) as unknown as { env?: Environment };
    if (cloudflare.env) {
      return cloudflare.env;
    }
  } catch {
    // Static tooling does not expose Worker bindings.
  }
  throw new Error(REGISTRY_GATEWAY_CONFIGURATION_MESSAGE);
}

async function enforceFuses(input: {
  request: Request;
  environment: Environment;
  lane: "challenge" | "paid";
}) {
  const clientKey = await buildTrustedClientKey(input.request);
  await enforceLimiter(input.environment.PORTFOLIO_PUBLIC_CLIENT_LIMITER, clientKey);
  await enforceLimiter(input.environment.PORTFOLIO_PUBLIC_LOCATION_LIMITER, "portfolio:location");
  if (input.lane === "paid") {
    await enforceLimiter(input.environment.PORTFOLIO_PAID_CLIENT_LIMITER, clientKey);
    await enforceLimiter(
      input.environment.PORTFOLIO_PAID_LOCATION_LIMITER,
      "portfolio:paid:location",
    );
  }
}

function requireSameOrigin(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    throw new GatewayHttpError(403, "Request origin is not allowed.");
  }
}

async function buildTrustedClientKey(request: Request) {
  const address = normalizeClientAddress(request.headers.get("cf-connecting-ip") ?? "unknown");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(address));
  const hash = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return `portfolio:client:${hash}`;
}

function normalizeClientAddress(value: string) {
  const address = value.trim().toLowerCase();
  if (!address.includes(":")) {
    return address || "unknown";
  }
  const [left = "", right = "", extra] = address.split("::");
  if (extra !== undefined) {
    return address;
  }
  const leftParts = left ? left.split(":") : [];
  const rightParts = right ? right.split(":") : [];
  if ([...leftParts, ...rightParts].some((part) => !/^[0-9a-f]{1,4}$/u.test(part))) {
    return address;
  }
  const omitted = 8 - leftParts.length - rightParts.length;
  const parts = [...leftParts, ...Array.from({ length: omitted }, () => "0"), ...rightParts];
  return omitted >= 0 && parts.length === 8
    ? `${parts
        .slice(0, 4)
        .map((part) => part.padStart(4, "0"))
        .join(":")}::/64`
    : address;
}

async function enforceLimiter(limiter: RateLimiterBinding | undefined, key: string) {
  if (!limiter) {
    if (import.meta.env.PROD) {
      throw new Error(REGISTRY_GATEWAY_CONFIGURATION_MESSAGE);
    }
    return;
  }
  if (!(await limiter.limit({ key })).success) {
    throw new Error(REGISTRY_GATEWAY_RATE_LIMIT_MESSAGE);
  }
}

function routeErrorResponse(error: unknown) {
  if (error instanceof GatewayHttpError) {
    return jsonError(error.status, error.message);
  }
  if (error instanceof Error && error.message === REGISTRY_GATEWAY_RATE_LIMIT_MESSAGE) {
    return jsonError(429, REGISTRY_GATEWAY_RATE_LIMIT_MESSAGE, { "Retry-After": "60" });
  }
  if (error instanceof Error && error.message === REGISTRY_GATEWAY_CONFIGURATION_MESSAGE) {
    return jsonError(503, REGISTRY_GATEWAY_CONFIGURATION_MESSAGE, { "Retry-After": "60" });
  }
  return jsonError(502, "The Registry could not complete this request.");
}

function jsonError(status: number, message: string, headers?: HeadersInit) {
  const responseHeaders = new Headers(headers);
  responseHeaders.set("Cache-Control", "no-store");
  responseHeaders.set("Content-Type", "application/json; charset=utf-8");
  responseHeaders.set("X-Content-Type-Options", "nosniff");
  return Response.json({ error: message }, { status, headers: responseHeaders });
}

class GatewayHttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

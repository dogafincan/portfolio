import { describe, expect, it } from "vite-plus/test";

import {
  CHAIN_MIGRATION_API_CODE,
  CHAIN_MIGRATION_API_MESSAGE,
  CHAIN_MIGRATION_API_STATUS,
} from "@/lib/chain-migration";
import {
  createChainMigrationUnavailableResponse,
  guardChainMigrationRequest,
} from "@/lib/chain-migration.server";
import { DYNAMIC_API_PATHS } from "@/lib/dynamic-api-guard.server";
import { forwardRegistrySubmissionRequest } from "@/lib/registry-submission-gateway.server";

describe("temporary chain migration server lockout", () => {
  it("returns one unavailable response for every public dynamic entry point", async () => {
    const paths = [...DYNAMIC_API_PATHS, "/_serverFn/direct-call"];

    for (const path of paths) {
      const response = guardChainMigrationRequest(
        new Request(`https://dogafincan.com${path}?attempt=1`, { method: "GET" }),
      );

      expect(response?.status).toBe(CHAIN_MIGRATION_API_STATUS);
      expect(response?.headers.get("cache-control")).toBe("no-store");
      expect(response?.headers.get("retry-after")).toBe("3600");
      await expect(response?.json()).resolves.toEqual({
        code: CHAIN_MIGRATION_API_CODE,
        error: CHAIN_MIGRATION_API_MESSAGE,
      });
    }
  });

  it("keeps genuinely static routes outside the server lockout", () => {
    for (const path of ["/", "/submit", "/404.html", "/projects/memerank-icon.avif"]) {
      expect(guardChainMigrationRequest(new Request(`https://dogafincan.com${path}`))).toBeNull();
    }
  });

  it("fails closed inside the Registry gateway before a binding can be resolved", async () => {
    const response = await forwardRegistrySubmissionRequest(
      new Request("https://dogafincan.com/api/v1/payment/challenge", { method: "POST" }),
      "challenge",
    );
    const canonicalResponse = createChainMigrationUnavailableResponse();

    expect(response.status).toBe(canonicalResponse.status);
    await expect(response.json()).resolves.toEqual(await canonicalResponse.json());
  });
});

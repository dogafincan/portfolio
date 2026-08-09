import { readFileSync } from "node:fs";

import { describe, expect, it } from "vite-plus/test";

describe("static-first route boundaries", () => {
  it("prerenders anonymous routes and strips JavaScript from 404.html", () => {
    const vite = readFileSync("vite.config.ts", "utf8");
    for (const path of ["/", "/submit", "/og-preview", "/404.html"]) {
      expect(vite).toContain(`path: "${path}"`);
    }
    expect(vite).toContain("removeStaticNotFoundJavaScript");
    expect(vite).toContain('outputPath: "/404.html"');
    expect(vite).toContain("crawlLinks: false");
  });

  it("keeps Worker-first and Registry bindings exact", () => {
    const wrangler = readFileSync("wrangler.jsonc", "utf8");
    const start = readFileSync("src/start.ts", "utf8");

    expect(wrangler.match(/"\/api\/v1\/[^"]+"/gu)).toEqual([
      '"/api/v1/payment/challenge"',
      '"/api/v1/payment/redeem-project-submission"',
      '"/api/v1/submissions"',
    ]);
    expect(wrangler).toContain('"not_found_handling": "404-page"');
    expect(wrangler).toContain('"binding": "REGISTRY_PUBLIC_GATEWAY"');
    for (const id of ["2026072931", "2026072932", "2026072933", "2026072934"]) {
      expect(wrangler).toContain(`"namespace_id": "${id}"`);
    }
    expect(start).toContain('const SERVER_FUNCTION_PATH_PREFIX = "/_serverFn/";');
    expect(start).toContain("guardChainMigrationRequest(request)");
    expect(start).toContain("guardDynamicApiEnvelope(request)");
    expect(start.indexOf("guardChainMigrationRequest(request)")).toBeLessThan(
      start.indexOf("guardDynamicApiEnvelope(request)"),
    );
  });
});

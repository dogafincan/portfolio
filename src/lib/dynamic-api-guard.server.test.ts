import { describe, expect, it } from "vite-plus/test";

import { DYNAMIC_API_PATHS, guardDynamicApiEnvelope } from "@/lib/dynamic-api-guard.server";

function request(
  path: string,
  {
    contentEncoding,
    contentLength,
    contentType = "application/json",
    method = "POST",
    origin = "https://dogafincan.com",
  }: {
    contentEncoding?: string;
    contentLength?: string;
    contentType?: string;
    method?: string;
    origin?: string;
  } = {},
) {
  const headers = new Headers({ "Content-Type": contentType, Origin: origin });
  if (contentLength !== undefined) {
    headers.set("Content-Length", contentLength);
  }
  if (contentEncoding !== undefined) {
    headers.set("Content-Encoding", contentEncoding);
  }
  return new Request(`https://dogafincan.com${path}`, { method, headers });
}

describe("dynamic API envelope guard", () => {
  it("recognizes only the three exact Worker-first paths", () => {
    expect(DYNAMIC_API_PATHS).toEqual([
      "/api/v1/payment/challenge",
      "/api/v1/payment/redeem-project-submission",
      "/api/v1/submissions",
    ]);
    expect(guardDynamicApiEnvelope(request("/api/v1/payment/challenge"))).toBeNull();
    expect(guardDynamicApiEnvelope(request("/api/v1/payment/challenge/"))).toBeNull();
  });

  it("rejects query, method, origin, media, and declared-size errors without reading a body", () => {
    expect(guardDynamicApiEnvelope(request("/api/v1/payment/challenge?retry=1"))?.status).toBe(400);
    expect(
      guardDynamicApiEnvelope(request("/api/v1/payment/challenge", { method: "GET" }))?.status,
    ).toBe(405);
    expect(
      guardDynamicApiEnvelope(
        request("/api/v1/payment/challenge", { origin: "https://attacker.example" }),
      )?.status,
    ).toBe(403);
    expect(
      guardDynamicApiEnvelope(request("/api/v1/payment/challenge", { contentType: "text/plain" }))
        ?.status,
    ).toBe(415);
    expect(
      guardDynamicApiEnvelope(request("/api/v1/payment/challenge", { contentLength: "4097" }))
        ?.status,
    ).toBe(413);
    expect(
      guardDynamicApiEnvelope(request("/api/v1/payment/challenge", { contentLength: "01" }))
        ?.status,
    ).toBe(400);
    expect(
      guardDynamicApiEnvelope(request("/api/v1/payment/challenge", { contentEncoding: "gzip" }))
        ?.status,
    ).toBe(415);
  });

  it("requires a bounded multipart boundary for the image upload path", () => {
    expect(
      guardDynamicApiEnvelope(
        request("/api/v1/submissions", {
          contentType: "multipart/form-data; boundary=doji-boundary",
          contentLength: "5100000",
        }),
      ),
    ).toBeNull();
    expect(
      guardDynamicApiEnvelope(
        request("/api/v1/submissions", { contentType: "multipart/form-data" }),
      )?.status,
    ).toBe(415);
    expect(
      guardDynamicApiEnvelope(
        request("/api/v1/submissions", {
          contentType: "multipart/form-data; boundary=doji-boundary",
        }),
      )?.status,
    ).toBe(411);
    expect(
      guardDynamicApiEnvelope(
        request("/api/v1/submissions", {
          contentEncoding: "br",
          contentLength: "500",
          contentType: "multipart/form-data; boundary=doji-boundary",
        }),
      )?.status,
    ).toBe(415);
  });
});

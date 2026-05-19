import { readFileSync } from "node:fs";

import { describe, expect, it } from "vite-plus/test";

describe("index route head", () => {
  it("declares Open Graph and Twitter metadata with a 1200x630 image", () => {
    const source = readFileSync(new URL("./index.tsx", import.meta.url), "utf8");
    const ogImage = readFileSync(new URL("../../public/og-image.png", import.meta.url));
    const siteUrlMatch = source.match(/const SITE_URL = "([^"]+)";/);
    const socialImageMatch = source.match(
      /const SOCIAL_IMAGE = `\$\{SITE_URL\}(\/og-image\.png\?v=\d+)`;/,
    );

    expect(source).toContain('property: "og:type"');
    expect(source).toContain('property: "og:url"');
    expect(source).toContain('property: "og:title"');
    expect(source).toContain('property: "og:description"');
    expect(source).toContain('property: "og:image"');
    expect(source).toContain('property: "og:image:secure_url"');
    expect(source).toContain("content: SOCIAL_IMAGE");
    expect(source).toContain('property: "og:image:width"');
    expect(source).toContain('content: "1200"');
    expect(source).toContain('property: "og:image:height"');
    expect(source).toContain('content: "630"');
    expect(source).toContain('name: "twitter:card"');
    expect(source).toContain('content: "summary_large_image"');
    expect(source).toContain('name: "twitter:site"');
    expect(source).toContain('name: "twitter:creator"');
    expect(source).toContain('name: "twitter:image"');
    expect(source).toContain('rel: "canonical"');
    expect(source).toContain("href: SITE_URL");
    expect(source).toContain(
      "I'm into learning languages, nutrition and exercise, and building cool things. Reach out if you're building something interesting.",
    );
    expect(source).not.toContain(
      "Focused web utilities and product systems built with React, Cloudflare, and careful user-facing workflows.",
    );
    expect(source).not.toContain("Hit me up");
    expect(source).not.toContain("getting my reps in");
    expect(source).not.toContain("staying active");
    expect(source).not.toContain("building useful things for the web");

    expect(siteUrlMatch?.[1]).toBe("https://portfolio.dogafincan.workers.dev");
    expect(socialImageMatch?.[1]).toMatch(/^\/og-image\.png\?v=\d+$/);
    expect(new URL(`${siteUrlMatch?.[1]}${socialImageMatch?.[1]}`).href).toBe(
      "https://portfolio.dogafincan.workers.dev/og-image.png?v=2026052003",
    );
    expect(source).not.toContain('const SOCIAL_IMAGE = "/og-image.png";');

    expect(ogImage.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(ogImage.readUInt32BE(16)).toBe(1200);
    expect(ogImage.readUInt32BE(20)).toBe(630);
  });
});

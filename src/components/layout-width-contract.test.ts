import { readFileSync } from "node:fs";
import { describe, expect, it } from "vite-plus/test";

const drawerSource = readFileSync(new URL("./ui/drawer.tsx", import.meta.url), "utf8");
const headerSource = readFileSync(new URL("./app-header.tsx", import.meta.url), "utf8");
const notFoundSource = readFileSync(new URL("../routes/__root.tsx", import.meta.url), "utf8");
const submissionSource = readFileSync(
  new URL("./project-submission-form.tsx", import.meta.url),
  "utf8",
);

describe("shared width tiers", () => {
  it("uses the wide project grid, standard form and static Card, and compact Drawer tiers", () => {
    expect(headerSource).toContain("sm:max-w-6xl");
    expect(submissionSource).toContain('className="mx-auto w-full max-w-3xl"');
    expect(notFoundSource).toContain('className="mx-auto w-full min-w-0 max-w-3xl"');
    expect(drawerSource).toContain("md:max-w-xl");
  });
});

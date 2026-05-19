import { readFileSync } from "node:fs";

import { describe, expect, it } from "vite-plus/test";

import { portfolioProjects } from "@/content/projects";

describe("portfolioProjects", () => {
  it("uses a dedicated centered preview for the portfolio project card", () => {
    const portfolioProject = portfolioProjects.find((project) => project.slug === "portfolio");
    const previewImage = readFileSync(
      new URL("../../public/projects/portfolio-og.png", import.meta.url),
    );

    expect(portfolioProject?.image).toBe("/projects/portfolio-og.png");
    expect(portfolioProject?.image).not.toBe("/og-image.png");
    expect(previewImage.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(previewImage.readUInt32BE(16)).toBe(1200);
    expect(previewImage.readUInt32BE(20)).toBe(630);
  });
});

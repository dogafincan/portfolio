import { describe, expect, it } from "vite-plus/test";

import { portfolioProjects } from "@/content/projects";

describe("portfolioProjects", () => {
  it("matches the sibling app titles and subtitles", () => {
    expect(
      portfolioProjects.map((project) => ({
        slug: project.slug,
        name: project.name,
        subtitle: project.subtitle,
      })),
    ).toEqual([
      {
        slug: "sui-airdrop",
        name: "Sui Airdrop",
        subtitle: "Create a fixed-amount token airdrop from a Sui Snapshot CSV.",
      },
      {
        slug: "sui-snapshot",
        name: "Sui Snapshot",
        subtitle:
          "Generate a ranked holder list for a Sui coin or NFT collection and export it as CSV.",
      },
    ]);
  });
});

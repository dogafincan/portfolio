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
        slug: "memerank",
        name: "Memerank",
        subtitle: "Find the Sui projects with the loudest signal.",
      },
      {
        slug: "sui-swap",
        name: "Sui Swap",
        subtitle: "Swap between Sui assets in a focused, simple flow.",
      },
      {
        slug: "sui-airdrop",
        name: "Sui Airdrop",
        subtitle: "Airdrop coins from a Sui Snapshot CSV.",
      },
      {
        slug: "sui-snapshot",
        name: "Sui Snapshot",
        subtitle: "Rank Sui coin or NFT holders and export a CSV.",
      },
    ]);
  });
});

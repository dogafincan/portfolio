import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vite-plus/test";

import { portfolioProjects } from "@/content/projects";

describe("portfolioProjects", () => {
  it("matches the sibling app titles and subtitles", () => {
    expect(
      portfolioProjects.map((project) => ({
        slug: project.slug,
        name: project.name,
        subtitle: project.subtitle,
        liveUrl: project.liveUrl,
      })),
    ).toEqual([
      {
        slug: "memerank",
        name: "Doji Rank",
        subtitle:
          "Explore approved projects ranked by relative trading activity on Doji Rank, then review each project or open its built-in wallet trade flow directly.",
        liveUrl: "https://dojirank.com",
      },
      {
        slug: "sui-swap",
        name: "Doji Swap",
        subtitle:
          "Choose two approved assets, review the live route, compare the expected amounts, and complete the swap directly with your connected wallet.",
        liveUrl: "https://sui-swap.dogafincan.workers.dev",
      },
      {
        slug: "sui-airdrop",
        name: "Doji Drop",
        subtitle:
          "Upload a holder snapshot CSV, choose the asset and amount for each wallet, review every recipient, then approve one funding transaction and track delivery.",
        liveUrl: "https://dojidrop.xyz",
      },
      {
        slug: "sui-snapshot",
        name: "Doji Snap",
        subtitle:
          "Choose an approved project, complete its published payment, then let Doji Snap build a complete ranked holder CSV in the background for review and export.",
        liveUrl: "https://dojisnap.xyz",
      },
      {
        slug: "doji-registry",
        name: "Doji Registry",
        subtitle:
          "Review submissions, maintain approved metadata, and publish one versioned project catalog for every Doji application from a protected Registry.",
        liveUrl: "https://registry.dogafincan.com",
      },
    ]);
  });

  it("uses immutable byte-identical light and dark logo copies from each source revision", () => {
    const expectedSha256 = new Map([
      [
        "doji-memerank-logo-light-2ce5e89.png",
        "55049b8ba44daca6ecb6c7055fa5c5efdba279725570a1973e461708cf3c6427",
      ],
      [
        "doji-memerank-logo-dark-2ce5e89.png",
        "e78da59840391662eaa635fa2494d27e7ab1542cd4a5c0fec6d5ee6a3f259510",
      ],
      [
        "doji-swap-logo-light-3eda353.png",
        "7081ba6c32321f0e6cd81986803f78a1ac5695b52a434e97a69d58db4a6145a5",
      ],
      [
        "doji-swap-logo-dark-3eda353.png",
        "bdfaea6fbea5198d69815cde71cea29f64b75a6f8c409f868197e597da4e4509",
      ],
      [
        "doji-airdrop-logo-light-141d1b3.png",
        "0bf56368e3935efad0ae7ed36795270d790c233eb12bbf5a0038989f74e6abf9",
      ],
      [
        "doji-airdrop-logo-dark-141d1b3.png",
        "bd218f29089f7678e345c1bf71f2b86f402cf7fdfe25cf5b88af7f0a2de71932",
      ],
      [
        "dojisnap-logo-light-17fd090.png",
        "31d4521011b1907f67eabfa150f6122a15c9da0bd991e805ff4a841c1708ba94",
      ],
      [
        "dojisnap-logo-dark-17fd090.png",
        "7e4f81465aef767d5b67ac80302d88e490672a66c0c71b13065f5bcc8a76d3a7",
      ],
      [
        "doji-registry-logo-light-c6f191f.png",
        "c1b25b350a8a2a75cb563d27f8aa4114f096e2ff7bf261c0fdf244d35224b21c",
      ],
      [
        "doji-registry-logo-dark-c6f191f.png",
        "ff450570183d679520af9497983927e9217acfbdd4c12148a0a03be6bbcba1e9",
      ],
    ]);

    const logoPaths = portfolioProjects.flatMap(({ logoDark, logoLight }) => [logoLight, logoDark]);

    expect(logoPaths).toHaveLength(10);
    expect(new Set(logoPaths).size).toBe(10);
    for (const logoPath of logoPaths) {
      const fileName = logoPath.replace("/projects/", "");
      const bytes = readFileSync(join(process.cwd(), "public", "projects", fileName));

      expect(createHash("sha256").update(bytes).digest("hex")).toBe(expectedSha256.get(fileName));
    }

    for (const legacyFile of [
      "memerank-icon.avif",
      "sui-swap-icon.avif",
      "sui-airdrop-icon.avif",
      "sui-snapshot-icon.avif",
    ]) {
      expect(existsSync(join(process.cwd(), "public", "projects", legacyFile))).toBe(false);
    }
  });
});

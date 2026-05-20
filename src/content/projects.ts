export type PortfolioProject = {
  name: string;
  slug: string;
  subtitle: string;
  icon: string;
  iconAlt: string;
  liveUrl: string;
};

export const portfolioProjects: PortfolioProject[] = [
  {
    name: "Sui Airdrop",
    slug: "sui-airdrop",
    subtitle: "Create a fixed-amount token airdrop from a Sui Snapshot CSV.",
    icon: "/projects/sui-airdrop-icon.png",
    iconAlt: "Sui Airdrop app icon.",
    liveUrl: "https://sui-airdrop.dogafincan.workers.dev",
  },
  {
    name: "Sui Snapshot",
    slug: "sui-snapshot",
    subtitle:
      "Generate a ranked holder list for a Sui coin or NFT collection and export it as CSV.",
    icon: "/projects/sui-snapshot-icon.png",
    iconAlt: "Sui Snapshot app icon.",
    liveUrl: "https://sui-snapshot.dogafincan.workers.dev",
  },
];

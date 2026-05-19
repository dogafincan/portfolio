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
    subtitle:
      "Turns a Sui Snapshot CSV into a previewed, funded, backend-executed airdrop campaign.",
    icon: "/projects/sui-airdrop-icon.png",
    iconAlt: "Sui Airdrop app icon.",
    liveUrl: "https://sui-airdrop.dogafincan.workers.dev",
  },
  {
    name: "Sui Snapshot",
    slug: "sui-snapshot",
    subtitle:
      "Creates ranked holder lists for Sui coins or NFT collections and exports the rows as a clean CSV.",
    icon: "/projects/sui-snapshot-icon.png",
    iconAlt: "Sui Snapshot app icon.",
    liveUrl: "https://sui-snapshot.dogafincan.workers.dev",
  },
];

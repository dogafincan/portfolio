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
    name: "Memerank",
    slug: "memerank",
    subtitle: "A snapshot of the projects on Sui with the highest memetic value.",
    icon: "/projects/memerank-icon.avif",
    iconAlt: "Memerank app icon.",
    liveUrl: "https://memerank.xyz",
  },
  {
    name: "Sui Swap",
    slug: "sui-swap",
    subtitle: "Swap between Sui assets in a focused, simple flow.",
    icon: "/projects/sui-swap-icon.avif",
    iconAlt: "Sui Swap app icon.",
    liveUrl: "https://sui-swap.dogafincan.workers.dev",
  },
  {
    name: "Sui Airdrop",
    slug: "sui-airdrop",
    subtitle: "Create a fixed-amount coin airdrop from a Sui Snapshot CSV.",
    icon: "/projects/sui-airdrop-icon.avif",
    iconAlt: "Sui Airdrop app icon.",
    liveUrl: "https://sui-airdrop.dogafincan.workers.dev",
  },
  {
    name: "Sui Snapshot",
    slug: "sui-snapshot",
    subtitle:
      "Generate a ranked holder list for a Sui coin or NFT collection and export it as CSV.",
    icon: "/projects/sui-snapshot-icon.avif",
    iconAlt: "Sui Snapshot app icon.",
    liveUrl: "https://sui-snapshot.dogafincan.workers.dev",
  },
];

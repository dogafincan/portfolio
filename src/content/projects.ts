export type PortfolioProject = {
  name: string;
  slug: string;
  subtitle: string;
  logoLight: string;
  logoDark: string;
  logoAlt: string;
  liveUrl: string;
};

export const portfolioProjects: PortfolioProject[] = [
  {
    name: "DojiMemerank",
    slug: "memerank",
    subtitle:
      "Explore approved Sui projects ranked by relative trading activity on Memerank, then review each project or open its built-in wallet trade flow.",
    logoLight: "/projects/doji-memerank-logo-light-2ce5e89.png",
    logoDark: "/projects/doji-memerank-logo-dark-2ce5e89.png",
    logoAlt: "DojiMemerank logo.",
    liveUrl: "https://memerank.xyz",
  },
  {
    name: "DojiSwap",
    slug: "sui-swap",
    subtitle:
      "Choose two Registry-approved Sui coins, enter the amount you want to spend or receive, review the live route, then approve the swap in your wallet.",
    logoLight: "/projects/doji-swap-logo-light-3eda353.png",
    logoDark: "/projects/doji-swap-logo-dark-3eda353.png",
    logoAlt: "DojiSwap logo.",
    liveUrl: "https://sui-swap.dogafincan.workers.dev",
  },
  {
    name: "DojiAirdrop",
    slug: "sui-airdrop",
    subtitle:
      "Upload a Sui Snapshot CSV, choose the coin and amount for each wallet, review every recipient, then approve one funding transaction and track delivery.",
    logoLight: "/projects/doji-airdrop-logo-light-141d1b3.png",
    logoDark: "/projects/doji-airdrop-logo-dark-141d1b3.png",
    logoAlt: "DojiAirdrop logo.",
    liveUrl: "https://sui-airdrop.dogafincan.workers.dev",
  },
  {
    name: "DojiSnap",
    slug: "sui-snapshot",
    subtitle:
      "Choose an approved Sui coin or NFT project, pay its published SUI price, then let DojiSnap build a complete ranked holder CSV in the background.",
    logoLight: "/projects/dojisnap-logo-light-17fd090.png",
    logoDark: "/projects/dojisnap-logo-dark-17fd090.png",
    logoAlt: "DojiSnap logo.",
    liveUrl: "https://dojisnap.xyz",
  },
  {
    name: "DojiRegistry",
    slug: "doji-registry",
    subtitle:
      "Review submissions, maintain approved metadata, and publish one versioned project catalog for every Doji application from a protected Registry.",
    logoLight: "/projects/doji-registry-logo-light-c6f191f.png",
    logoDark: "/projects/doji-registry-logo-dark-c6f191f.png",
    logoAlt: "DojiRegistry logo.",
    liveUrl: "https://registry.dogafincan.com",
  },
];

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
    name: "Doji Drop",
    slug: "sui-airdrop",
    subtitle:
      "Upload a holder snapshot CSV, choose the asset and amount for each wallet, review every recipient, then approve one funding transaction and track delivery.",
    logoLight: "/projects/doji-airdrop-logo-light-141d1b3.png",
    logoDark: "/projects/doji-airdrop-logo-dark-141d1b3.png",
    logoAlt: "Doji Drop logo.",
    liveUrl: "https://dojidrop.xyz",
  },
  {
    name: "Doji Snap",
    slug: "sui-snapshot",
    subtitle:
      "Choose an approved project, complete its published payment, then let Doji Snap build a complete ranked holder CSV in the background for review and export.",
    logoLight: "/projects/dojisnap-logo-light-17fd090.png",
    logoDark: "/projects/dojisnap-logo-dark-17fd090.png",
    logoAlt: "Doji Snap logo.",
    liveUrl: "https://dojisnap.xyz",
  },
  {
    name: "Doji Rank",
    slug: "memerank",
    subtitle:
      "Discover the approved projects drawing the most trading activity on Doji Rank, spot useful signals in the ranked list, and trade your picks in one place.",
    logoLight: "/projects/doji-memerank-logo-light-2ce5e89.png",
    logoDark: "/projects/doji-memerank-logo-dark-2ce5e89.png",
    logoAlt: "Doji Rank logo.",
    liveUrl: "https://dojirank.com",
  },
  {
    name: "Doji Swap",
    slug: "sui-swap",
    subtitle:
      "Choose two approved assets, review the live route, compare the expected amounts, and complete the swap directly with your connected wallet.",
    logoLight: "/projects/doji-swap-logo-light-3eda353.png",
    logoDark: "/projects/doji-swap-logo-dark-3eda353.png",
    logoAlt: "Doji Swap logo.",
    liveUrl: "https://swap.dogafincan.com",
  },
  {
    name: "Doji Registry",
    slug: "doji-registry",
    subtitle:
      "Review submissions, maintain approved metadata, and publish one versioned project catalog for every Doji application from a protected Registry.",
    logoLight: "/projects/doji-registry-logo-light-c6f191f.png",
    logoDark: "/projects/doji-registry-logo-dark-c6f191f.png",
    logoAlt: "Doji Registry logo.",
    liveUrl: "https://registry.dogafincan.com",
  },
];

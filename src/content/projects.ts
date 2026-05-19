export type PortfolioProject = {
  name: string;
  slug: string;
  summary: string;
  role: string;
  status: string;
  image: string;
  imageAlt: string;
  liveUrl?: string;
  stack: string[];
  highlights: string[];
};

export const portfolioProjects: PortfolioProject[] = [
  {
    name: "Sui Snapshot",
    slug: "sui-snapshot",
    summary:
      "Creates ranked holder lists for Sui coins or NFT collections and exports the rows as a clean CSV.",
    role: "Product design, frontend, server batch pipeline, Cloudflare deployment",
    status: "Live utility",
    image: "/projects/sui-snapshot-og.png",
    imageAlt: "Sui Snapshot social preview with the app logo and product description.",
    liveUrl: "https://sui-snapshot.dogafincan.workers.dev",
    stack: ["TanStack Start", "Cloudflare Workers", "Sui GraphQL RPC", "shadcn/ui"],
    highlights: [
      "Worker-safe snapshot batches",
      "NFT owner resolution without a third-party indexer",
      "Top 10,000 holder export contract for downstream tools",
    ],
  },
  {
    name: "Sui Airdrop",
    slug: "sui-airdrop",
    summary:
      "Turns a Sui Snapshot CSV into a previewed, funded, backend-executed airdrop campaign.",
    role: "Product design, wallet workflow, Durable Object runtime, recovery UX",
    status: "Live utility",
    image: "/projects/sui-airdrop-og.png",
    imageAlt: "Sui Airdrop social preview with the app logo and product description.",
    liveUrl: "https://sui-airdrop.dogafincan.workers.dev",
    stack: ["TanStack Start", "Durable Objects", "Mysten dApp Kit", "Sui SDK"],
    highlights: [
      "CSV cleanup before the 10,000-wallet campaign cap",
      "One funding approval with backend payment execution",
      "Recovery paths for interrupted campaigns and fee top-ups",
    ],
  },
];

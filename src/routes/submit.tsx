import { createFileRoute } from "@tanstack/react-router";

const PAGE_TITLE = "Submit a project | Portfolio";
const PAGE_DESCRIPTION =
  "Propose a Sui project for review in the central Doji Registry after a fixed 10 SUI payment.";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: PAGE_TITLE },
      { name: "description", content: PAGE_DESCRIPTION },
      { name: "robots", content: "noindex,nofollow" },
    ],
    links: [{ rel: "canonical", href: "https://dogafincan.com/submit" }],
  }),
});

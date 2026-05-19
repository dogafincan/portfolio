import { createFileRoute } from "@tanstack/react-router";

const PAGE_TITLE = "Doga Fincan Portfolio";
const PAGE_DESCRIPTION =
  "I'm into learning languages, nutrition and exercise, and building cool things. Reach out if you're building something interesting.";
const SITE_URL = "https://portfolio.dogafincan.workers.dev";
const SOCIAL_IMAGE = `${SITE_URL}/og-image.png?v=2026052002`;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: PAGE_TITLE,
      },
      {
        name: "description",
        content: PAGE_DESCRIPTION,
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:url",
        content: SITE_URL,
      },
      {
        property: "og:title",
        content: PAGE_TITLE,
      },
      {
        property: "og:description",
        content: PAGE_DESCRIPTION,
      },
      {
        property: "og:image",
        content: SOCIAL_IMAGE,
      },
      {
        property: "og:image:secure_url",
        content: SOCIAL_IMAGE,
      },
      {
        property: "og:image:width",
        content: "1200",
      },
      {
        property: "og:image:height",
        content: "630",
      },
      {
        property: "og:image:alt",
        content: "Doga Fincan portfolio header with the portfolio logo and product subtitle.",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:site",
        content: "@dogafincan",
      },
      {
        name: "twitter:creator",
        content: "@dogafincan",
      },
      {
        name: "twitter:title",
        content: PAGE_TITLE,
      },
      {
        name: "twitter:description",
        content: PAGE_DESCRIPTION,
      },
      {
        name: "twitter:image",
        content: SOCIAL_IMAGE,
      },
      {
        name: "twitter:image:alt",
        content: "Doga Fincan portfolio header with the portfolio logo and product subtitle.",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: SITE_URL,
      },
    ],
  }),
});

import { createFileRoute } from "@tanstack/react-router";

const PAGE_TITLE = "Doga Fincan";
const PAGE_DESCRIPTION =
  "Developer interested in language learning, nutrition, exercise, and building useful products. Reach out if you're building something interesting.";
const SITE_URL = "https://dogafincan.com";
const SOCIAL_IMAGE = `${SITE_URL}/og.png?v=2026081401`;
const SOCIAL_IMAGE_ALT =
  "Doga Fincan social preview reading Explore the useful products I’m building, with I’m building highlighted in blue and a Follow Doga Fincan on X badge.";

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
        content: SOCIAL_IMAGE_ALT,
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
        content: SOCIAL_IMAGE_ALT,
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

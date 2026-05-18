import type { ReactNode } from "react";
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";

import interLatinWghtNormal from "@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url";
import appCss from "../styles.css?url";

const APP_CHROME_COLOR = "#b9d0f8";
const APP_CHROME_COLOR_DARK = "#3f8fc2";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Portfolio",
      },
    ],
    links: [
      {
        rel: "preload",
        href: interLatinWghtNormal,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16x16.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32x32.png",
      },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon.png",
      },
      {
        rel: "manifest",
        href: "/manifest.json",
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content={APP_CHROME_COLOR} media="(prefers-color-scheme: light)" />
        <meta
          name="theme-color"
          content={APP_CHROME_COLOR_DARK}
          media="(prefers-color-scheme: dark)"
        />
        <HeadContent />
      </head>
      <body className="bg-background">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

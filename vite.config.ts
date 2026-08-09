import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";

const isVitest = process.env.VITEST === "true";
const staticNotFoundOutputPath = fileURLToPath(new URL("./dist/client/404.html", import.meta.url));

async function removeStaticNotFoundJavaScript({ html }: { html: string }) {
  const staticHtml = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/giu, "")
    .replace(/<link\b(?=[^>]*\brel=(?:"modulepreload"|'modulepreload'))[^>]*>/giu, "");
  await writeFile(staticNotFoundOutputPath, staticHtml);
}

const config = defineConfig({
  fmt: {
    ignorePatterns: [
      "dist/**",
      "src/generated/registry-contract.validators.mjs",
      "src/routeTree.gen.ts",
      "worker-configuration.d.ts",
    ],
  },
  lint: {
    ignorePatterns: [
      "dist/**",
      "src/generated/registry-contract.validators.mjs",
      "src/routeTree.gen.ts",
      "worker-configuration.d.ts",
    ],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
  resolve: {
    tsconfigPaths: true,
    dedupe: ["react", "react-dom"],
    alias: isVitest
      ? {
          "cloudflare:workers": fileURLToPath(
            new URL("./src/test/cloudflare-workers-shim.ts", import.meta.url),
          ),
        }
      : undefined,
  },
  plugins: [
    ...(isVitest ? [] : [cloudflare({ viteEnvironment: { name: "ssr" } })]),
    tailwindcss(),
    tanstackStart({
      pages: [
        { path: "/" },
        { path: "/submit" },
        { path: "/og-preview" },
        {
          path: "/404.html",
          prerender: {
            autoSubfolderIndex: false,
            onSuccess: removeStaticNotFoundJavaScript,
            outputPath: "/404.html",
          },
        },
      ],
      prerender: {
        enabled: true,
        crawlLinks: false,
        failOnError: true,
      },
    }),
    viteReact(),
  ],
});

export default config;

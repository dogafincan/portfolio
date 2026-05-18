# AGENTS.md

## Project Overview

This repository will become a personal portfolio website for showcasing projects
built by Doga Fincan. It is a TanStack Start app whose `/` route now renders a
real project showcase with structured project data, sibling-derived UI
primitives, logo/social assets, and regression coverage for shared web-app
conventions.

The portfolio should reuse the proven stack and design direction from:

- `~/Documents/sui-snapshot`
- `~/Documents/sui-airdrop`

Those sibling apps are the reference for TanStack Start, Vite+, Cloudflare
Workers, shadcn/ui, Tailwind CSS v4, Inter, Lucide icons, shared mesh-gradient
chrome, and repo workflow conventions. The portfolio should keep the same
general system while avoiding Sui-specific runtime dependencies unless they are
explicitly needed.

## Working Rules

- Ground answers and changes in the current checkout. For this repo, first check
  `README.md`, `AGENTS.md`, git state, and any source/config files that exist.
- When borrowing a pattern from `sui-snapshot` or `sui-airdrop`, inspect the
  sibling docs or source first. Do not rely on memory alone for current behavior.
- Keep work to one coherent slice. Commit finished slices locally. Push only
  when the user explicitly asks.
- Keep `README.md` and `AGENTS.md` aligned when a durable project rule changes:
  `README.md` owns human-facing product/workflow guidance, while `AGENTS.md`
  owns agent-facing repo rules and verification expectations.
- Prefer narrow, in-place docs or implementation updates over broad speculative
  rewrites.
- Keep project content in `src/content/projects.ts` until there is a concrete
  need for MDX, a CMS, or separate case-study routes.
- Reuse the imported shadcn/Base UI primitives in `src/components/ui/*` before
  adding custom primitives.
- Do not add Sui wallet flows, transaction signing, Mysten SDK dependencies,
  Turnstile, rate limiting, Durable Objects, KV, D1, R2, queues, or backend
  state just because the sibling apps use them. A portfolio website should stay
  simpler unless a concrete feature requires that complexity.

## Current Stack

Use this as the current stack:

- Vite+
- TanStack Start
- TanStack Router
- React 19
- shadcn/ui on Base UI primitives
- shadcn `base-luma` style or preset
- Tailwind CSS v4
- Inter variable font via Fontsource
- Lucide for product UI icons
- Cloudflare Workers deployment
- Node.js `24.14.0` pinned through `.node-version` for local and Cloudflare
  Workers Builds
- npm package manager

Expected portfolio omissions unless explicitly justified:

- Mysten dApp Kit
- Mysten Sui SDK
- wallet connection
- transaction signing
- Cloudflare Durable Objects
- Cloudflare storage bindings
- public abuse-control gates
- Sui-specific validation or CSV processing

## Product Guidance

- Build a real project showcase, not a placeholder landing page.
- Show real project content early on the first screen.
- Present each project with a clear name, short description, role, status,
  stack, and relevant links.
- Use real product-owned visuals for project previews. Current project cards use
  the sibling apps' OG images because they show the shipped products.
- Use project detail or case-study pages only when a project needs the space.
- Explain technical work in plain language before implementation details.
- Avoid fake metrics, vague claims, and decorative sections that do not help a
  visitor evaluate the work.

## Shared Design System

Follow the reusable UI rules from `sui-snapshot` and `sui-airdrop` unless the
portfolio receives a deliberate product-specific exception.

- Use shadcn/ui on Base UI primitives, the `base-luma` style or preset,
  Tailwind CSS v4 tokens, Inter, and consistent component composition.
- Preload the concrete Fontsource Inter latin `woff2` asset from the root
  document before the stylesheet link. Add regression coverage once the app has
  a root document.
- Prefer existing shadcn components before custom primitives.
- Use the shared mesh-gradient page chrome in light and dark mode.
- Keep browser `theme-color`, safe-area colors, CSS variables, and manifest
  color values aligned with the mesh top color.
- Use the shared rounded-square logo container system. Only the inner glyph
  should be project-specific.
- Use app logo assets for favicons, install icons, and header logo sources.
- Render the header logo with explicit `width`, `height`, `sizes`, and `srcset`
  attributes.
- Use Lucide icons for interface actions and status cues.
- Keep clickable button targets at least 44px tall.
- Use outline buttons for visible workflow actions that are not the current
  primary action.
- Use cards for project items and repeated content. Do not nest cards inside
  cards; use muted shadcn `Item` surfaces for compact metadata inside cards.
- Keep typography readable and restrained: strong page title, concise subtitle,
  semibold card/item titles, and base-size descriptions.
- Make copy understandable to non-technical visitors. Say what the project does
  and why it matters before naming libraries or infrastructure.
- Support all viewport widths without text overflow, clipped buttons, or
  overlapping project metadata.
- Respect system dark mode. Do not add a manual theme switch unless requested.
- Build OG/social images from the dark-mode header composition only: logo, site
  title, and subtitle in white.
- Keep the portfolio home organized around structured content, project cards,
  and muted `Item` summaries. Add new surfaces by extending the existing content
  and component model before creating one-off markup.

Portfolio-specific adaptation:

- The site can be more editorial than the sibling utility apps, but the first
  screen must still lead with the project showcase or a clear path into it.
- Avoid oversized marketing sections, generic hero filler, and decorative
  content that delays access to projects.
- Favor polished, scannable project information over ornamental layout.

## Important Files

The current implementation follows the sibling conventions. Important files:

- `src/routes/index.tsx`: portfolio entry route and social metadata
- `src/routes/__root.tsx`: root document, app shell, font preload, manifest
  links, and theme-color metadata
- `src/routes/index.lazy.tsx`: visible portfolio route component attachment
- `src/styles.css`: global Tailwind v4 tokens, mesh background, and chrome color
  variables
- `src/styles.test.ts`: regression guard for the shared mesh-gradient CSS
- `src/components/portfolio-home.tsx`: portfolio header, project grid, and footer
- `src/components/portfolio-home.test.tsx`: rendering and structure coverage for
  the portfolio surface
- `src/content/projects.ts`: structured project records for the portfolio grid
- `src/components/icon-system.test.ts`: regression guard that keeps product
  icons on Lucide
- `src/components/ui/*`: imported shadcn/Base UI primitives used by the
  portfolio surface
- `src/lib/utils.ts`: shadcn `cn` helper
- `src/routes/-__root.test.ts`: regression guard for manifest links, app logo
  assets, Inter font preload ordering, and theme-color metadata
- `src/routes/-index.test.ts`: regression guard for canonical and social
  preview metadata
- `public/manifest.json`: PWA manifest colors and icons
- `public/app-logo.svg`, `public/app-logo-120.png`, `public/apple-touch-icon.png`,
  `public/android-chrome-*.png`, `public/favicon-*`, and `public/og-image.*`:
  portfolio-owned app and social assets
- `public/projects/*-og.png`: local thumbnails copied from shipped sibling app
  social images
- `vite.config.ts`: Vite+ and TanStack configuration
- `wrangler.jsonc`: Cloudflare Worker configuration
- `.node-version`: Node.js version pin used by local tooling and Cloudflare
  Workers Builds

## Local Commands

Prefer the sibling command pattern:

- `npx vp env setup`
- `npx vp install`
- `npx vp dev`
- `npx vp check`
- `npx vp test`
- `npx vp build`
- `npx vp preview --host 127.0.0.1`
- `npx vp run deploy`
- `npx vp run cf-typegen`

Invoke Vite+ through `npx vp ...` so the repo-local CLI is used even when `vp`
is not on the shell `PATH`.

Keep Cloudflare's `NODE_VERSION` build variable unset or aligned with
`.node-version`; the default Workers Builds Node version can fail before
`npx vp check` loads the TypeScript Vite config.

## Verification

For docs-only changes:

- `git diff --check`

For implementation changes:

- run the narrowest relevant tests first
- run `npx vp check`
- run `npx vp test` when behavior or rendering changes
- run `npx vp build` before claiming production readiness or deployability
- use browser smoke checks for visual or responsive UI changes

Do not claim a command passed unless it was run in the current checkout.

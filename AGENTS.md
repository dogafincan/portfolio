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
- `~/Documents/memedex`

Those sibling apps are the reference for TanStack Start, Vite+, Cloudflare
Workers, shadcn/ui, Tailwind CSS v4, Inter, Lucide icons, shared page chrome,
and repo workflow conventions. The portfolio should keep the same general system
while avoiding Sui-specific runtime dependencies unless they are explicitly
needed.

## Documentation Boundaries

- `README.md`: human-facing product, workflow, stack, deployment, and
  verification guidance.
- `AGENTS.md`: repo-local agent rules, command conventions, editing guidance,
  and verification expectations.
- `PRD.md`: product scope, implementation-progress table, settled product
  decisions, acceptance criteria, and pending slices.
- `DESIGN.md`: source of truth for visual system, layout, copy, icons, social
  preview, responsive behavior, loading states, and portfolio UI contracts.

Keep `README.md` and `AGENTS.md` aligned when durable project rules change. Keep
`PRD.md` and `DESIGN.md` aligned when product or UI decisions change.

## Working Rules

- Ground answers and changes in the current checkout. For this repo, first check
  `README.md`, `AGENTS.md`, `PRD.md`, `DESIGN.md`, git state, and any
  source/config files that exist.
- When borrowing a pattern from `sui-snapshot`, `sui-airdrop`, or `memedex`,
  inspect the sibling docs or source first. Do not rely on memory alone for
  current behavior.
- Keep work to one coherent slice. Commit finished slices locally. Push only
  when the user explicitly asks.
- Keep durable docs aligned when a project rule changes: `README.md` owns
  human-facing product/workflow guidance, `AGENTS.md` owns agent-facing repo
  rules and verification expectations, `PRD.md` owns product scope/progress, and
  `DESIGN.md` owns visual/layout/copy/icon contracts.
- Prefer narrow, in-place docs or implementation updates over broad speculative
  rewrites.
- Keep project content in `src/content/projects.ts` until there is a concrete
  need for MDX, a CMS, or separate case-study routes.
- Reuse the imported shadcn/Base UI primitives in `src/components/ui/*` before
  adding custom primitives.
- Use `DESIGN.md` as the source of truth for UI, copy, icon, layout, alert,
  social-preview, responsive, and loading-state rules instead of duplicating
  that guidance here.
- For page-background transition changes, inspect `src/styles.css`,
  `src/routes/__root.tsx`, `public/manifest.json`, `src/styles.test.ts`,
  `src/routes/-__root.test.ts`, and any checked-in page-atmosphere assets together. Follow
  `DESIGN.md`'s `Header Section / Atmosphere-to-Page Background` for browser
  browser/mobile safe-area color handling, edge-to-edge viewport meta, shared
  `theme-color`, iOS top-edge tint sampling, root/body backgrounds, visible page
  chrome, fixed-length top atmosphere fade, light/dark page-atmosphere assets,
  and OG/social image generation. Do this without changing workbench or card
  surface tokens.
- When work is product-scope driven, inspect the `PRD.md` implementation
  progress table first and update it precisely with `Done`/`Pending` status.
- Do not add Sui wallet flows, transaction signing, Mysten SDK dependencies,
  Turnstile, rate limiting, Durable Objects, KV, D1, R2, queues, or backend
  state just because the sibling apps use them. A portfolio website should stay
  simpler unless a concrete feature requires that complexity.
- Do not add Memedex voting, ranking, moderation, submission, or discovery-board
  flows to the portfolio. The portfolio may link to Memedex as a project, but
  its own route stays a project showcase.

## Agent Workflow Defaults

- Start by identifying the user's intended mode: `analysis-only`, `implement`, or
  `diagnose`. Stay read-only for writeups, architecture comparisons, status
  checks, and "do not write code" requests until the user explicitly asks for
  changes.
- Ground current-behavior answers in the checkout, not memory alone. Inspect the
  relevant content module, component, route, test, `wrangler.jsonc`, `README.md`,
  `AGENTS.md`, `PRD.md`, and `DESIGN.md` before describing shipped behavior.
- Keep implementation work to one coherent slice. When work is PRD-driven,
  inspect the top `PRD.md` implementation-progress table first, use it as the
  slice boundary, and update it without claiming broad PRD sections are complete.
- If a sibling repo already fixed the same issue, inspect that implementation
  before designing a new one. Reuse the pattern only where it fits this repo's
  portfolio scope; do not import snapshot holder-query behavior, airdrop
  funding, transfer signing, Turnstile, Durable Objects, wallet flows, or
  Memedex voting/ranking behavior.
- Durable workflow, product, and UI rules belong in docs when they repeat. Keep
  `README.md`, `AGENTS.md`, `PRD.md`, and `DESIGN.md` aligned by ownership.
- For browser, deploy, auth/config, provider, dynamic-content, or other
  third-party recoverable errors that become visitor-facing or docs-facing,
  follow `DESIGN.md`'s reusable third-party error pattern instead of inventing
  one-off failure copy. This repo currently has no wallet-specific
  implementation.
- For deploy, runtime, Cloudflare, or performance incidents, diagnose the failing
  layer before editing source. If local checks passed and the failure is in
  deploy validation, auth/config, dashboard setup, or provider response, verify
  that layer before creating source changes.
- Preserve user changes in the worktree. Check `git status --short --branch`
  before edits and before committing.
- Commit finished work that warrants a commit in focused local commits unless the
  user says not to. Split unrelated changes into reviewable commits, but do not
  force artificial splits for one cohesive docs or behavior change. Push only
  when the user explicitly asks, and after pushing confirm
  `git rev-list --left-right --count origin/main...HEAD` returns `0 0`.
- When browser automation creates local artifacts, clean or isolate them before
  the final status, verification, and commit flow.
- Preserve the social preview contract in `src/routes/index.tsx`. Open Graph and
  X/Twitter image tags must use absolute HTTPS URLs, not root-relative paths,
  and must point to `public/og.png` with a cache-busting query. If
  `public/og.png` changes, update `SITE_URL`, the `SOCIAL_IMAGE`
  cache-busting query, and `src/routes/-index.test.ts` together. Regenerate the
  image with `npm run generate:og`; do not add a social SVG source or dynamic
  request-time image endpoint.

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
- Present each project with a product icon, clear name, short subtitle, and a
  live app link.
- Keep project cards intentionally compact for now. Move role, status, stack,
  implementation highlights, and larger product visuals into future case-study
  pages if the portfolio needs that depth.
- Use project detail or case-study pages only when a project needs the space.
- Explain technical work in plain language before implementation details.
- Avoid fake metrics, vague claims, and decorative sections that do not help a
  visitor evaluate the work.

## Shared Design System

Follow `DESIGN.md` for visual, layout, copy, icon, social-preview, responsive,
and interaction rules. The short version: keep real project content first, use
the shared sibling UI system, keep the rounded muted workbench and project cards
scannable, avoid decorative filler, and do not import Sui-specific workflow UI
unless the portfolio scope deliberately changes.

## Important Files

The current implementation follows the sibling conventions. Important files:

- `PRD.md`: portfolio product scope, implementation progress, acceptance
  criteria, and pending slices
- `DESIGN.md`: visual system and portfolio-specific UI contracts
- `src/routes/index.tsx`: portfolio entry route and social metadata
- `src/routes/__root.tsx`: root document, app shell, viewport meta, font
  preload, manifest links, and theme-color metadata
- `src/routes/index.lazy.tsx`: visible portfolio route component attachment
- `src/styles.css`: global Tailwind v4 tokens, page chrome, and chrome color
  variables
- `src/styles.test.ts`: regression guard for the shared page chrome CSS
- `src/components/portfolio-home.tsx`: portfolio header and project grid
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
- `public/app-logo-120.png`, `public/apple-touch-icon.png`,
  `public/android-chrome-*.png`, `public/favicon.ico`, `public/favicon-*`, and
  `public/og.png`: portfolio-owned app and social assets
- `public/projects/*-icon.avif`: local app icons copied from shipped sibling apps
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

- `npx vp check`
- `git diff --check`

For implementation changes:

- run the narrowest relevant tests first
- run `npx vp check`
- run `npx vp test` when behavior or rendering changes
- run `npx vp build` before claiming production readiness or deployability
- use browser smoke checks for visual or responsive UI changes

For rendered frontend QA, use the in-app Browser or a local browser smoke script
first when available. Use an alternate browser service such as Playwright or a
Chrome-backed target only when the preferred browser path is unavailable,
blocked, or cannot collect the required evidence, and record the fallback reason
with the verification notes.

Do not claim a command passed unless it was run in the current checkout.

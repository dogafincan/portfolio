# AGENTS.md

## Project Overview

This repository will become a personal portfolio website for showcasing projects
built by Doga Fincan. It is a TanStack Start app whose `/` route now renders a
real project showcase with structured project data, sibling-derived UI
primitives, logo/social assets, and regression coverage for shared web-app
conventions.

The canonical UI source is the versioned `doji-design-system` Codex skill in
the separate Doji design-system repository. Runtime components remain local;
after an accepted canonical change, the owner manually invokes the skill to
audit and synchronize each Doji app. There is no shared runtime package or
automatic cross-repository mutation.

## Documentation Boundaries

- `README.md`: human-facing product, workflow, stack, deployment, and
  verification guidance.
- `AGENTS.md`: repo-local agent rules, command conventions, editing guidance,
  and verification expectations.
- `PRD.md`: product scope, implementation-progress table, settled product
  decisions, acceptance criteria, and pending slices.
- `DESIGN.md`: source of truth for visual system, layout, copy, icons, social
  preview, responsive behavior, loading states, and portfolio UI contracts.
- `docs/production-runbook.md`: release, static-boundary, and network-call
  checks.

Keep `README.md` and `AGENTS.md` aligned when durable project rules change. Keep
`PRD.md` and `DESIGN.md` aligned when product or UI decisions change.

## Working Rules

- Ground answers and changes in the current checkout. For this repo, first check
  `README.md`, `AGENTS.md`, `PRD.md`, `DESIGN.md`, git state, and any
  source/config files that exist.
- Keep visitor-facing project names and subtitles synchronized exactly with the
  source apps and blockchain-neutral while the destination-chain product
  contract is unresolved. Source-app primary copy leads with its intended
  user's outcome, useful signal, and next action; Portfolio preserves that exact
  copy rather than substituting implementation-led summaries. Stable technical
  identifiers may remain Sui-specific.
- Before UI, copy, layout, icon, responsive, state, 404, or social-preview
  work, read the canonical design-system skill completely and then
  `DESIGN.md`. Product behavior remains local; shared visual policy comes from
  the skill rather than an arbitrary sibling snapshot.
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
- For page/chrome changes, inspect `src/styles.css`,
  `src/styles/geist-colors.css`, `src/routes/__root.tsx`,
  `public/manifest.json`, and their tests together. Preserve the canonical
  solid neutral canvas, raised chrome, safe-area, and overscroll contract. Do
  not reintroduce atmosphere or decorative page backgrounds.
- When work is product-scope driven, inspect the `PRD.md` implementation
  progress table first and update it precisely with `Done`/`Pending` status.
- Keep wallet and Sui code out of the initial static route chunk. Load it only
  after an explicit wallet interaction. Do not add Sui providers, storage,
  Durable Objects, KV, D1, R2, queues, or signing keys to the public Worker.
- While the migration lock is active, production deploys the assets-only
  `wrangler.assets.jsonc`, with no Worker entrypoint or runtime binding.
  Retained backend handlers remain testable as defense in depth, but public
  deploys and dry-runs must not use `dist/server/wrangler.json`.
- Project fields and images remain in page memory until the fixed Registry
  payment succeeds. Do not persist drafts or make validation/prefill API calls.
- A payment challenge is allowed only after a digest exists and must bind the
  exact digest and paying wallet. Do not add pre-payment intent calls,
  `waitForTransaction`, Sui polling, or browser-selected RPC endpoints.
- Static load, form edit, image validation, wallet connection, and status
  display make zero Portfolio-originated Sui requests. Keep payment execution
  on dApp Kit's wallet-standard action; Portfolio must not add a direct
  transaction-execution call.
- Registry-generated files under `src/generated/` are canonical handoff
  artifacts. Update them byte-for-byte from Registry; do not hand-edit local
  variants.
- The public gateway exposes only the three exact Registry submission paths.
  Preserve the pre-router envelope guard, same-origin enforcement, rate-limit
  fuses, and narrow service binding. Reject every non-empty
  `Content-Encoding`, and require a canonical declared length for multipart
  uploads before a limiter or binding.
- Keep challenge traffic on the public limiter lane and redemption/upload on
  both the public and tighter paid lanes. The conservative binding-operation
  ceilings are three for challenge and five for redemption or upload.
- During the temporary Sui-to-Robinhood Chain migration lockout, preserve the
  existing Sui implementation but keep it unreachable. Do not mount the wallet
  runtime; keep locked ordinary actions visually enabled and inert with an
  informational Alert after each complete action cluster; and return the
  canonical migration `503` before every public dynamic entry point reaches an
  envelope guard, limiter, service binding, provider, or mutation.
- Do not place a migration Alert below **Connect wallet**, a project/asset
  selector trigger, or a shared cluster containing either. Their enabled-looking
  trigger opens the existing surface, whose Empty state alone explains the
  migration.
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
- If another Doji repo already implements a canonical recipe, it may be used as
  implementation evidence after reading the skill. Reuse it only where it fits
  Portfolio's scope; do not import snapshot, airdrop, swap, or ranking behavior.
- Durable workflow, product, and UI rules belong in docs when they repeat. Keep
  `README.md`, `AGENTS.md`, `PRD.md`, and `DESIGN.md` aligned by ownership.
- For browser, deploy, auth/config, provider, dynamic-content, or other
  third-party recoverable errors that become visitor-facing or docs-facing,
  follow `DESIGN.md`'s reusable third-party error pattern instead of inventing
  one-off failure copy. Paid submission recovery must tell the user not to pay
  again once a digest exists.
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
  image with `npx vp run generate:og`; keep it an 8-bit truecolor RGB PNG for
  broad social-crawler compatibility, and do not add a social SVG source or
  dynamic request-time image endpoint.

## Current Stack

Use this as the current stack:

- Vite+
- TanStack Start
- TanStack Router
- React 19
- shadcn/ui on Base UI primitives
- shadcn `base-luma` style or preset
- Tailwind CSS v4
- Geist variable font via Fontsource
- Lucide for product UI icons
- Cloudflare Workers deployment
- Node.js `24.14.0` pinned through `.node-version` for local and Cloudflare
  Workers Builds
- npm package manager

The retained, temporarily unreachable Sui runtime is limited to:

- interaction-gated Mysten dApp Kit and Sui SDK
- wallet connection and a fixed 10 SUI Registry payment on `/submit`
- a fresh personal-message proof for paid submission/recovery

Expected portfolio omissions:

- Cloudflare Durable Objects
- Cloudflare storage bindings
- Sui provider or signing-key bindings in the public Worker
- Sui CSV, snapshot, airdrop, or swap processing

## Product Guidance

- Build a real project showcase, not a placeholder landing page.
- Show real project content early on the first screen.
- Present each project with revision-named local light/dark copies of its
  current transparent product logo, the exact compact navbar name, the exact
  complete primary-page subtitle, and a live app link whose label ends with the
  shared trailing `ArrowUpRight` new-tab affordance. Keep the project in the
  standard muted `Item` and its logo in the 48px avatar/image `ItemMedia`.
- Keep project cards intentionally compact for now. Move role, status, stack,
  implementation highlights, and larger product visuals into future case-study
  pages if the portfolio needs that depth.
- Use project detail or case-study pages only when a project needs the space.
- Explain technical work in plain language before implementation details.
- Avoid fake metrics, vague claims, and decorative sections that do not help a
  visitor evaluate the work.

## Shared Design System

Follow the canonical design-system skill and `DESIGN.md` for visual, layout,
copy, icon, social-preview, responsive, and interaction rules. Keep real
project content first, use standard Cards directly on the neutral page canvas,
avoid decorative filler and nested card-like workbenches, and keep the shared
paid-submission workflow consistent across Doji apps.

## Important Files

The current implementation follows the sibling conventions. Important files:

- `PRD.md`: portfolio product scope, implementation progress, acceptance
  criteria, and pending slices
- `DESIGN.md`: visual system and portfolio-specific UI contracts
- `src/routes/index.tsx`: portfolio entry route and social metadata
- `src/routes/__root.tsx`: root document, app shell, font preload, manifest
  links, and theme-color metadata
- `src/routes/index.lazy.tsx`: visible portfolio route component attachment
- `src/styles.css`: global Tailwind v4 tokens, page chrome, and chrome color
  variables
- `src/styles/geist-colors.css`: byte-identical canonical Geist palette
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
- `src/lib/submission-api.ts`: exact bounded client for paid Registry submission
  and digest recovery
- `src/lib/chain-migration.ts` and `src/lib/chain-migration.server.ts`:
  temporary shared frontend copy and fail-closed server response
- `src/generated/*`: canonical Registry-generated types and validators
- `src/start.ts`: pre-router API envelope guard and broad server-function block
- `src/routes/-__root.test.ts`: regression guard for manifest links, app logo
  assets, Geist font preload ordering, and theme-color metadata
- `src/routes/-index.test.ts`: regression guard for canonical and social
  preview metadata
- `public/manifest.json`: PWA manifest colors and icons
- `public/app-logo-120.png`, `public/apple-touch-icon.png`,
  `public/android-chrome-*.png`, `public/favicon.ico`, `public/favicon-*`, and
  `public/og.png`: portfolio-owned app and social assets
- `public/projects/*-logo-{light,dark}-<revision>.png`: immutable local copies
  of the current transparent sibling-app logos; `DESIGN.md` records provenance
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
- `npx vp run generate:identity`
- `npx vp run generate:og`
- `npx vp run deploy`
- `npx vp run cf-typegen`

The type-generation wrapper always uses the exact `wrangler.jsonc`
configuration with `/dev/null` as its env file and strips only whitespace-only
generated-line noise before the diff gate.

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

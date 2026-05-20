# Portfolio

Personal portfolio website for showcasing projects built by Doga Fincan.

This repo started documentation-first and now renders a real portfolio index.
The first implemented surface showcases built projects, links to live targets
when available, and carries over the shared TanStack Start, shadcn/ui, Tailwind,
Inter, Lucide, mesh-chrome, social-preview, and verification conventions from
the sibling apps in `~/Documents/sui-snapshot` and `~/Documents/sui-airdrop`.

## Documentation Map

Use the same durable documentation split as the sibling apps:

- `README.md`: human-facing product, workflow, stack, deployment, and
  verification guidance.
- `AGENTS.md`: repo-local agent rules, command conventions, and verification
  expectations.
- `PRD.md`: settled product scope, implementation progress, acceptance criteria,
  and pending product slices.
- `DESIGN.md`: visual system, layout, copy, icon, social preview, responsive,
  and interaction contracts.

## Product Direction

The site should make the projects the main surface, not hide them behind a
generic landing page. A visitor should quickly understand what each project
does and where to try it when a live surface is available.

Expected content:

- project index for built work outside the portfolio site itself
- compact X and GitHub profile links in the header
- focused project cards with product icon, name, short subtitle, and a live app
  link
- project detail or case-study pages when a project needs more context
- concise explanations of technical decisions in plain language
- contact or profile links only where they support the portfolio goal

Avoid fake metrics, vague claims, and decorative sections that do not help a
visitor evaluate the work.

Current content lives in `src/content/projects.ts`. Prefer editing that
structured module before scattering project data through components. A CMS,
MDX, or separate case-study route should wait until the project list outgrows
the current static content shape.

## Reference Projects

Use these sibling repos as the current source of truth for shared workspace
patterns:

- `~/Documents/sui-snapshot`
- `~/Documents/sui-airdrop`

Relevant shared guidance from those projects:

- `README.md` is for human-facing product, workflow, and operating guidance.
- `AGENTS.md` is for repo-local agent rules, command conventions, and
  verification expectations.
- `PRD.md` is for settled product decisions, acceptance criteria, and progress
  slices when a repo needs that level of product tracking.
- `DESIGN.md` is the durable source of truth for shared visual/layout/copy/icon
  guidance.
- Keep changes to one coherent slice and commit finished slices locally.
- Ground decisions in the current checkout and sibling source/docs before
  relying on assumptions.
- Reuse sibling patterns when they already solved the same design or workflow
  problem, while keeping product boundaries explicit.
- Import the portable UI layer from siblings before inventing new primitives:
  shadcn `Button`, `Card`, `Badge`, `Item`, `Separator`, root-head metadata
  tests, icon-system tests, and mesh-style tests fit this portfolio. Sui wallet,
  CSV, Durable Object, Turnstile, and transaction code does not.

## Current Stack

The app uses the same core web stack as `sui-snapshot` and `sui-airdrop`,
trimmed for a portfolio site:

- Vite+
- TanStack Start
- TanStack Router
- React 19
- shadcn/ui on Base UI primitives
- shadcn `base-luma` style or preset
- Tailwind CSS v4
- Inter variable font through Fontsource
- Lucide for product UI icons
- Cloudflare Workers for deployment
- Node.js `24.14.0` pinned through `.node-version` for local and Cloudflare
  Workers Builds
- npm as the package manager

Do not add Sui-specific libraries by default. The portfolio can link to and
describe Sui projects, but it should not include Mysten dApp Kit, the Mysten Sui
SDK, wallet connection, transaction signing, Turnstile, rate limiting, Durable
Objects, KV, D1, R2, queues, or backend state unless a future portfolio feature
clearly needs them.

## Product Constraints

- Public portfolio website.
- No app-level auth.
- No wallet requirement.
- No transaction signing.
- No server-held secrets for normal portfolio content.
- Prefer repo-owned structured content for project data before adding a CMS.
- Keep the first route useful on its own: visitors should see real project
  content immediately.
- Keep implementation smaller than the sibling utility apps unless a portfolio
  feature needs the extra complexity.
- Use product-owned app icons in project cards. Keep deeper visuals, stack
  details, and implementation notes for future case-study pages. The portfolio
  site should not list itself as one of its own products.

## Shared Web App Design System

The full visual system lives in `DESIGN.md`. In short, the portfolio should feel
like it belongs to the same family as `sui-snapshot` and `sui-airdrop`, while
adapting the pattern to a project showcase instead of a workflow utility.

Design principles that should remain visible in day-to-day work:

- Show real project content early.
- Use the shared mesh chrome, app logo system, Inter preload, Lucide icons,
  shadcn/Base UI primitives, and rounded muted workbench.
- Treat the mesh chrome as app identity: safe areas, theme color, manifest
  color, and the visible page background at the top and bottom of the app match
  the top of the mesh in both light and dark mode.
- Keep project cards scannable, responsive, and backed by structured content.
- Explain what projects do before naming libraries or infrastructure.
- Avoid generic hero filler, decorative principles sections, fake metrics, and
  card nesting.

## Code Organization

The imported sibling organization now used here:

- `PRD.md`: product scope, implementation progress, pending slices, and
  acceptance criteria.
- `DESIGN.md`: visual system and portfolio-specific UI contracts.
- `src/content/projects.ts`: structured project records for the portfolio grid.
- `src/components/portfolio-home.tsx`: the `/` route surface, including the
  header and project card grid.
- `src/components/ui/button.tsx`, `card.tsx`, `badge.tsx`, `item.tsx`, and
  `separator.tsx`: the portable shadcn/Base UI primitives copied from the
  sibling apps.
- `src/routes/-__root.test.ts`: regression guard for app chrome, manifest
  links, Inter preload ordering, and icon metadata.
- `src/routes/-index.test.ts`: regression guard for canonical URL and
  Open Graph/X metadata.
- `src/styles.test.ts`: regression guard for the shared CSS-only mesh chrome.
- `src/components/icon-system.test.ts`: regression guard that keeps product UI
  icons on Lucide.
- `public/app-logo-120.png`, `public/apple-touch-icon.png`,
  `public/android-chrome-*.png`, `public/favicon.ico`, `public/favicon-*`, and
  `public/og-image.*`: portfolio-owned logo and social assets.
- `public/projects/*-icon.png`: local app icons copied from the shipped sibling
  apps.

## Local Commands

Use the sibling command style:

- `npx vp env setup`
- `npx vp install`
- `npx vp dev`
- `npx vp check`
- `npx vp test`
- `npx vp build`
- `npx vp preview --host 127.0.0.1`
- `npx vp run deploy`
- `npx vp run cf-typegen`

The default dev server script uses port `3000`.

Cloudflare Workers Builds should respect `.node-version`. If the dashboard has
a `NODE_VERSION` build variable, keep it aligned with the file so `npx vp check`
can load `vite.config.ts` during deployment.

## Working With Codex

When using Codex on this repo, start each task with the repo path, the intended
mode, and the git policy. Useful modes are `analysis-only` for read-only
writeups, `implement` for focused code/docs changes, and `diagnose` for runtime,
deploy, or performance incidents.

- Ground answers in the current checkout. For behavior, architecture, format, or
  status questions, inspect source, tests, config, and docs before relying on
  memory or sibling assumptions.
- Keep implementation work to one coherent slice. When `PRD.md` drives the work,
  use the implementation-progress table as the slice boundary and update it
  without overstating what shipped.
- Reuse sibling repo patterns when the sibling already solved the same problem,
  but keep repo boundaries explicit. `sui-snapshot` owns snapshot export,
  `sui-airdrop` owns wallet funding and airdrop execution, and this repo owns
  the portfolio showcase.
- If a durable rule repeats, document it in the right file: `README.md` for
  human-facing workflow/product guidance, `AGENTS.md` for agent rules,
  `PRD.md` for product scope/progress, and `DESIGN.md` for visual/copy rules.
- Finished work that warrants a commit should be committed in focused local
  commits. Push only when explicitly requested, then confirm upstream sync with
  `git rev-list --left-right --count origin/main...HEAD`.

## Deployment

1. Authenticate once with `npx wrangler login`.
2. Keep `.node-version` and any Cloudflare `NODE_VERSION` build variable aligned
   to `24.14.0`.
3. Run `npx vp check`, `npx vp test`, and `npx vp build` before claiming
   production deployability.
4. Deploy with `npx vp run deploy`.
5. Regenerate Worker types with `npx vp run cf-typegen` after Worker binding or
   environment-shape changes.

The current Worker has no storage bindings, Durable Objects, queues, or secrets.
Add those only after the feature is accepted in `PRD.md` and documented in
`README.md` and `AGENTS.md`.

## Verification

For docs-only changes, run:

```bash
npx vp check
git diff --check
```

For behavior or rendering changes, run:

```bash
npx vp check
npx vp test
npx vp build
```

Use a browser smoke check for visible UI, responsive layout, social-preview, or
metadata changes. Do not claim a command passed unless it was run in the current
checkout.

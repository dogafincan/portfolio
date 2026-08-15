# Portfolio

Personal portfolio website for showcasing projects built by Doga Fincan.

This repo started documentation-first and now renders a real portfolio index.
The first implemented surface showcases built projects, links to live targets
when available, and uses the shared TanStack Start, shadcn/ui, Tailwind, Geist,
Lucide, neutral page chrome, social-preview, and verification conventions from
the canonical Doji Design System.

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
- focused project cards with the current scheme-matched product logo, navbar
  name, complete primary-page subtitle, and a live app
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

## Shared Project Conventions

The canonical visual source is the versioned `doji-design-system` Codex skill
in the separate Doji design-system repository. Runtime components remain local
and the owner manually runs the skill after each accepted canonical change.
Relevant shared guidance:

- `README.md` is for human-facing product, workflow, and operating guidance.
- `AGENTS.md` is for repo-local agent rules, command conventions, and
  verification expectations.
- `PRD.md` is for settled product decisions, acceptance criteria, and progress
  slices when a repo needs that level of product tracking.
- `DESIGN.md` is the durable source of truth for shared visual/layout/copy/icon
  guidance.
- Keep changes to one coherent slice and commit finished slices locally.
- Ground decisions in the current checkout and canonical skill before relying
  on assumptions.
- Reuse a sibling implementation only as evidence of the canonical pattern and
  keep product boundaries explicit.
- Prefer the local canonical primitives before inventing new ones.
  The central Doji project-submission flow is the one deliberate Sui workflow
  in this repo; snapshot, airdrop, swap, and Memerank-specific behavior remains
  in the apps that own it.

## Current Stack

The app uses the shared Doji web stack, trimmed for a portfolio site:

- Vite+
- TanStack Start
- TanStack Router
- React 19
- shadcn/ui on Base UI primitives
- shadcn `base-luma` style or preset
- Tailwind CSS v4
- Geist variable font through Fontsource
- Lucide for product UI icons
- Cloudflare Workers for deployment
- Node.js `24.14.0` pinned through `.node-version` for local and Cloudflare
  Workers Builds
- npm as the package manager

The `/submit` feature retains Mysten dApp Kit and the Sui SDK behind the
interaction boundary for later migration work. During the temporary
Sui-to-Robinhood Chain lockout, the app does not mount that wallet runtime even
after **Connect wallet** is activated. Anonymous portfolio and form loads remain
prerendered static assets. Production uses `wrangler.assets.jsonc`, which has no
Worker script or runtime binding; dynamic URLs receive the static 404 boundary
without paid Worker execution. The preserved backend Worker owns no storage or
Sui provider binding. Its dormant dynamic surface is a same-origin, rate-limited,
three-route proxy to the central Registry service, currently preceded by one
temporary fail-closed migration response.

## Network and cost boundary

Static page loads, form editing, local image validation, wallet connection, and
status display make zero Portfolio-originated Sui or application API requests.
The fixed-fee payment uses dApp Kit's wallet-standard sign-and-execute action;
the SDK may use its configured client while preparing transaction bytes, but
Portfolio makes no separate direct execution request and never polls Sui.
Registry—not Portfolio—performs the single-digest payment observation behind
the private service binding.

The challenge route spends at most two Cloudflare rate-limit operations and one
Registry service-binding operation. Redemption and the capability-authorized
upload use both public and tighter paid client/location fuses, for at most four
rate-limit operations and one service-binding operation. Invalid envelopes are
rejected before any of them.

## Temporary chain migration lockout

Portfolio keeps static pages, project cards, profile links, and live app links
available while Doji migrates from Sui to Robinhood Chain. The previous Sui
wallet, payment, recovery, API, and Registry-gateway implementation remains in
the repository for later migration rather than being deleted.

- **Connect wallet** keeps its normal enabled appearance and opens the existing
  Drawer. The Drawer shows an Empty migration explanation and **Close**, with no
  wallet choices, chain controls, or wallet-runtime load. No migration Alert
  appears below the trigger or its shared header-action cluster.
- **Pay 10 SUI** and **Recover payment** retain their normal labels and focus
  treatment. They are inert and their owning action cluster shows one persistent
  informational Alert.
- Portfolio has no project or asset selector trigger, so a selector migration
  Drawer is not applicable. A future locked selector would explain the migration
  only in its Empty surface, without an Alert below its trigger.
- Retained public dynamic API and broad server-function handlers return the
  same no-store JSON `503` migration response before envelope processing, rate
  limits, service bindings, providers, or mutations when tested or deliberately deployed.

## Product Constraints

- Public portfolio website.
- No app-level account system.
- The project showcase and form editing require no wallet.
- Wallet connection and transaction signing happen only for the fixed 10 SUI
  project-submission payment or paid-digest recovery proof.
- No server-held secrets for normal portfolio content.
- Prefer repo-owned structured content for project data before adding a CMS.
- Keep the first route useful on its own: visitors should see real project
  content immediately.
- Keep implementation smaller than the sibling utility apps unless a portfolio
  feature needs the extra complexity.
- Keep the showcase repo-owned; central Registry data does not replace or
  automatically populate the portfolio project cards.
- Keep project fields and the image in page memory only until payment succeeds.
- Keep the Registry treasury address deliberately unconfigured until the owner
  supplies the first generated publication; new payments fail closed meanwhile.
- Use checked-in, revision-named light/dark copies of each product's current
  transparent logo in project cards. Keep each project in a muted `Item` and
  place the logo inside its standard 48px avatar/image media container. Copy
  the navbar name and complete primary subtitle from the same source revision.
  Keep deeper visuals, stack details, and implementation notes for future
  case-study pages. The portfolio site should not list itself as one of its own
  products.

## Shared Web App Design System

The canonical visual system lives in the versioned Doji Design System skill;
Portfolio's product-specific adoption contract lives in `DESIGN.md`.

Design principles that should remain visible in day-to-day work:

- Show real project content early.
- Use the solid neutral canvas, raised chrome, app logo system, Geist preload,
  Lucide icons, and local shadcn/Base UI primitives.
- Treat `DESIGN.md` as the source of truth for safe-area handling, neutral
  platform metadata, overscroll, page-header identity, standard Cards, and
  social-image generation. Do not add atmosphere or decorative backgrounds.
- Keep project cards scannable, responsive, and backed by structured content.
- Explain what projects do before naming libraries or infrastructure.
- Avoid generic hero filler, decorative principles sections, fake metrics, and
  card nesting.

## Social Preview

The `/` route declares Open Graph and X/Twitter Card metadata in
`src/routes/index.tsx`. The social image is `public/og.png`, a generated
checked-in 1200x630 PNG from the React/Tailwind `/og-preview` route.
Regenerate it with `npx vp run generate:og`; do not add a social SVG source or
dynamic request-time image endpoint.

Keep social preview image URLs absolute HTTPS URLs. X may not render card
images from root-relative values such as `/og.png`, even when the asset is
publicly reachable. If the deployed domain changes, update `SITE_URL`,
`SOCIAL_IMAGE`, and the expectations in `src/routes/-index.test.ts`.

If `public/og.png` changes, also update the cache-busting query parameter
in `SOCIAL_IMAGE`. X caches card metadata and card images; after deploying
metadata changes, refresh with the X Card Validator when available, or share a
fresh URL such as `/?card=YYYYMMDD` or a new short URL so X treats the card as a
new fetch.

## Code Organization

The imported sibling organization now used here:

- `PRD.md`: product scope, implementation progress, pending slices, and
  acceptance criteria.
- `DESIGN.md`: visual system and portfolio-specific UI contracts.
- `src/content/projects.ts`: structured project records for the portfolio grid.
- `src/components/portfolio-home.tsx`: the `/` route surface, including the
  header and project card grid.
- `src/components/project-submission-form.tsx`: local-only form, payment, and
  paid-digest recovery UI for `/submit`.
- `src/components/wallet-runtime.tsx`: interaction-gated Mysten wallet island.
- `src/start.ts`: cheapest exact-path request envelope and broad server-function
  rejection.
- `src/lib/registry-submission-gateway.server.ts`: narrow abuse-controlled
  Registry service-binding proxy.
- `src/generated/*`: byte-identical Registry-generated manifest types and
  runtime validators; never hand-edit them.
- `src/config/development-publication.json`: checked-in fail-closed publication
  used until the owner supplies production wallet addresses.
- `src/lib/submission-api.ts`: bounded, exact-response client for the
  digest-bound challenge, redemption, idempotent receipt, and one image upload.
- `src/components/ui/*`: local shadcn/Base UI primitives synchronized through
  the canonical design-system skill.
- `src/routes/-__root.test.ts`: regression guard for app chrome, manifest
  links, Geist preload ordering, and icon metadata.
- `src/routes/-index.test.ts`: regression guard for canonical URL and
  Open Graph/X metadata.
- `src/styles.test.ts`: regression guard for the shared page chrome CSS.
- `src/components/icon-system.test.ts`: regression guard that keeps product UI
  icons on Lucide.
- `public/app-logo-120.png`, `public/apple-touch-icon.png`,
  `public/android-chrome-*.png`, `public/favicon.ico`, `public/favicon-*`, and
  `public/og.png`: portfolio-owned logo and social assets.
- `public/projects/*-logo-{light,dark}-<revision>.png`: local, immutable copies
  of the shipped sibling apps' current transparent light/dark logos.

## Local Commands

Use the sibling command style:

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
- Use the canonical skill before borrowing a sibling implementation, and keep
  repo boundaries explicit. Other apps own snapshot, airdrop, swap, and ranking
  behavior; this repo owns the portfolio showcase.
- If a durable rule repeats, document it in the right file: `README.md` for
  human-facing workflow/product guidance, `AGENTS.md` for agent rules,
  `PRD.md` for product scope/progress, and `DESIGN.md` for visual/copy rules.
- Visitor-facing recoverable provider/browser errors follow the shared
  third-party pattern from `DESIGN.md`: name the outside service when known,
  show safe human-readable outside guidance by default, and fall back to generic
  app-owned next steps when the outside message is missing or unsafe.
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
   environment-shape changes. The wrapper isolates Wrangler from local env files
   and strips only whitespace-only noise from the generated declaration.

The Worker has no storage bindings, Durable Objects, queues, Sui provider, or
signing secrets. It has one narrow Registry service binding, four rate-limit
bindings, and Static Assets. Wallet addresses remain intentionally blank until
the owner supplies them; do not activate or deploy the paid flow before the
generated Registry publication is present and all release checks pass.

The complete pre-release and browser-network procedure is in
`docs/production-runbook.md`.

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

# Portfolio

Personal portfolio website for showcasing projects built by Doga Fincan.

This repo is intentionally starting as documentation-first. The app has not
been scaffolded yet; the first implementation pass should use the sibling
projects in `~/Documents/sui-snapshot` and `~/Documents/sui-airdrop` as the
reference for stack, styling, deployment, and workflow conventions.

## Product Direction

The site should make the projects the main surface, not hide them behind a
generic landing page. A visitor should quickly understand what each project
does, why it exists, how it was built, and where to try it or inspect the
source when links are available.

Expected content:

- project index for built work
- focused project cards with product name, short description, role, status,
  stack, and links
- project detail or case-study pages when a project needs more context
- concise explanations of technical decisions in plain language
- contact or profile links only where they support the portfolio goal

Avoid fake metrics, vague claims, and decorative sections that do not help a
visitor evaluate the work.

## Reference Projects

Use these sibling repos as the current source of truth for shared workspace
patterns:

- `~/Documents/sui-snapshot`
- `~/Documents/sui-airdrop`

Relevant shared guidance from those projects:

- `README.md` is for human-facing product, workflow, and operating guidance.
- `AGENTS.md` is for repo-local agent rules, command conventions, and
  verification expectations.
- Keep changes to one coherent slice and commit finished slices locally.
- Ground decisions in the current checkout and sibling source/docs before
  relying on assumptions.
- Reuse sibling patterns when they already solved the same design or workflow
  problem, while keeping product boundaries explicit.

## Planned Stack

Use the same core web stack as `sui-snapshot` and `sui-airdrop`, trimmed for a
portfolio site:

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

## Shared Web App Design System

The portfolio should feel like it belongs to the same family as `sui-snapshot`
and `sui-airdrop`, while adapting the pattern to a project showcase instead of
a workflow utility.

- Use shadcn/ui on Base UI primitives, the `base-luma` style or preset,
  Tailwind CSS v4 tokens, Inter, and the same component composition habits as
  the sibling apps.
- Preload the concrete Fontsource Inter latin `woff2` asset from the root
  document before the stylesheet link, and cover the ordering in a root-head
  regression test once the app exists.
- Prefer existing shadcn components before custom primitives.
- Use the shared mesh-gradient page chrome. Light mode should use a pastel mesh;
  dark mode should use a darker version of the mesh. The portfolio can choose
  its own colors, but the chrome should follow the sibling structure.
- Keep browser chrome and safe-area theme colors aligned with the solid top
  color of the mesh in both light and dark mode.
- Use the same logo system: rounded-square logo container, consistent logo
  background treatment, and project-specific inner glyph.
- Use the app logo asset for favicons and install icons.
- Render the header logo with explicit `width`, `height`, `sizes`, and `srcset`
  attributes.
- Use Lucide icons for concrete interface actions and status cues.
- Keep every clickable button target at least 44px tall.
- Use outline buttons for visible non-primary actions. Reserve stronger button
  treatment for the main action on a surface.
- Use cards for individual project items, detail panels, and repeated content.
  Avoid cards inside cards; use muted shadcn `Item` surfaces for compact nested
  metadata inside a project card.
- Keep typography readable: strong page title, concise subtitle, semibold card
  and item titles, and base-size descriptions.
- Keep copy clear to non-technical visitors. Explain what a project does and
  what problem it solves before listing implementation details.
- Support all viewport widths. Project cards, button rows, metadata, and long
  project names must not overflow or overlap.
- Respect system dark mode. Do not add a manual theme switch unless requested.
- Build OG/social images from the dark-mode header composition: logo, site
  title, and subtitle in white.

Portfolio-specific adaptation:

- A portfolio is allowed to have a stronger editorial first impression than the
  utility apps, but the first viewport still needs to show the actual project
  showcase or a clear path into it.
- Do not use oversized marketing sections that delay access to the projects.
- Favor dense but polished project information over decorative filler.

## Future Implementation Notes

When the app is scaffolded, keep the sibling command style:

- use `npx vp env setup`
- use `npx vp install`
- use `npx vp dev`, `npx vp check`, `npx vp test`, and `npx vp build`
- use `npx vp run deploy`, `npx vp run smoke:deploy`, and
  `npx vp run smoke:browser` for Cloudflare release checks if equivalent scripts
  are added

Until a `package.json` exists in this repo, these commands are planned
conventions rather than runnable local commands.

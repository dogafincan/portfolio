# Design

This file is the design source of truth for the portfolio app. It covers visual
system, layout, interaction, copy, social preview, and portfolio-specific UI
contracts. `README.md` explains the product and workflow. `AGENTS.md` explains
agent rules and verification. `PRD.md` tracks product scope and implementation
slices.

Before changing UI, copy, layout, icons, loading states, empty states, social
images, or responsive behavior, read this file and compare the current sibling
`sui-swap`, `sui-snapshot`, `sui-airdrop`, and `memedex` design files for
general principles.

## Shared Workspace Design System

Keep this section aligned in principle with the sibling `DESIGN.md` files.
Product-specific sections may differ, but the shared system should stay
recognizably consistent unless the portfolio intentionally needs an exception.

- Put the actual product surface on the first screen. For the portfolio, that
  means real project content and clear project links, not a marketing landing
  page, generic hero filler, or decorative explainer section.
- Keep the product feel calm, scannable, and trustworthy. Use restrained
  surfaces, readable type, direct actions, and plain copy instead of promotional
  language.
- Use the same app stack for product UI: shadcn components on Base UI
  primitives, the `base-luma` style or preset, Tailwind CSS v4 tokens, Inter,
  and `lucide-react` for product icons.
- Do not add another product UI icon family. New shadcn component generation,
  `components.json`, package dependencies, and regression tests should stay
  aligned with Lucide.
- Preload the concrete Fontsource Inter latin `woff2` asset from the root
  document before the stylesheet link. Keep the preload order covered by the
  root head regression test.
- Keep the shared chrome color separate from workbench, card, and form surface
  tokens so those surfaces continue to follow system color mode.
- Respect system dark mode. Do not add a manual theme switch unless the product
  explicitly needs one.
- Use checked-in PNG/ICO assets for favicon, install icons, header logo, and
  generated social image. Header logos must render with explicit
  `width`, `height`, `sizes`, `srcset`, and a visible border wrapper that
  preserves the app logo's rounded-square shape. Use an outer logo shell with
  `drop-shadow-xl`, then an inner rounded frame with theme-invariant light-mode
  colors (`border-neutral-200 bg-white`) and `overflow-hidden`, so the shadow
  does not get clipped into square lower corners. Do not change the logo asset,
  border treatment, or shadow treatment when changing the header cloud
  treatment.
- Keep the first-viewport identity placement consistent across `sui-snapshot`,
  `sui-airdrop`, `sui-swap`, `portfolio`, and `memedex`: the app logo should
  start from the same top-aligned app-shell rhythm on mobile and desktop. Do not
  add project-specific top padding, desktop vertical centering, or extra outer
  wrappers that lower the logo or the rest of the content relative to siblings.
- Keep OG and social images as generated checked-in 1200x630 PNGs. They should
  use the restrained light-mode header composition only: centered logo and site
  title. Generate them from the React/Tailwind `/og-preview` route with
  `npm run generate:og`; do not add social SVG sources, dynamic request-time
  image endpoints, project cards, workbench controls, marketing sections, or
  decorative mockups.
- Use a rounded muted workbench as the main app surface. It should contain the
  project cards, preserve enough padding for nested depth, and keep outer radius,
  inner card radius, and spacing visually related at every breakpoint.
- Prefer stock shadcn components before custom primitives. Repeated project
  surfaces use cards. Compact nested summaries and metadata rows use muted
  shadcn `Item` surfaces instead of card-within-card layouts.
- Do not place card containers inside app cards. If a compact nested surface is
  needed, use `Item`.
- Give each project card a concise title and description. Put implementation
  details after the plain-language explanation of what the project does.
- Keep each project card to one visible title/subtitle pattern. If the muted
  project summary `Item` carries the title and subtitle, do not add another card
  header that repeats the same context.
- Keep spacing rhythm consistent. Sibling cards inside the same workbench should
  use the same card-to-card gap on mobile and desktop; compact stacks inside one
  card or component should use an 8px vertical gap between related items,
  actions, and their owned alerts.
- Keep product or app names in compact helper links non-wrapping when a line
  break would split the linked name and make the copy harder to scan.
- Keep actions in the card that owns their state. Project live actions belong in
  the project card. Future contact or case-study actions should live near the
  content they operate on.
- The default `Button` variant is the primary button treatment. Keep it on a
  softened Apple iMessage-style blue with fully opaque white text:
  `color-mix(in oklab, #007aff 90%, #ffffff)` in light mode and
  `color-mix(in oklab, #0a84ff 90%, var(--card))` in dark mode, plus matching
  hover, active, expanded, focus, and disabled state colors. Keep this button
  color separate from the global `--primary` token so badges, links, progress,
  and other non-button surfaces do not inherit the action blue by accident.
- Keep every clickable button target at least `44px` tall across variants.
  Touch comfort wins over compact density for primary actions and utility
  controls.
- Keep editable input fields at the same `44px` control height if a future
  portfolio form or search surface is introduced. Search or selector inputs
  should preserve horizontal room for leading icons and dropdown affordances
  when those controls exist.
- Keep keyboard focus visible on every profile and live-project action. These
  links should stay in natural DOM order and share the same compact focus ring
  recipe so the currently selected item is easy to identify without making the
  social icon state feel oversized. Keep the ring non-animated on focus and use
  a small offset so the ring stays visible around dark project buttons.
- Add semantic leading Lucide icons to text buttons for concrete actions such as
  opening a project, navigating to a case study, or contacting.
  Loading states should swap the icon for a spinner without shifting the label.
- Labels, card titles, and item titles should be readable base-size or larger
  semibold type; descriptions should remain base-size normal weight.
- Use shadcn `Alert` for future inline validation, warning, info, success, and
  failure states. Alerts are tonal surfaces, not bordered cards: pale backgrounds
  with darker text and icons in light mode, dark tonal backgrounds with white
  text and icons in dark mode, and no visible border line.
- Every alert needs a semantic Lucide icon on the left, vertically centered with
  the text block, using the shared default `size-5` treatment and normal stroke
  weight.
- Future action-triggered alerts should render below the complete action cluster
  that owns them. If multiple sibling buttons share one workflow, do not insert
  related alerts between adjacent buttons. Single-input validation can still sit
  directly below the field.
- Keep alert, validation, progress, and error copy understandable to
  non-technical visitors. Say what happened and what the visitor can do next. Do
  not expose backend internals, transaction digests, chunks, batches, raw units,
  proof data, stack names, runtime names, or provider implementation details in
  visitor-facing copy unless the page is explicitly a technical case study.
- For recoverable errors that originate in a third-party product, API, or
  browser capability, classify the failure by the portfolio-owned action first,
  then name the outside service when known and show safe, human-readable outside
  guidance by default. Use the pattern `[Service] says: [message]` only after
  trimming whitespace, redacting long identifiers, capping length, and rejecting
  stack traces, JSON, signatures, raw payloads, route IDs, base64 blobs, debug
  dumps, and other internal details. If the outside message is missing or
  unsafe, hide it and show a generic next step the visitor can act on. This repo
  currently has no wallet, auth, transaction, or provider-mediated app workflow,
  so the rule is for future dynamic content, embeds, contact actions, browser
  capabilities, and deployment/provider incident copy.
- Model async states explicitly if the portfolio adds dynamic content. Loading
  skeletons should mirror the final card structure, and failure states should
  have deliberate button and alert states.
- Design for all viewport widths. On narrow screens, preserve workbench and card
  borders and prevent text, project metadata, buttons, or images from escaping
  their containers.
- When syncing design between sibling apps, copy general principles, not
  product-specific behavior. `sui-snapshot` owns snapshot export, `sui-airdrop`
  owns wallet funding and airdrop execution, `memedex` owns discovery, voting,
  ranking, review, and moderation surfaces, and `portfolio` owns project
  showcase content.

## Header Section / Atmosphere-to-Page Background

This section documents the shared page-background treatment for app header and
workbench areas across projects. Treat these rules as reusable system policy.

- Use generated page-atmosphere assets as the only app page graphics:
  `page-atmosphere.avif` plus `page-atmosphere-repeat.avif` in light mode, and
  `page-atmosphere-dark.avif` plus `page-atmosphere-repeat-dark.avif` in dark
  mode. Generate them with `npm run generate:atmosphere` from the source assets
  in `scripts/assets/`.
- Keep the root/page safe-area background on the sampled top artwork colors:
  `#5AB6DC` in light mode and `#428CA9` in dark mode. `theme-color`, manifest
  colors, `--portfolio-app-chrome-color`, and `--portfolio-page-background`
  should stay aligned to those colors.
- Use `viewport-fit=cover` so the generated `body` background can extend into
  iOS safe areas. Keep the header, workbench, and other app content out of
  unsafe areas with `.app-shell` padding that adds
  `env(safe-area-inset-top/right/bottom/left)` to the normal shell spacing.
- The generated top atmosphere assets are `864x1536`. They bake in the old
  transition timing so the page first becomes visibly lighter or darker at
  `37.5rem` / 600px from the top, strengthens at `59.25rem` / 948px, and
  reaches the full white or near-black lower page color at `77.25rem` / 1236px.
  Keep those pixel stops in `scripts/generate-page-atmosphere.mjs`.
- The generated repeat assets are `864x512` seamless lower-page continuations:
  white in light mode and near-black in dark mode. Start them at the fixed
  `96rem` top atmosphere height so long scrolls continue on the lower-page
  color without repainting another blue header band.
- Attach the generated top and repeat assets directly to `body` background
  layers. Crop them with fixed CSS background positioning and sizing rather
  than adding positioned pseudo-elements or separate header-specific background
  assets. The background treatment must not increase document scroll height.
- Do not render CSS gradient fade layers, a `body::before` atmosphere layer, a
  repeating `body::after` atmosphere layer, a separate cloud layer, fixed bottom
  fades, generated mesh continuations, or a `main.app-shell::before` clearance
  halo for app page chrome.
- Header title, subtitle, and profile/social icons should remain solid white so
  the app identity stays readable over the blue header artwork. The main header
  title should use `drop-shadow-xl` to match the logo depth.
- Generate OG/social images from the generated `page-atmosphere.avif` artwork
  over the app chrome color. Keep OG preview generation decoupled from
  page-background variables so changing the page transition does not
  accidentally change social images.
- Verify desktop and mobile, light and dark mode whenever the page-background
  transition, theme colors, or header identity classes change.

## Portfolio Product Shape

- Keep the portfolio a focused public project showcase, not a blog, dashboard,
  CMS, or Sui utility runtime.
- Preserve the single-route structure until a project genuinely needs its own
  case-study page: header, rounded muted project workbench, and project cards.
- Use the shortened, top-cropped page-atmosphere artwork so Portfolio follows
  the shared atmosphere-to-page transition without a separate app header
  graphic.
- Do not list the portfolio website as one of its own project cards; visitors
  are already viewing that surface.
- The primary visitor flow is: land on the page, identify the person and project
  focus, scan real project cards, and open a live project when one is available.
- Do not place visible footer/profile content below the project workbench unless
  a future product decision gives that surface concrete visitor value.
- Do not add wallet connection, transaction signing, Mysten SDK dependencies,
  Turnstile, rate limiting, Durable Objects, KV, D1, R2, queues, or backend state
  just because the sibling apps use them.
- The portfolio may describe Sui projects, but Sui-specific workflows stay in
  the sibling apps.
- The portfolio may list or link to Memedex, but memecoin discovery, voting,
  ranking, review, and moderation workflows stay in Memedex.

## Header And Project Workbench

- Keep the header visually aligned with the sibling app headers: app logo,
  title, concise subtitle, centered text, and foreground text color by
  inheritance.
- The header subtitle should feel informal and personal: language learning,
  nutrition and exercise, building things, and inviting interesting builder
  conversations are part of the positioning.
- Place X and GitHub icon-only links after the title/subtitle block and before
  the project workbench. The links should inherit the header color, render as
  `55px` square targets with `25px` brand marks, open in a new tab, and use
  accessible labels that name the destination. Keep their keyboard focus ring
  aligned with the project live app actions.
- Use inline SVG brand marks for the X and GitHub profile links because they
  are exact profile-brand marks, not new product UI icon-family dependencies.
  They should use `currentColor` so they stay aligned with the header title and
  subtitle color treatment, and `drop-shadow-xl` so they share the header
  identity depth.
- The title class currently matches the sibling apps:
  `text-balance text-4xl leading-tight font-bold tracking-tight text-white drop-shadow-xl`.
- The subtitle class currently matches the snapshot header width treatment:
  `max-w-[40rem] text-balance text-lg font-medium text-white md:max-w-full`.
- Keep `Reach out if you're building something interesting.` in a second
  subtitle sentence span with `md:block` so larger screens do not flatten the
  full subtitle into one long line.
- Keep the header, profile links, and project workbench in the normal top-first
  app-shell flow on desktop and mobile. The project workbench should size to its
  project-card content and must not grow just to fill spare first-viewport
  height.
- Keep the project workbench class aligned with the sibling workbench container
  until there is a deliberate portfolio-specific exception:
  `grid w-full min-w-0 max-w-full grid-cols-[minmax(0,1fr)] items-start gap-6 rounded-[2.75rem] border border-transparent bg-muted p-3 sm:rounded-[3rem] sm:p-6 lg:grid-cols-[22rem_minmax(0,1fr)] dark:border-border dark:bg-background`.
- Do not put a visible `Projects` title/subtitle above the cards unless the
  page gains enough surrounding structure to need that label.
- Do not add a separate build-principles section below the project cards unless
  it carries concrete visitor value that cannot fit in project content.

## Project Cards

- Project data lives in `src/content/projects.ts`. Extend that structured data
  before creating one-off project markup.
- Each card should show only the product-owned app icon, the app's exact title,
  the app's exact subtitle, and a live app link.
- Place each product icon, project title, and project subtitle together inside
  one full-width shadcn `Item` using the muted variant. Keep the icon on the
  left, vertically centered, with the title and subtitle stacked to the right.
  Logos should render as a 45px rounded square, about 75% of the original 60px
  size, with a neutral gray border and no drop shadow. The live app button stays
  outside the `Item` in the card footer.
- Do not show status badges, role text, stack metadata, implementation
  highlights, source links, or large preview images in project cards for now.
  Move that depth into future case-study pages if needed.
- Use primary treatment for live project actions. Do not show source actions for
  private project repositories.
- Keep the live app action as a normal external link in the card footer, in
  project order, with the shared keyboard focus ring.
- Keep icons, button rows, subtitles, and long project names responsive without
  overflow.

## Portfolio Copy

- Explain what the project does before naming libraries or infrastructure.
- Keep copy concrete and phase-accurate. Do not imply projects are live,
  production-ready, or complete unless the project record and links support it.
- Keep project-card subtitles matched to the apps themselves. Save
  implementation detail for future case-study pages.
- Avoid decorative product principles, generic claims, and repeated manifesto
  copy that delays access to the project list.
- Technical depth belongs in future case-study pages when a project needs that
  space.

## Social Preview

- Preserve the social preview contract in `src/routes/index.tsx`. Open Graph and
  X/Twitter image tags must use absolute HTTPS URLs, not root-relative paths.
- The canonical and social-preview base URL is `https://dogafincan.com`. The
  `www.dogafincan.com` custom domain should render the same apex canonical,
  `og:url`, `og:image`, `og:image:secure_url`, and `twitter:image` values.
- The current social image points to the generated `public/og.png` with a
  cache-busting query. If `public/og.png` changes, update `SITE_URL`, the
  `SOCIAL_IMAGE` query, and `src/routes/-index.test.ts` together. Keep it a
  checked-in 1200x630 PNG generated by `npm run generate:og`, with no separate
  SVG source or dynamic request-time image endpoint.

## Not Yet Implemented

- Project-specific case-study pages are not implemented. Add them only when a
  project needs more space than the card can provide.
- No contact form, newsletter, analytics, CMS, or backend content workflow is
  specified. Add those to `PRD.md` before implementing them.

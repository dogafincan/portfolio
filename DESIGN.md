# Design

This file is the design source of truth for the portfolio app. It covers visual
system, layout, interaction, copy, social preview, and portfolio-specific UI
contracts. `README.md` explains the product and workflow. `AGENTS.md` explains
agent rules and verification. `PRD.md` tracks product scope and implementation
slices.

Before changing UI, copy, layout, icons, loading states, empty states, social
images, or responsive behavior, read this file and compare the current sibling
`sui-snapshot`, `sui-airdrop`, and `memedex` design files for general
principles.

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
- Use manually supplied checked-in PNG/ICO assets for favicon, install icons,
  header logo, and social image. Header logos must render with explicit
  `width`, `height`, `sizes`, `srcset`, and a visible border wrapper that
  preserves the app logo's rounded-square shape. Use theme-invariant light-mode
  wrapper colors (`border-neutral-200 bg-white`) so the logo and border look the
  same in light and dark mode. Do not change the logo asset or border treatment
  when changing the header mesh treatment.
- Keep OG and social images as manually supplied 1200x630 PNGs. They should use
  the restrained light-mode header composition only: logo, site title, and
  subtitle. Do not add social SVG sources, image-generation paths, project
  cards, workbench controls, marketing sections, or decorative mockups.
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

## Header Section / Mesh Gradient

This section documents the shared visual treatment for app header areas across
projects. Treat these rules as a reusable visual system, not an app-specific
layout.

- Use one identity color treatment in both light mode and dark mode. The app
  logo, header title, and header subtitle should render in white (`#FFFFFF`) in
  all themes so the app identity stays consistent and readable against the
  mesh-gradient background.
- The app's primary background color and theme color should be a bright, clean
  light blue: primary light blue `#43C3EC`. Use this for the page background,
  browser safe-area/chrome color, root `html` and `body` backgrounds, and
  `theme-color` meta entries unless a project records a specific install-color
  exception.
- The page background should primarily read as `#43C3EC`. When a mesh-gradient
  or decorative blurred-cloud treatment is used in the header, the top and
  bottom of the composition must remain the same light blue (`#43C3EC`) so the
  UI does not become a full multicolor gradient. The blue should feel like the
  base canvas, with the other colors appearing only as soft atmospheric accents.
- Header mesh treatments should contain decorative blurred cloud-like shapes.
  The exact generated cloud type may vary per project, but it should stay soft,
  abstract, airy, and non-literal. Suitable inspirations include cirrus,
  altocumulus, stratocumulus, lenticular, and soft vapor-like blobs. The
  implementation should not require realistic cloud imagery; prefer CSS radial
  gradients, blurred blobs, or mesh-gradient layers.
- Use these accent colors for the decorative cloud shapes:
  soft lavender `#CDBBFF`, periwinkle violet `#9F8CFF`, pale icy blue
  `#BDEEFF`, soft pink-lilac `#F0B7FF`, and light violet-blue `#7FA8FF`.
- Avoid the greenish tint from the references. Do not introduce mint, lime, or
  greenish-cyan accent clouds. The base blue may remain cyan-blue, but the
  decorative accents should stay within lavender, violet, pale blue,
  periwinkle, and pink-lilac.
- Position the cloud shapes mostly behind and around the header identity
  elements: behind the app logo, behind the title, and behind the subtitle. They
  should also appear near the sides of the top part of the main
  workbench/container card so the card feels embedded into the atmosphere.
  Clouds should not dominate the bottom of the UI; the lower part of the screen
  should return clearly to the base light blue (`#43C3EC`).
- The composition should read as a centered identity stack above the primary
  workbench: app logo, app title, subtitle, then the rounded muted workbench.
  The mesh should form a soft horizontal cloud band behind that stack, with the
  strongest color concentration around the logo/title/subtitle and the upper
  sides of the workbench.
- Dark mode keeps the same bright blue page chrome and atmospheric header cloud
  treatment. Only workbench, card, form, item, alert, and text surfaces inside
  the workbench switch to system dark-mode tokens. Do not replace the header
  with a separate dark header palette.
- Keep enough clear blue above the identity stack for mobile safe areas and
  enough clear blue below the visible cloud field that the lower screen returns
  to the base canvas. Avoid carrying saturated accent blobs down the full page.

Implementation guidance:

- Use a relatively positioned page or header wrapper.
- Use absolutely positioned decorative layers with `pointer-events: none`.
- Use `radial-gradient(...)` backgrounds or multiple layered radial gradients.
- Use strong blur, for example `filter: blur(40px)` to `blur(80px)`.
- Use opacity around `0.45` to `0.85`, depending on light or dark mode.
- Keep the content layer above the cloud layer with `z-index`.
- Use `overflow: hidden` on the header or page wrapper to keep cloud edges
  clean.
- Prefer CSS-generated shapes over static image assets unless exact
  reproduction is required.

General Tailwind/CSS shape:

```tsx
<main className="relative min-h-dvh overflow-hidden bg-[#43C3EC]">
  <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] overflow-hidden">
    <div className="absolute inset-0 bg-[#43C3EC]" />
    <div
      className="absolute left-1/2 top-8 h-64 w-72 -translate-x-1/2 rounded-full opacity-75 blur-[64px]"
      style={{ background: "radial-gradient(circle, #CDBBFF 0%, transparent 68%)" }}
    />
    <div
      className="absolute left-[-4rem] top-24 h-72 w-80 rounded-full opacity-65 blur-[72px]"
      style={{ background: "radial-gradient(circle, #9F8CFF 0%, transparent 70%)" }}
    />
    <div
      className="absolute right-[-3rem] top-20 h-72 w-80 rounded-full opacity-70 blur-[72px]"
      style={{ background: "radial-gradient(circle, #F0B7FF 0%, transparent 70%)" }}
    />
    <div
      className="absolute left-[18%] top-64 h-56 w-72 rounded-full opacity-55 blur-[56px]"
      style={{ background: "radial-gradient(circle, #BDEEFF 0%, transparent 72%)" }}
    />
    <div
      className="absolute right-[16%] top-72 h-56 w-72 rounded-full opacity-60 blur-[60px]"
      style={{ background: "radial-gradient(circle, #7FA8FF 0%, transparent 72%)" }}
    />
  </div>

  <header className="relative z-10 text-white">
    {/* Logo, title, and subtitle stay on the same white treatment in all themes. */}
  </header>
</main>
```

## Portfolio Product Shape

- Keep the portfolio a focused public project showcase, not a blog, dashboard,
  CMS, or Sui utility runtime.
- Preserve the single-route structure until a project genuinely needs its own
  case-study page: header, rounded muted project workbench, and project cards.
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
  subtitle color treatment.
- The title class currently matches the sibling apps:
  `text-balance text-4xl leading-tight font-bold tracking-tight`.
- The subtitle class currently matches the snapshot header width treatment:
  `max-w-[40rem] text-balance text-lg font-medium md:max-w-full`.
- Keep `Reach out if you're building something interesting.` in a second
  subtitle sentence span with `md:block` so larger screens do not flatten the
  full subtitle into one long line.
- On desktop, vertically center the header, profile links, and project workbench
  inside the first viewport when the current project count leaves spare space
  below the workbench. Keep the mobile flow top-first so stacked project cards
  remain easy to scan from the initial load position.
- Keep the project workbench class aligned with the sibling workbench container
  until there is a deliberate portfolio-specific exception:
  `grid w-full min-w-0 max-w-full flex-1 grid-cols-[minmax(0,1fr)] items-start gap-6 rounded-[2.75rem] border border-transparent bg-muted p-3 sm:rounded-[3rem] sm:p-6 lg:grid-cols-[22rem_minmax(0,1fr)] dark:border-border dark:bg-background`.
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
- The current social image points to the manually supplied
  `public/og-image.png` with a cache-busting query. If `public/og-image.png`
  changes, update `SITE_URL`, the `SOCIAL_IMAGE` query, and
  `src/routes/-index.test.ts` together. Keep it a checked-in 1200x630 PNG with
  no separate SVG source or generation path.

## Not Yet Implemented

- Project-specific case-study pages are not implemented. Add them only when a
  project needs more space than the card can provide.
- No contact form, newsletter, analytics, CMS, or backend content workflow is
  specified. Add those to `PRD.md` before implementing them.

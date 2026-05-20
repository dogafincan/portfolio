# Design

This file is the design source of truth for the portfolio app. It covers visual
system, layout, interaction, copy, social preview, and portfolio-specific UI
contracts. `README.md` explains the product and workflow. `AGENTS.md` explains
agent rules and verification. `PRD.md` tracks product scope and implementation
slices.

Before changing UI, copy, layout, icons, loading states, empty states, social
images, or responsive behavior, read this file and compare the current sibling
`sui-snapshot` and `sui-airdrop` design files for general principles.

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
- Use the shared mesh-gradient page chrome. The header mesh and header text stay
  visually identical in light and dark mode, while the workbench and everything
  inside it continue to follow system color mode. Each app chooses its own mesh
  colors so the projects keep distinct identities.
- The browser safe-area color and the visible page background beyond the mesh
  must equal the top color of the mesh exactly in both light and dark mode.
  Match `theme-color`, manifest colors, CSS chrome variables, the root `html`
  background, and the body page background to that top mesh color. iOS Safari can
  paint notched safe areas from the document root before the body mesh begins,
  and the bottom browser chrome can reveal the same page background the mesh
  fades into.
- Keep the shared chrome color separate from workbench, card, and form surface
  tokens so those surfaces continue to follow system color mode.
- Respect system dark mode. Do not add a manual theme switch unless the product
  explicitly needs one.
- Use the shared logo asset pattern: favicon, install icons, header logo, and
  social image derive from the same app logo family. Header logos must render
  with explicit `width`, `height`, `sizes`, and `srcset`.
- Build OG and social images from the light-mode header composition only: logo,
  site title, and subtitle. Do not include project cards, workbench controls,
  marketing sections, or decorative mockups in social images.
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
- Keep every clickable button target at least `44px` tall across variants.
  Touch comfort wins over compact density for primary actions and utility
  controls.
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
- Model async states explicitly if the portfolio adds dynamic content. Loading
  skeletons should mirror the final card structure, and failure states should
  have deliberate button and alert states.
- Design for all viewport widths. On narrow screens, preserve workbench and card
  borders and prevent text, project metadata, buttons, or images from escaping
  their containers.
- When syncing design between sibling apps, copy general principles, not
  product-specific behavior. `sui-snapshot` owns snapshot export, `sui-airdrop`
  owns wallet funding and airdrop execution, and `portfolio` owns project
  showcase content.

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

## Header And Project Workbench

- Keep the header visually aligned with the sibling app headers: app logo,
  title, concise subtitle, centered text, and foreground text color by
  inheritance.
- The header subtitle should feel informal and personal: language learning,
  nutrition and exercise, building things, and inviting interesting builder
  conversations are part of the positioning.
- Place compact X and GitHub icon-only links after the title/subtitle block and
  before the project workbench. The links should inherit the header color,
  remain at least `44px` square, open in a new tab, and use accessible labels
  that name the destination.
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
  The live app button stays outside the `Item` in the card footer.
- Do not show status badges, role text, stack metadata, implementation
  highlights, source links, or large preview images in project cards for now.
  Move that depth into future case-study pages if needed.
- Use primary treatment for live project actions. Do not show source actions for
  private project repositories.
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
- The current social image points to `public/og-image.png` with a cache-busting
  query. If `public/og-image.png` changes, update `SITE_URL`, the `SOCIAL_IMAGE`
  query, and `src/routes/-index.test.ts` together.
- Keep the image a 1200x630 PNG rendered from the light-mode header composition
  only: logo, site title, and subtitle.

## Not Yet Implemented

- Project-specific case-study pages are not implemented. Add them only when a
  project needs more space than the card can provide.
- No contact form, newsletter, analytics, CMS, or backend content workflow is
  specified. Add those to `PRD.md` before implementing them.

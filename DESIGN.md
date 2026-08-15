# Portfolio Design Contract

Doji Design System version: 1.0.1-draft
Doji Design System source revision: `abf5999126d309c8d0ab5f9a308150c012a06608` (committed draft; release tag pending)
Doji Design System adoption: migrating

This file is Portfolio's local UI contract. The canonical shared source is the
versioned `doji-design-system` Codex skill in the separate design-system
repository. Runtime components remain local to this repository. The released
baseline remains immutable `v1.0.0`; the active manual `1.0.1-draft` run adds
complete description rendering, a concise Alert/Item description target,
progressive informational-Item disclosure, and the connect-wallet Drawer
contract, and remains `migrating` until an immutable
source revision and local proof exist.

Every local Card keeps 24px (`gap-6`) between each present header, content,
and footer section at every size. `CardContent` is shrink-safe but natural-height
by default. A present footer stays in ordinary flow after the exact structural
24px gap at every width. Sibling items in `CardContent` and `CardFooter` use
12px (`gap-3`); a direct `FieldGroup` in Card content must use that same stack
instead of its stock `gap-7`.

At the large breakpoint, page-level peer Cards use equal fractional columns and
align to the start. Every Card keeps its independent natural height, so unequal
bottom edges are expected when content differs. Do not add peer-height-only
`h-full`, flex growth, self-stretch, or automatic footer margins. Empty states
remain real product content, not filler used to synchronize columns.

For UI work, apply the current product request first, this local contract
second, and the canonical skill third. Canonical changes are synchronized by a
manual skill run after each accepted design-system change; there is no shared
runtime package and no automated cross-repository mutation.

## Temporary Chain Migration Lockout

- Portfolio's Sui-dependent wallet, payment, recovery, submission, and public
  dynamic API behavior is temporarily unavailable while Doji migrates from Sui
  to Robinhood Chain. This is a reversible access lock; keep the existing Sui
  implementation intact for the later chain migration.
- Keep genuinely static routes, portfolio content, profile links, and live app
  links available.
- Portfolio page headers intentionally expose neither **Connect wallet** nor
  **Submit project**. The public showcase has no Doji utility-action group and
  therefore owns no adjacent migration Alert or wallet Drawer trigger.
- `/submit` keeps the complete shared field order, local image selection,
  validation and preview, and one fee-and-recovery Item usable without network
  access. CardContent contains no migration Empty or Alert.
- The ordinary **Pay 10 SUI** and **Recover payment** form actions retain their
  labels and enabled visual/focus behavior without the `disabled` attribute.
  They are inert during the lockout, never validate, open recovery, connect,
  sign, request, or mutate, and own one persistent informational Doji Alert
  immediately after their complete action cluster.
- Portfolio has no project or asset selector trigger; its manual asset-type
  input is not a selector, so the migration selector-Drawer requirement is not
  applicable here. If a selector is added during this lockout, its migration
  explanation belongs only in its Empty surface, never in an Alert below the
  trigger.
- Every public chain-dependent API path and broad server-function path returns
  the same no-store JSON `503` migration response before request-body work,
  rate limiting, service bindings, external providers, or mutations. Existing
  envelope, gateway, wallet, payment, and recovery implementation remains
  preserved behind this temporary boundary.
- Production deploys `wrangler.assets.jsonc`, which has no Worker script or
  runtime binding. Dynamic URLs receive the static 404 boundary without paid
  Worker execution. The retained server boundary keeps the migration 503 as
  defense in depth for deliberate backend tests or later deployment.

## Product Character

- Portfolio is a focused public project showcase with one shared paid Registry
  submission workflow. It is not a dashboard, CMS, blog, or Sui utility.
- Lead with real identity and project content. Do not add marketing filler,
  decorative metrics, vague claims, or sections without visitor value.
- Keep the interface calm, direct, readable, and trustworthy.
- Explain what a project does before naming implementation details.
- Keep showcase data in `src/content/projects.ts` until case studies or a CMS
  have a demonstrated need.

## Foundations

- Use Geist from the checked-in Fontsource variable font and preload the
  concrete Latin `woff2` before the stylesheet.
- Use the complete shared Geist OKLCH palette in
  `src/styles/geist-colors.css` without local edits.
- Browser-rendered colors resolve through semantic aliases in `src/styles.css`.
  Do not use raw palette utilities, component-local color literals,
  `color-mix()`, or painted opacity suffixes.
- Neutral muted surfaces and editable controls use
  `oklab(0.98 0 0)` in light mode and `oklch(0.17 0 0)` in dark mode. Colored
  statuses keep their tone surfaces in light mode and use the muted surface
  behind colored foregrounds in dark mode. The single `--warning-foreground`
  role owns warning alerts, amber badges, warning buttons and controls, and all
  other amber status text. It resolves to `oklch(0.7 0.1991 64.279999)` in
  light mode and `oklch(0.72 0.1991 64.28)` in dark mode.
- The resting muted `Item` alone uses `oklab(0.985 0 0)` in light mode and the
  unchanged muted role in dark mode. Avatar/image `ItemMedia` containers match
  the Card background in light mode and retain the page background in dark
  mode. The Item primitive owns both roles; call sites do not add local
  background utilities, and every non-Item muted surface stays unchanged.
- Respect system light and dark modes. Do not add a theme switch without a
  separate product decision.
- Use the solid neutral page field and raised app chrome. Do not add page
  atmosphere, clouds, mesh, gradients, or decorative background images.
- Paint `html`, `body`, navbar, footer, and safe areas with the raised chrome
  role. Paint the page canvas with the page-background role.
- Keep platform metadata aligned to the neutral chrome:
  `#FFFFFF` in light mode and `#090909` in dark mode; the manifest background
  is `#FCFCFC`.
- Each active page or dialog exposes at most one enabled filled dominant
  Button. Every ordinary secondary action uses blue-foreground `outline`,
  whether it may become primary later or remains supporting. Filled `success`,
  `warning`, and `destructive` Buttons may own that same single dominant slot;
  supporting semantic actions use `success-outline`, `warning-outline`, or
  `destructive-outline`, whose text matches the corresponding Alert foreground.
  The shadcn `secondary` variant is reserved for selected or toggled state; it
  is not a secondary workflow-action treatment.
- The document uses `viewport-fit=cover`, `html` uses `overscroll-y-none`, the
  body and complete page shell use `overscroll-none`, and body horizontal
  overflow is clipped rather than hidden.
- Global Lucide stroke width is `2.2`. Lucide is the only product UI icon
  family.

## Typography

- Page titles use the shared responsive page-title recipe and one short
  semantic blue accent span. Primary product headers aim for the shadcn-scale
  35-40 title characters and 140-155 subtitle characters, including spaces and
  punctuation, while accurate and natural copy remains the higher priority.
- Page subtitles use the shared page-subtitle recipe and foreground color.
- Card, item, field, alert, and supporting text use shared typography helpers
  from `src/lib/doji-ui.ts`.
- Do not shrink important content to create density. `text-sm` is reserved for
  compact metadata, helper labels, and badges.
- Keep visible copy in sentence case. Button labels are direct and concise.
- Every semantic description renders in full. Let the owning surface grow to
  the description's natural height; never use a line clamp, truncation,
  ellipsis, `overflow-hidden`, or fixed-height clipping on description text or
  its descendants.
- Author Alert and Item descriptions for one or two rendered lines at their
  normal target width whenever complete meaning fits. Remove title repetition
  and nonessential detail first; keep the shortest complete safety, deadline,
  technical, or recovery wording when it still needs more space, and let it
  wrap without smaller type or cutoff utilities.
- Minimize simultaneous informational Items as a flexible composition rule.
  Consolidate related required disclosures and progressively reveal
  state-specific information, while keeping material terms visible before an
  action. Project cards, controls, previews, summaries, and data/status rows may
  use the Items their task requires.

## Chrome And Layout

- The sticky navbar is a full-width raised surface with one lower border and no
  shadow, outer radius, or decorative fill.
- Navbar identity uses the 32px Portfolio logo and full `Doga Fincan` label.
  This owner-approved personal identity is the naming exception to the
  `Doji…` product-name rule. Its 2px gap, `text-xl`/`leading-7` name, shared 1px
  optical offset, and transparent artwork wrapper still match DojiSnap. The
  complete app-owned identity uses the approved full-color memoji behind the
  laptop, never a substitute glyph or redrawn silhouette. Light artwork keeps
  that subject on a full-bleed white square; dark artwork keeps the same subject
  and geometry on a full-bleed black square. Every non-favicon identity asset,
  including navbar and install exports, has no rounded tile, mask, transparent
  corner, or rendered corner clipping. The favicon alone preserves the
  full-color memoji and laptop on black with the standard rounded masked outer
  corners, rather than substituting a separately authored monochrome icon.
  Preserving this illustrative subject is the owner-approved Portfolio identity
  exception to the canonical solid-white favicon-mark default; the black frame,
  corner radius, transparent outer pixels, source ownership, and manifest sync
  remain shared Doji rules.
  `npx vp run generate:identity` regenerates the complete public identity family
  from `scripts/assets/app-logo-source.png`. The centered shared source geometry
  keeps the navbar subject's visible bottom aligned with the initial `D`.
- The page navbar is an explicit 56px border box with a full-height content
  rail and a 20px brand inset. Every primary page header places the compact
  **Follow Doga Fincan on X** header-information badge above its title. It
  links to `https://x.com/dogafincan` in a new tab with a 44px hit area around
  its 24px visual and a trailing `ArrowUpRight`.
- The navbar contains identity and genuine navigation only. Portfolio's page
  header ends after its subtitle: it has no Connect wallet, Submit project,
  DojiSnap, GitHub, X-icon, or other secondary action row. The single X-profile
  badge above the title owns the contextual profile link.
- The page shell owns responsive content and safe-area insets. Use the shared
  page rail and natural document height; do not vertically center the showcase
  to fill a viewport.
- The footer is a raised, bordered chrome surface with centered legal copy in
  `quiet-foreground`.

## Portfolio Home

- The page title is **Explore the useful products I’m building** (40
  characters), with its final two words, **I’m building**, accented.
- The subtitle is:
  **I’m Doga Fincan, a developer interested in language learning, nutrition,
  exercise, and useful products. Reach out if you’re building something
  interesting.** (155 characters).
- No action or social-icon row follows the subtitle. Portfolio keeps its only
  profile destination in the contextual X badge above the title.
- Project records render as a responsive one/two-column grid of standard
  `Card` surfaces. Each two-column row uses equal fractional tracks and aligns
  Cards to the start. Every Card, content section, and footer keeps natural
  height; the footer follows content after the required 24px structural gap.
  Unequal row bottoms are expected when descriptions differ. Do not wrap the
  grid in a second card-like workbench.
- Each project card contains one 48px current product logo, one title, one
  complete primary-page subtitle, and—when a live URL exists—a full-width
  **Open app** outline footer action. Because it opens another Doji app in a new
  tab, its visible label ends with one decorative Lucide `ArrowUpRight`, its
  accessible name states the new-tab behavior, and its link preserves
  `target="_blank"` plus `rel="noreferrer"`.
- Cards have shared borders, radii, insets, section gaps, and no box shadows.
  Do not place a Card inside another Card.
- A project without a live URL omits the action instead of rendering a disabled
  placeholder.
- A project title is the exact compact app name shown in that app's current
  navbar, not its page title or a legacy product name. The subtitle is copied
  verbatim from the app's current primary page header; do not shorten or
  paraphrase it for Portfolio.
- Product logos remain checked-in static assets under `public/projects/` as
  revision-named light/dark pairs. Render the pair with `picture`: the dark
  source responds to `prefers-color-scheme: dark`, and the light image is the
  fallback. Every project remains a muted `Item`, and its `picture` belongs in
  the standard 48px avatar/image `ItemMedia` with the primitive-owned background,
  border, radius, clipping, and `object-contain` behavior. Use the source app's
  current transparent navbar/logo artwork; do not bake that avatar container
  into the raster or use a favicon, install icon, hotlink, CSS inversion, or
  crop.
- Current source revisions are DojiMemerank `2ce5e89fce7ebff100c7d99e747db396a2ab8091`,
  DojiSwap `3eda353c8f5016a6e5321a84331838c18958e784`, DojiAirdrop
  `141d1b391ed369795663be16dcc511dfd35ddf92`, DojiSnap
  `17fd09053e51d695c1b08c9119e5bdf1444dc889`, and DojiRegistry
  `c6f191fde3c8d1238bcfd16e6f79e06d595be65b`.

## Project Submission

- `/submit` uses the canonical page header and one centered standard Card.
- Fields and the selected image stay in page memory only until payment
  succeeds. Do not persist drafts or perform pre-payment search, prefill,
  validation, upload, or other backend work.
- Use shared `Field`, `Input`, `Item`, `Badge`, `Alert`, `Dialog`, and `Button`
  primitives. The form wraps the complete Card; inputs belong in
  `CardContent`, actions and their feedback in `CardFooter`.
- Keep the shared 24px card inset/section rhythm and 12px sibling rhythm.
- Inputs and standard controls are at least 44px high. Labels are visible;
  errors are field-local and programmatically associated.
- Image input accepts static JPG, PNG, WebP, or AVIF up to 5,000,000 bytes and
  40 million decoded pixels. Preview remains local and uses a muted Item.
- **Remove image** may keep its Trash icon as the documented destructive
  file-control exception. Ordinary text actions remain text-only.
- One fee disclosure Item identifies a 10 SUI submission across every Doji app
  and combines the seven-day redemption, 90-day recovery, expiry, and
  rejection-refund terms. Payment and recovery actions stay together, with
  action-owned feedback after the complete cluster.
- Alerts use semantic surface, border, foreground, and icon pairings:
  `Info`, `CircleCheck`, `TriangleAlert`, and `CircleAlert` as appropriate.
- Once a digest exists, failure copy directs the user to recover the payment
  and explicitly avoids prompting a second payment.

## Components And Interaction

- Prefer local shadcn/Base UI primitives before custom controls.
- `Card` owns 24px inset, 24px section gap, and 12px content/footer stack gap.
  Product components do not recreate those values with local padding.
- Use `Item` for compact nested summaries; use `Alert` for status and
  recoverable feedback; use `Empty` for empty states. Every Alert uses
  `border-transparent`, and every Empty flexes and stretches to fill unused
  space below its content when its owning layout has room.
- Cards and card-like panels do not use box shadows. Modal overlays may use the
  canonical component-owned scrim, blur, and transition.
- Text-labeled buttons and button-styled links are text-only by default.
  Cross-app new-tab actions are the shared exception: keep the label first and
  one decorative Lucide `ArrowUpRight` at the inline end. Component-owned icon
  controls and documented brand/file exceptions retain accessible names.
- Standard controls expose a real 44px minimum width and height.
- The global Tailwind v4 `@layer base` rule gives `a[href]`, enabled native
  buttons, and enabled `[role="button"]` controls a pointer cursor while leaving
  native disabled buttons outside the selector. `src/styles.test.ts` and
  fine-pointer computed-style proof protect the behavior.
- Focus uses the shared three-pixel semantic ring and remains clearly visible
  in both schemes.
- Motion uses shared duration/easing roles and respects reduced motion. Loading
  indicators may spin only while work is active.
- Do not rely on color alone for status, selection, or validation.

## Static 404

- Unknown routes resolve to a real static `404.html` without Worker invocation.
- The document uses the normal Portfolio navbar, page header, footer, and one
  centered standard Card.
- The Card owns **Page not found**, explanatory copy, and the full-width
  text-only **Back to Portfolio** action.
- The page uses the same solid neutral design at every viewport and color
  scheme.
- The generated static document contains no application JavaScript, wallet
  runtime, or dynamic requests.

## Social Preview

- `public/og.png` is a checked-in 1200×630 PNG generated from `/og-preview`.
- The preview is forced dark and composed from the real social navbar and real
  Portfolio page-header components.
- Keep the **Follow Doga Fincan on X** contextual badge above the title and end
  after the complete subtitle. Do not render Connect wallet, Submit project,
  separate X or GitHub controls, or any other page-only action in the social
  composition.
- Keep a 64px safe inset around the meaningful composition. Do not add
  atmosphere, gradients, shadows, mockups, project cards, or request-time image
  generation.
- Use semantic social alt text. Metadata uses the exact absolute HTTPS URL
  `https://dogafincan.com/og.png?v=2026081401` across Open Graph and Twitter.
  Advance the version without reuse whenever the PNG bytes or composition
  changes.
- `scripts/generate-og.mjs` waits for fonts, uses reduced motion, verifies
  dimensions/safe-region/type floors, optimizes through Sharp, and replaces the
  checked-in PNG atomically.

## Responsive And Accessibility

- Preserve the same information order and action hierarchy at every width.
- Stack header and form action groups where necessary; never abbreviate required
  labels.
- No horizontal page overflow is allowed at 320px or wider.
- Images have meaningful alternative text unless decorative.
- Icon-only controls and brand links have explicit accessible names.
- Modal focus, dismissal, and focus restoration remain owned by Base UI.
- Loading has one authoritative live region. Avoid duplicate announcements.
- Touch and pointer targets meet the 44px contract except a documented
  component-owned compact affordance.

## Local Exceptions

The current migration intentionally keeps only these product-owned exceptions:

- checked-in project brand artwork;
- the **Remove image** Trash icon;
- the Portfolio-specific home copy and project-grid content.

These exceptions do not authorize new icon families, raw component colors,
decorative backgrounds, unapproved button-label icons, card shadows, or custom
control metrics. The shared trailing `ArrowUpRight` on a text-labeled action
that opens another Doji app in a new tab is an approved canonical exception.

## Adoption Proof

Before changing the adoption state or claiming this migration complete, run:

- `npx vp check`
- `npx vp test`
- `npx vp build`
- Worker type generation and relevant Wrangler dry-runs
- the canonical design-system adoption audit
- repository security audit
- rendered desktop/mobile light/dark checks for `/`, `/submit`, and
  `/404.html`
- static-404 no-JavaScript and no-dynamic-request checks
- social-image generation and geometry checks
- `git diff --check`

Record an immutable canonical source revision before changing
`Doji Design System adoption` from `migrating`.

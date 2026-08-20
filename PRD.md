# Portfolio

## Implementation progress

This table tracks implementation slices for future chats. `Done` rows are
already implemented. `Pending` rows are planned work only and should not be
treated as complete.

| Status      | Slice                                | PRD coverage        | Commit    | Notes                                                                                                                                                                                                                                                                                       |
| ----------- | ------------------------------------ | ------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Done        | Project showcase surface             | 1, 7, 8, 9, 10      | `e221b4d` | Replaces the starter page with a real portfolio route, structured sibling-project records and cards.                                                                                                                                                                                        |
| Done        | Shared app chrome and metadata       | 9.5-9.7, 12, 13, 15 | `e221b4d` | Adds logo assets, page chrome, root metadata, social preview assets, and regression coverage.                                                                                                                                                                                               |
| Done        | Remove project-section intro copy    | 8.1, 9.1, 13        | `3b6d334` | Removes the visible `Projects` heading/subtitle so the project cards lead the workbench.                                                                                                                                                                                                    |
| Done        | Align project workbench container    | 8.1, 9.1, 13        | `05aff21` | Matches the portfolio workbench container to the sibling Snapshot/Airdrop workbench treatment.                                                                                                                                                                                              |
| Done        | Remove build-principles section      | 6, 8.1, 9.1         | `ad7c462` | Removes the extra principles section and keeps the route focused on project cards.                                                                                                                                                                                                          |
| Done        | Align header typography              | 8.1, 9.1, 13        | `88a46d0` | Matches the portfolio title/subtitle sizing, weight, tracking, and foreground color to sibling apps.                                                                                                                                                                                        |
| Done        | Remove footer/profile content        | 6, 8.1, 8.3, 13     | `96a0bc7` | Removes the visible content below the project workbench so the route ends on project cards.                                                                                                                                                                                                 |
| Done        | Header social profile links          | 7, 8.1, 8.3, 9.1    | -         | Adds compact X and GitHub icon links between the header subtitle and project workbench.                                                                                                                                                                                                     |
| Done        | Keyboard-visible action focus        | 8.1, 9.4, 13        | -         | Keeps profile and live app links in DOM tab order with the same visible focus ring treatment.                                                                                                                                                                                               |
| Done        | Natural-height project workbench     | 8.1, 9.1, 13        | -         | Lets the workbench size to its project-card content instead of filling spare first-viewport height.                                                                                                                                                                                         |
| Done        | Unified page chrome background       | 9.5, 9.7, 13        | -         | Aligns safe areas, page background, shell insets, and theme colors. The later Doji Design System 1.0 migration supersedes its original atmosphere treatment.                                                                                                                                |
| Done        | Memerank project card                | 7, 8.1, 9.2-9.4     | -         | Adds Memerank to the four-card project grid with the requested card copy and live app link.                                                                                                                                                                                                 |
| Done        | Current ecosystem project identities | 7, 8.1, 9.2-9.4     | -         | Adds Doji Registry and synchronizes all five project cards to current navbar names, complete primary subtitles, canonical URLs, and revision-named light/dark logo pairs.                                                                                                                   |
| Done        | Cross-app action affordance          | 8.1, 9.3-9.4, 13    | -         | Gives every project **Open app** link the shared trailing `ArrowUpRight`, explicit new-tab accessible name, 40px Button target, and canonical new-tab link semantics.                                                                                                                       |
| Done        | Central Registry project submission  | 2, 5, 7, 8.4, 12-15 | -         | Static form, lazy wallet, generated contract, digest-bound recovery wire, static 404, narrow gateway, environment-isolated Worker type generation, and audited build dependencies are implemented. Activation remains fail closed until wallet publication.                                 |
| Done        | Temporary chain migration lockout    | 2, 7, 8.5, 9.10, 12 | -         | Preserves the Sui implementation while making wallet, payment, recovery, submission, and public dynamic entry points inaccessible during the Robinhood Chain migration. Static portfolio content remains available.                                                                         |
| Done        | Doji Design System 1.0 migration     | 8-9, 13, 15         | -         | Replaces legacy atmosphere and showcase exceptions with the canonical neutral canvas, raised chrome, standard Cards, text-only actions, static 404, and forced-dark social composition. Immutable source revision `5df1b9c102d9a28abc5437ed70b22fcba3b74c93` remains the released baseline. |
| In progress | Design-system draft migration        | 8-9, 13, 15         | -         | Adopts the Doji Design System `1.0.1-draft`: semantic descriptions render in full, Alert/Item copy targets one or two lines when possible, and the primary header follows the shared shadcn-scale copy target. Adoption remains `migrating` until release and proof gates pass.             |
| Pending     | Project case-study pages             | 7, 8.2, 9.8, 10.2   | -         | Add only when a project needs more space than a card can provide.                                                                                                                                                                                                                           |
| In progress | Production release operations        | 12, 15              | -         | A portfolio-specific runbook now records release gates, static/network proof, binding-operation budgets, and rollback. A repeatable browser smoke script remains pending.                                                                                                                   |
| Pending     | Contact action beyond profile links  | 7, 8.3, 9.9         | -         | Add only when the portfolio needs a direct contact workflow beyond simple profile links.                                                                                                                                                                                                    |

---

## 1. Product summary

The product is a personal portfolio website for showcasing projects built by
Doga Fincan. It should present real project work early, explain what each
project does in plain language, and provide clear links to live surfaces and
details that help visitors evaluate the work.

The product promise:

```text
Show real projects first.
Explain what they do.
Make live products easy to inspect when they are available.
Keep the site simple, fast, and consistent with the sibling apps.
```

## 2. Product decisions already made

| Area            | Decision                                                             |
| --------------- | -------------------------------------------------------------------- |
| App surface     | Static `/` showcase plus shared `/submit` project flow               |
| Primary content | Structured project records in `src/content/projects.ts`              |
| Current visuals | Scheme-matched current app logos in compact project cards            |
| Frontend        | React 19                                                             |
| App framework   | TanStack Start and TanStack Router                                   |
| Toolchain       | Vite+                                                                |
| Hosting         | Cloudflare Workers                                                   |
| UI components   | See `DESIGN.md`                                                      |
| Design language | See `DESIGN.md`                                                      |
| Styling         | See `DESIGN.md`                                                      |
| Icons           | Lucide only for product UI                                           |
| Design source   | `DESIGN.md` owns UI, copy, layout, icons, and social preview rules   |
| Human docs      | `README.md` explains product, workflow, commands, and deployment     |
| Agent docs      | `AGENTS.md` explains repo rules, verification, and work habits       |
| Sui runtime     | Interaction-gated wallet/payment code; absent from anonymous payload |
| Content backend | Showcase stays repo-owned; submissions go to the central Registry    |
| Auth            | No account auth; paying wallet proves paid submission/recovery       |
| Wallet flows    | Connect/disconnect, fixed 10 SUI payment, digest recovery            |
| Migration state | Sui-dependent frontend and server flows temporarily fail closed      |
| Analytics       | Not specified                                                        |

TanStack Start prerenders ordinary routes. During the migration lock,
`wrangler.assets.jsonc` serves anonymous pages and the Doji 404 without a
Worker script or runtime binding. Three exact same-origin project-submission
paths remain in the dormant backend contract and later forward through a narrow
Registry service binding.

## 3. Problem statement

The portfolio needs to show credible project work without becoming a marketing
site or importing the operational complexity of the sibling Sui utilities. A
visitor should understand the project surface, the role played, the current
focus, and where to open the app without reading a long landing page.

## 4. Target visitors

### 4.1 Primary visitors

**Project evaluators**
People who want to quickly understand the projects Doga has built, including
collaborators, hiring teams, users, and other builders.

### 4.2 Secondary visitors

**Technical reviewers**
People who want to inspect implementation choices, public project behavior, and
shared product-system decisions.

## 5. Goals

### 5.1 Visitor goals

Visitors should be able to:

1. Identify whose portfolio they are viewing.
2. See real project content without scrolling past generic marketing sections.
3. Understand each listed project in one short scan.
4. Open a live project when it exists.
5. See each project's current logo, navbar title, and complete primary subtitle without extra metadata.
6. View the site comfortably on mobile and desktop.

### 5.2 Owner goals

The portfolio should:

1. Present shipped or in-progress work clearly.
2. Reuse the proven sibling app system instead of inventing a new stack.
3. Stay maintainable through structured content.
4. Avoid claims, metrics, or polish sections that are not backed by real work.
5. Keep future expansion paths clear for case studies and contact surfaces.

### 5.3 Technical goals

The system should:

1. Keep the app deployable to Cloudflare Workers.
2. Keep the Node.js version aligned with sibling Workers Builds behavior.
3. Preserve regression coverage for root metadata, social preview, icon usage,
   page chrome, and the portfolio route.
4. Keep UI changes grounded in `DESIGN.md`.
5. Keep wallet/Sui code interaction-gated and absent from anonymous route
   payloads.
6. Keep portfolio content static and centralize only shared Doji submissions in
   Registry.
7. Reject malformed dynamic envelopes before rate limiting, service binding,
   storage, or provider work.
8. Generate Worker bindings from the committed Wrangler configuration without
   loading developer-local environment files, and keep the installed
   production and build dependency graph free of known npm advisories.
9. Reject request content encodings and require a canonical bounded
   `Content-Length` for multipart uploads before public rate limits or Registry
   forwarding, while preserving Registry's decoded image and field limits.

## 6. Non-goals

The product will not include by default:

1. A marketing landing page before the project showcase.
2. Fake metrics, testimonials, or vague claims.
3. Blog, newsletter, or CMS behavior.
4. App-level accounts or sessions.
5. Contact form or message storage.
6. Wallet use outside the shared project-submission flow.
7. Sui transaction signing outside the fixed 10 SUI Registry payment.
8. Sui providers, signing keys, storage, Durable Objects, KV, D1, R2, or queues
   in the public Portfolio Worker.
9. Turnstile.
10. Sui CSV, snapshot, airdrop, or swap workflow code.
11. Manual theme switch.
12. Product analytics unless explicitly scoped later.

## 7. Product scope

The current product includes:

1. Header with portfolio logo, title, and concise subtitle.
2. Compact header profile links for X and GitHub.
3. Structured sibling-project list.
4. Project cards with the current scheme-matched app logo, navbar name,
   complete primary subtitle, and live app link.
5. Live project links when available.
6. App logo, favicon, install icons, manifest, and social preview image.
7. Responsive shared light/dark neutral page canvas, raised browser chrome, and
   safe-area/overscroll handling from the canonical Doji Design System.
8. Regression tests for shared conventions.
9. Raised Doji navbar with Portfolio identity and genuine navigation only, plus
   primary page-header **Connect wallet** / **Disconnect wallet** and
   **Submit project** actions immediately below the subtitle at every width.
10. Static `/submit` form with manual coin type, project metadata, one local
    image, fixed 10 SUI payment, and paid-digest recovery.
11. Static, zero-JavaScript Doji 404 document.
12. Exact three-path, same-origin, rate-limited Registry gateway.

Future scope may include:

1. Case-study routes for projects that need more context.
2. Contact or profile actions beyond simple links.
3. Production smoke scripts and runbook documentation if release operations need
   the same rigor as the sibling utilities.

## 8. User experience

### 8.1 Home route

The `/` route should load into a useful portfolio surface:

```text
1. Visitor sees the logo, name, and concise positioning line.
2. Visitor can open the owner's X or GitHub profile from compact header icons.
3. Visitor immediately sees the project workbench.
4. Visitor scans real project cards without seeing the portfolio site listed as
   its own product.
5. Visitor opens a live project when one is available.
6. Visitor can identify the focused profile or live app link while navigating
   through actions by keyboard.
```

Do not reintroduce a visible `Projects` intro block or a `Build Principles`
section unless a future design/product decision explains why those surfaces help
visitors evaluate the work.

### 8.2 Case-study routes

Case-study pages are pending. Add them only when a project needs space for
screenshots, decisions, tradeoffs, or implementation notes that would overload a
project card.

### 8.3 Contact/profile surface

X and GitHub profile links are currently shown as compact icon links in the
header between the subtitle and project workbench. No separate footer/profile
surface is currently shown below the workbench. Add a contact form, profile
block, or dedicated contact route only after deciding where messages go, how
abuse is handled, and what privacy or retention policy applies.

### 8.4 Project submission

The static `/submit` page accepts one manually entered Sui Move type, project
name, short description, optional ticker and social links, and one required
static profile image. The browser validates bounded text, public HTTPS links,
the image bytes, dimensions, and animation status locally. Public website
validation must reject local and private IP destinations without mistaking
ordinary DNS hostnames for IPv6 ranges. These checks improve feedback and bound
the client payload; Registry remains authoritative.

The project details and image remain in page memory only. A new submission can
reach the Registry only after the connected wallet completes the fixed 10 SUI
payment. A user may instead provide a prior payment digest and sign the
digest-bound Registry recovery challenge. The form never performs coin search,
prefill, validation RPC, or wallet auto-connection.

### 8.5 Temporary chain migration experience

During the Sui-to-Robinhood Chain migration, static showcase content and routes
stay available while every chain-dependent action fails closed. Header actions
retain their normal labels, enabled presentation, focus behavior, and 40px Button
geometry without a migration Alert below either action or their shared cluster.
**Connect wallet** opens the normal Drawer, but its body contains only an Empty
migration explanation and **Close**; the wallet runtime is not loaded.

The submission form preserves its existing implementation, but **Pay 10 SUI**
and **Recover payment** are inert, are not marked disabled, and own one
persistent informational Alert after their complete action cluster. Portfolio
has no project or asset selector trigger, so a selector migration Drawer is not
applicable. Any future locked selector would likewise explain the migration only
inside its Empty surface, not in an Alert below its trigger.

## 9. Functional requirements

### 9.1 Header and workbench

- Header title and subtitle should use the shared sibling typography treatment.
- Compact X and GitHub icon links should sit between the subtitle and project
  workbench.
- The project workbench should use the same rounded muted container treatment as
  the sibling workbenches until there is a deliberate portfolio exception.
- The first meaningful content after the header should be real project cards.

### 9.2 Project records

- Project content lives in `src/content/projects.ts`.
- Each project record includes name, slug, subtitle, logoLight, logoDark,
  logoAlt, and liveUrl.
- Project names match the corresponding app's compact current navbar name.
  Project subtitles copy the complete primary-page subtitle verbatim from the
  same immutable source revision; Portfolio does not shorten or paraphrase it.
  Source apps own end-user-first wording that leads with the intended person's
  outcome, useful signal, and next action while keeping internal mechanics
  secondary and material qualifiers truthful.
- Current project-card order is Doji Rank, Doji Swap, Doji Drop, Doji Snap,
  and Doji Registry.
- Do not list the portfolio website as one of its own projects.
- `liveUrl` should only point to a useful public app surface.

### 9.3 Project cards

- Render one card for each project record.
- Use checked-in revision-named light/dark copies of the current transparent
  product logos, exact navbar names, and exact primary subtitles inside the
  muted `Item` summary defined in `DESIGN.md`. Place each scheme-aware logo in
  that Item's standard 48px avatar/image media container.
- Keep the live app link outside the summary item as the card footer action.
- Do not show status, role, stack, implementation highlights, source links, or
  large preview images in project cards for now.
- Do not nest cards inside project cards.

### 9.4 Links

- Live links are optional.
- Do not show repository source links in the portfolio; project repositories may
  be private.
- External links should open in a new tab and use `rel="noreferrer"`.
- Project **Open app** links should have accessible labels that include the
  project name and state that they open in a new tab.
- Every button-styled link that opens another Doji app in a new tab keeps its
  visible label first and one decorative trailing Lucide `ArrowUpRight`, while
  preserving the ordinary 40px outline Button target and keyboard focus treatment.
- Header profile links should have accessible labels that include the profile
  destination.
- Header profile links and project live app links should stay in their natural
  DOM tab order and use a visible shared focus ring treatment when
  keyboard-focused.

### 9.5 Metadata and manifest

- Root document should include manifest links, app icons, font preload ordering,
  and theme-color metadata.
- Root viewport metadata should use `viewport-fit=cover`, with the raised
  chrome color spanning safe areas and responsive insets on `.app-navbar` and
  `.app-shell`.
- Manifest and theme colors stay aligned to the neutral chrome:
  `#FFFFFF` light, `#090909` dark, and `#FCFCFC` manifest background.
- Header logo images should define `width`, `height`, `sizes`, and `srcset`,
  and the header logo wrapper should preserve the logo's rounded-square shape
  while showing a visible border.

### 9.6 Social preview

- Social metadata must use absolute HTTPS URLs for images.
- The social image must be a generated checked-in 1200x630 truecolor RGB
  `public/og.png` with `og:image:type=image/png` and a cache-busting query in
  `src/routes/index.tsx`.
- Generate the social image from the React/Tailwind `/og-preview` route with
  `npx vp run generate:og`. Do not add a social SVG source or dynamic request-time
  image endpoint.

### 9.7 Shared UI conventions

- Use the canonical Doji Design System skill plus `DESIGN.md` as the source of
  truth for visual, layout, icon, loading, alert, empty-state, responsive, and
  copy contracts.
- Product UI icons should remain on Lucide.
- Buttons, editable fields, search fields, input-like controls, and contextual-
  badge hit regions share the `40px` minimum-height contract.
- The app should respect system dark mode.

### 9.8 Case-study pages

Pending. When added, each case-study route should be project-specific, link back
to the project card source data, and avoid replacing the home route as the main
project index.

### 9.9 Contact

Pending. A contact feature needs a separate product decision covering form
destination, abuse prevention, privacy, and retention.

### 9.10 Temporary chain migration lockout

- Do not mount, import, connect, or expose wallet choices from the user-reachable
  migration Drawer.
- Do not let a locked frontend action validate, open payment recovery, call an
  API, sign, pay, upload, or otherwise begin chain-dependent work.
- Locked ordinary actions retain their normal label and enabled appearance and
  do not use the `disabled` attribute.
- Place one persistent informational Doji Alert immediately after each complete
  locked action cluster.
- Do not place a migration Alert below **Connect wallet**, a project/asset
  selector trigger, or a shared action cluster containing either control. Those
  controls explain the migration only inside the Empty surface they open.
- Production dynamic URLs receive the static 404 boundary without paid Worker
  execution. Retained dynamic API and broad server-function handlers return one
  canonical no-store JSON `503` response before envelope processing, limiters,
  service bindings, providers, or mutations.
- Preserve the existing Sui frontend and backend implementation for the later
  Robinhood Chain migration; this slice does not remove or rewrite it.

## 10. Information architecture

### 10.1 Current route map

| Route | Purpose                               | Status |
| ----- | ------------------------------------- | ------ |
| `/`   | Portfolio header and project showcase | Done   |

### 10.2 Potential future routes

| Route pattern     | Purpose                              | Status  |
| ----------------- | ------------------------------------ | ------- |
| `/projects/$slug` | Project case study or implementation | Pending |
| `/contact`        | Direct contact workflow              | Pending |

Future routes should be added only when the content or workflow cannot fit in
the current route.

## 11. Content model

The current content model is a TypeScript array. That is the correct level of
complexity until the project list, case-study content, or editing workflow needs
MDX, markdown files, or a CMS.

When adding a project:

1. Add the project record to `src/content/projects.ts`.
2. Copy the current transparent light/dark logo pair from the source revision
   into revision-named files under `public/projects/`.
3. Copy the current compact navbar name and complete primary subtitle exactly.
4. Verify the project card renders in light/dark themes on mobile and desktop.
5. Update tests if the new project changes expected structure or metadata.

## 12. Technical and deployment shape

- The app is a TanStack Start app served on Cloudflare Workers.
- `.node-version` pins Node.js `24.14.0` to match the sibling Workers Builds
  setup.
- `wrangler.jsonc` declares Static Assets, four rate-limit bindings, and one
  narrow `REGISTRY_PUBLIC_GATEWAY` service binding. It declares no product
  storage, Durable Objects, queues, Sui provider, signing key, or wallet secret.
- Static Assets serves `/`, `/submit`, `/og-preview`, and unknown routes.
  Unknown routes use the generated zero-JavaScript `404.html`.
- Only `/api/v1/payment/challenge`,
  `/api/v1/payment/redeem-project-submission`, and `/api/v1/submissions` run the
  Worker. Queries, wrong methods/origins/media types, and oversized declared
  bodies are rejected before limiter or binding access.
- Deployment uses `npx vp run deploy`, which builds the app and deploys with
  Wrangler.
- Worker type generation uses `npx vp run cf-typegen`; the wrapper isolates
  Wrangler from developer-local env files and normalizes only whitespace-only
  generated-line noise.
- `docs/production-runbook.md` defines release, browser-network, abuse, and
  rollback checks. A repeatable production smoke script remains a separate
  pending slice.

### 12.1 Payment and recovery boundary

- The checked-in Registry publication is runtime-validated with the exact
  generated JSON Schema validator. Until Registry publishes an enabled
  submission configuration and treasury address, new payments are unavailable.
- A new project payment is exactly `10000000000` MIST. Every customer amount at
  the client contract is a canonical positive decimal string no greater than
  Sui `u64`.
- Project payment terms bind the static configuration revision and its
  `validFrom` timestamp as `executionValidFromMs`. An optional valid-until must
  be on or after valid-from.
- No challenge request exists before a payment digest. The challenge body is
  exactly `{digest,walletAddress}`, so its displayed message is bound to the
  specific payment and paying wallet.
- A new payment performs one wallet transaction, then one challenge, one
  redemption, and at most one image upload. Portfolio never calls
  `waitForTransaction`, polls Sui, races providers, or owns a Sui RPC binding.
- Recovery reuses the original digest, requires a fresh digest-bound wallet
  signature, and may omit the current configuration revision so Registry can
  resolve the server-known reservation. If the prior upload already completed,
  redemption returns the immutable accepted receipt without a second upload.
- Registry—not Portfolio—owns transaction observation and replay accounting.
  Only `transaction_failed` and `payment_too_old` are safe digest-global
  negative facts; wallet, marker, sender, recipient, amount, and revision
  mismatches remain claim-specific.

### 12.2 Provider and binding-operation budget

- Static pages, form edits, local image validation, wallet connection, and
  status display make zero Portfolio-originated Sui or application API calls.
- Payment execution uses dApp Kit's wallet-standard sign-and-execute action.
  The SDK may use the configured Sui client while constructing transaction
  bytes, but Portfolio makes no separate direct execution request.
- Portfolio never observes the transaction itself. Registry owns one admitted
  digest observation, historical-term validation, and replay accounting.
- Challenge forwarding uses at most two rate-limit operations and one service
  binding. Redemption and upload use at most four rate-limit operations and one
  service binding because both use the tighter paid lane.
- Invalid envelopes are rejected before a limiter or service binding.

Do not add a Portfolio Sui provider binding, request-held polling, parallel
provider racing, browser-selected endpoints, or a second post-payment
observation.

## 13. Design requirements

Design requirements live in `DESIGN.md`. PRD slices that change UI, copy,
layout, alerts, icons, loading states, empty states, responsive behavior, or
social preview shape should reference that file instead of restating visual
rules here.

## 14. Risks and mitigations

| Risk                                     | Mitigation                                                                        |
| ---------------------------------------- | --------------------------------------------------------------------------------- |
| Portfolio becomes generic marketing page | Keep real project cards on the first screen and avoid filler sections.            |
| Docs drift from implementation           | Update `README.md`, `AGENTS.md`, `PRD.md`, and `DESIGN.md` by ownership.          |
| Sui runtime increases anonymous cost     | Lazy-load wallet code only after Connect wallet; prerender ordinary routes.       |
| Unpaid abuse reaches Registry            | Exact paths, cheap envelope rejection, same-origin checks, client/location fuses. |
| Wallet configuration is missing          | Publish a generated Registry contract; keep new payments fail closed until then.  |
| Social preview cache becomes stale       | Update image cache-busting query and metadata tests with image changes.           |
| Case-study scope grows too broad         | Add project-specific pages only when card content is not enough.                  |
| Deployment confidence lags siblings      | Follow the runbook; add a repeatable browser smoke script as a later slice.       |

## 15. Acceptance criteria

The product is ready for the current portfolio scope when:

1. The `/` route renders a portfolio header and real project cards.
2. Each project card shows a sibling project with an app icon, name, subtitle,
   and live app link.
3. Live links open in a new browser tab.
4. Project data is structured in `src/content/projects.ts`.
5. The app uses the shared page chrome, logo assets, Geist preload, and manifest
   conventions.
6. Product UI icons use Lucide.
7. Social metadata uses an absolute HTTPS image URL.
8. Header X and GitHub profile links open in a new browser tab.
9. The page has no generic project intro, build-principles filler, decorative
   workbench wrapper, or redundant profile section. It ends with the canonical
   legal footer.
10. The layout has no horizontal overflow at mobile and desktop widths.
11. `npx vp check`, `npx vp test`, and `npx vp build` pass before production
    readiness is claimed.
12. `README.md`, `AGENTS.md`, `PRD.md`, and `DESIGN.md` each document their
    owned part of the project without duplicating broad policy.
13. The header keeps full wallet and submit labels at every width, stacks them
    on narrow screens, and never displays the connected address.
14. Form editing, image preview, and wallet connection make no Portfolio API or
    Sui RPC calls; the first dynamic submission work follows a completed
    payment or a user-entered recovery digest.
15. Wallet/Sui code is isolated from initial static HTML and initial executable
    payloads and loads only after explicit wallet interaction.
16. Payment amounts are canonical positive decimal MIST no greater than Sui
    `u64`, and a new payment is exactly `10000000000` MIST.
17. Unknown routes are served by the Doji static 404 without Worker invocation.
18. The solid neutral page, raised navbar/footer, Cards, controls, status
    surfaces, responsive behavior, and social image conform to the canonical
    Doji Design System with only the exceptions documented in `DESIGN.md`.
19. The provider and binding-operation budgets in section 12.2 pass the
    runbook's build and browser-network checks.

## 16. One-paragraph product definition

The product is a focused personal portfolio built on the same TanStack Start,
Vite+, shadcn/Base UI, Tailwind, Geist, Lucide, and Cloudflare Workers system as
the sibling Sui utility apps. It shows real projects first, using structured
project records, product-owned app icons, concise plain-language subtitles, and
live app links. It also offers the same paid project-submission flow as every
Doji app while keeping ordinary pages static: form data stays local until a
fixed 10 SUI payment, wallet/Sui code loads only after interaction, and the
public Worker can only proxy three exact routes to the central Registry.

## 17. Reference links

- Sui Snapshot repo docs: `~/Documents/sui-snapshot/README.md`,
  `~/Documents/sui-snapshot/AGENTS.md`, and
  `~/Documents/sui-snapshot/DESIGN.md`
- Sui Airdrop repo docs: `~/Documents/sui-airdrop/README.md`,
  `~/Documents/sui-airdrop/AGENTS.md`,
  `~/Documents/sui-airdrop/PRD.md`, and
  `~/Documents/sui-airdrop/DESIGN.md`
- TanStack Start overview: https://tanstack.com/start/v0/docs/framework/react/overview
- shadcn/ui documentation: https://ui.shadcn.com/

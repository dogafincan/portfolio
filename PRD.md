# Portfolio

## Implementation progress

This table tracks implementation slices for future chats. `Done` rows are
already implemented. `Pending` rows are planned work only and should not be
treated as complete.

| Status  | Slice                                  | PRD coverage        | Commit    | Notes                                                                                                   |
| ------- | -------------------------------------- | ------------------- | --------- | ------------------------------------------------------------------------------------------------------- |
| Done    | Project showcase surface               | 1, 7, 8, 9, 10      | `e221b4d` | Replaces the starter page with a real portfolio route, structured project records, cards, and links.    |
| Done    | Shared app chrome and metadata         | 9.5-9.7, 12, 13, 15 | `e221b4d` | Adds logo assets, mesh chrome, root metadata, social preview assets, and regression coverage.           |
| Done    | Remove project-section intro copy      | 8.1, 9.1, 13        | `3b6d334` | Removes the visible `Projects` heading/subtitle so the project cards lead the workbench.                |
| Done    | Align project workbench container      | 8.1, 9.1, 13        | `05aff21` | Matches the portfolio workbench container to the sibling Snapshot/Airdrop workbench treatment.          |
| Done    | Remove build-principles section        | 6, 8.1, 9.1         | `ad7c462` | Removes the extra principles section and keeps the route focused on project cards.                      |
| Done    | Align header typography                | 8.1, 9.1, 13        | `88a46d0` | Matches the portfolio title/subtitle sizing, weight, tracking, and foreground color to sibling apps.    |
| Done    | Remove footer/profile content          | 6, 8.1, 8.3, 13     | `96a0bc7` | Removes the visible content below the project workbench so the route ends on project cards.             |
| Pending | Project case-study pages               | 7, 8.2, 9.8, 10.2   | -         | Add only when a project needs more space than a card can provide.                                       |
| Pending | Production smoke scripts and runbook   | 12, 15              | -         | Add portfolio-specific release gates when deploys need the same production-hardening depth as siblings. |
| Pending | Contact or profile action beyond links | 7, 8.3, 9.9         | -         | Add only when the portfolio needs a direct contact or profile workflow beyond simple project links.     |

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

| Area            | Decision                                                           |
| --------------- | ------------------------------------------------------------------ |
| App surface     | Single `/` route until case-study pages are justified              |
| Primary content | Structured project records in `src/content/projects.ts`            |
| Current visuals | Product-owned OG/social images for project previews                |
| Frontend        | React 19                                                           |
| App framework   | TanStack Start and TanStack Router                                 |
| Toolchain       | Vite+                                                              |
| Hosting         | Cloudflare Workers                                                 |
| UI components   | See `DESIGN.md`                                                    |
| Design language | See `DESIGN.md`                                                    |
| Styling         | See `DESIGN.md`                                                    |
| Icons           | Lucide only for product UI                                         |
| Sui runtime     | Not included unless a future portfolio feature explicitly needs it |
| Content backend | None; repo-owned structured content is the current source of truth |
| Auth            | None                                                               |
| Wallet flows    | None                                                               |
| Analytics       | Not specified                                                      |

TanStack Start is used here because it matches the sibling workspace stack and
can support future case-study routes or server-rendered metadata without adding a
larger framework boundary. Product backend behavior should remain absent unless
a future portfolio feature needs it.

## 3. Problem statement

The portfolio needs to show credible project work without becoming a marketing
site or importing the operational complexity of the sibling Sui utilities. A
visitor should understand the project surface, the role played, the current
status, the stack, and where to inspect the work without reading a long landing
page.

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
5. See the role, status, stack, and practical highlights for each project.
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
   mesh chrome, and the portfolio route.
4. Keep UI changes grounded in `DESIGN.md`.
5. Avoid Sui-specific runtime dependencies until product scope changes.
6. Prefer static structured content over CMS or backend state.

## 6. Non-goals

The product will not include by default:

1. A marketing landing page before the project showcase.
2. Fake metrics, testimonials, or vague claims.
3. Blog, newsletter, or CMS behavior.
4. App-level auth.
5. Contact form or message storage.
6. Wallet connection.
7. Sui transaction signing.
8. Mysten dApp Kit or Mysten Sui SDK runtime dependencies.
9. Turnstile, rate limiting, Durable Objects, KV, D1, R2, queues, or backend
   state.
10. Sui CSV parsing or snapshot/airdrop workflow code.
11. Manual theme switch.
12. Product analytics unless explicitly scoped later.

## 7. Product scope

The current product includes:

1. Header with portfolio logo, title, and concise subtitle.
2. Structured project list.
3. Project cards with image, status, role, name, summary, stack, highlights, and
   live links when available.
4. Live project links when available.
5. App logo, favicon, install icons, manifest, and social preview image.
6. Responsive light/dark mesh page chrome.
7. Regression tests for shared conventions.

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
2. Visitor immediately sees the project workbench.
3. Visitor scans real project cards.
4. Visitor opens a live project when one is available.
```

Do not reintroduce a visible `Projects` intro block or a `Build Principles`
section unless a future design/product decision explains why those surfaces help
visitors evaluate the work.

### 8.2 Case-study routes

Case-study pages are pending. Add them only when a project needs space for
screenshots, decisions, tradeoffs, or implementation notes that would overload a
project card.

### 8.3 Contact/profile surface

No separate footer/profile surface is currently shown below the workbench. Add a
contact form, profile block, or dedicated contact route only after deciding where
messages go, how abuse is handled, and what privacy or retention policy applies.

## 9. Functional requirements

### 9.1 Header and workbench

- Header title and subtitle should use the shared sibling typography treatment.
- The project workbench should use the same rounded muted container treatment as
  the sibling workbenches until there is a deliberate portfolio exception.
- The first meaningful content after the header should be real project cards.

### 9.2 Project records

- Project content lives in `src/content/projects.ts`.
- Each project record includes name, slug, summary, role, status, image,
  imageAlt, stack, and highlights.
- `liveUrl` is optional and should only be present when a useful live surface
  exists.

### 9.3 Project cards

- Render one card for each project record.
- Use real product-owned visual previews.
- Show status and role before the project name.
- Show summary before stack and implementation highlights.
- Use muted shadcn `Item` surfaces for compact metadata.
- Do not nest cards inside project cards.

### 9.4 Links

- Live links are optional.
- Do not show repository source links in the portfolio; project repositories may
  be private.
- External links should open in a new tab and use `rel="noreferrer"`.
- Buttons should have accessible labels that include the project name.

### 9.5 Metadata and manifest

- Root document should include manifest links, app icons, font preload ordering,
  and theme-color metadata.
- Manifest colors should match the page chrome top color.
- Header logo images should define `width`, `height`, `sizes`, and `srcset`.

### 9.6 Social preview

- Social metadata must use absolute HTTPS URLs for images.
- The social image must be `public/og-image.png` with a cache-busting query in
  `src/routes/index.tsx`.
- The social image should use the dark-mode header composition only.

### 9.7 Shared UI conventions

- Use `DESIGN.md` as the source of truth for visual, layout, icon, loading,
  alert, empty-state, responsive, and copy contracts.
- Product UI icons should remain on Lucide.
- Button targets should remain at least `44px` tall.
- The app should respect system dark mode.

### 9.8 Case-study pages

Pending. When added, each case-study route should be project-specific, link back
to the project card source data, and avoid replacing the home route as the main
project index.

### 9.9 Contact

Pending. A contact feature needs a separate product decision covering form
destination, abuse prevention, privacy, and retention.

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
2. Add a product-owned preview image under `public/projects/` when possible.
3. Verify the project card renders on mobile and desktop.
4. Update tests if the new project changes expected structure or metadata.

## 12. Technical and deployment shape

- The app is a TanStack Start app served on Cloudflare Workers.
- `.node-version` pins Node.js `24.14.0` to match the sibling Workers Builds
  setup.
- `wrangler.jsonc` currently declares no storage bindings, Durable Objects,
  queues, or secrets.
- Deployment uses `npx vp run deploy`, which builds the app and deploys with
  Wrangler.
- Worker type generation uses `npx vp run cf-typegen`.
- No production smoke scripts or production runbook are currently specified for
  this repo. Add those as a separate slice if deploy operations need them.

## 13. Design requirements

Design requirements live in `DESIGN.md`. PRD slices that change UI, copy,
layout, alerts, icons, loading states, empty states, responsive behavior, or
social preview shape should reference that file instead of restating visual
rules here.

## 14. Risks and mitigations

| Risk                                     | Mitigation                                                                   |
| ---------------------------------------- | ---------------------------------------------------------------------------- |
| Portfolio becomes generic marketing page | Keep real project cards on the first screen and avoid filler sections.       |
| Docs drift from implementation           | Update `README.md`, `AGENTS.md`, `PRD.md`, and `DESIGN.md` by ownership.     |
| Sui runtime complexity leaks into app    | Keep Sui-specific workflows in sibling repos unless portfolio scope changes. |
| Social preview cache becomes stale       | Update image cache-busting query and metadata tests with image changes.      |
| Case-study scope grows too broad         | Add project-specific pages only when card content is not enough.             |
| Deployment confidence lags siblings      | Add smoke scripts/runbook as a separate pending production-hardening slice.  |

## 15. Acceptance criteria

The product is ready for the current portfolio scope when:

1. The `/` route renders a portfolio header and real project cards.
2. Each project card shows a visual preview, status, role, name, summary, stack,
   highlights, and optional live link.
3. Live links render only when available.
4. Project data is structured in `src/content/projects.ts`.
5. The app uses the shared mesh chrome, logo assets, Inter preload, and manifest
   conventions.
6. Product UI icons use Lucide.
7. Social metadata uses an absolute HTTPS image URL.
8. The page has no visible generic project intro, build-principles filler
   section, or footer/profile content below the workbench.
9. The layout has no horizontal overflow at mobile and desktop widths.
10. `npx vp check`, `npx vp test`, and `npx vp build` pass before production
    readiness is claimed.
11. `README.md`, `AGENTS.md`, `PRD.md`, and `DESIGN.md` each document their
    owned part of the project without duplicating broad policy.

## 16. One-paragraph product definition

The product is a focused personal portfolio built on the same TanStack Start,
Vite+, shadcn/Base UI, Tailwind, Inter, Lucide, and Cloudflare Workers system as
the sibling Sui utility apps. It shows real projects first, using structured
project records, product-owned visuals, concise plain-language summaries,
implementation highlights, and live links when useful. It deliberately avoids
source links for private repositories, wallet flows, Sui transaction logic,
storage bindings, and backend state unless a future portfolio feature needs
them.

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

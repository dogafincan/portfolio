# Portfolio production runbook

This runbook is the release boundary for Portfolio's static delivery, paid
Registry gateway, and zero-background-Sui-call contract. It does not authorize
a deploy.

## Temporary migration state

The current release is intentionally locked while Doji migrates from Sui to
Robinhood Chain. Static routes remain available. Wallet runtime loading,
payment, upload, and Registry forwarding must remain unreachable.
Every public dynamic API and broad server-function request returns the same
no-store JSON `503` before envelope processing, limiters, bindings, providers,
or mutations. Do not remove the preserved Sui implementation merely to enforce
this temporary state.

### Safari document-restore resilience

Keep `/`, `/submit`, `/og-preview`, and `/404.html` on `Cache-Control:
no-store`; keep fingerprinted `/assets/*` files immutable. The document head
installs the self-contained app-shell recovery guard before hydrated head
content and application scripts. It checks a restored shell and scoped
module/chunk failures, then reloads the same-origin document at most once per
tab. A healthy load has no visible recovery UI and the guard may not initialize
wallet, provider, Registry, backend, application-cache, analytics, or polling
work.

For a Safari-profile-only white page, inspect the document and network timeline
before changing Cloudflare. An empty document with no request points to local
restore; a real request requires response and mitigation inspection. After
deployment, verify root HTTP 200, `Cache-Control: no-store`, early-script
ordering, a rendered `.app-shell`, and unchanged immutable asset caching.

## Activation prerequisites

- The owner has supplied the real Registry publication and treasury address.
- Registry-generated files are byte-identical to the accepted Registry
  contract.
- The four account-wide-unique rate-limit namespaces and the narrow
  `REGISTRY_PUBLIC_GATEWAY` binding exist.
- `workers.dev` and preview URLs remain disabled.
- Wallet addresses, bindings, and resource IDs are never guessed.
- The owner has approved a replacement chain contract and the temporary
  migration lock has been deliberately removed with updated tests and docs.

## Local release gates

Run from the repository root:

```bash
npx vp check
npx vp test
npx vp run generate:og
npx vp build
npx vp run cf-typegen
npm run deploy:dry-run
npm audit
git diff --check
```

The build must prerender `/`, `/submit`, `/og-preview`, and `/404.html`. The
final static `404.html` must contain no hydration script, module preload, wallet
runtime, or application API call.

## Browser and network proof

Use a clean browser context against the built preview and record requests:

1. Load `/`, `/submit`, and a nonexistent path at narrow and wide widths in
   light and dark modes.
2. Confirm those loads make no request to `fullnode.mainnet.sui.io`, any other
   Sui provider, or `/api/v1/*`.
3. Edit every field and validate a profile image. Confirm no API, Sui, indexer,
   search, or upload request occurs.
4. Activate **Connect wallet**. Confirm the existing Drawer opens with one Empty
   migration explanation and **Close**, no wallet choices, and no wallet-runtime
   or provider request.
5. Confirm an unknown route returns the static 404 without a Worker-owned
   dynamic response.
6. Do not exercise a payment unless the owner separately authorizes spending.

Wallet extensions can make their own network requests. Attribute requests to
Portfolio only when they originate from the page/runtime client, not the
extension process.

## Request ceilings

| Flow                                                        | Portfolio-owned dynamic ceiling                           |
| ----------------------------------------------------------- | --------------------------------------------------------- |
| Static load, edit, image validation, wallet connect, status | 0 API and 0 Sui                                           |
| Payment                                                     | Wallet-standard action; 0 separate direct execution calls |
| Challenge gateway                                           | 2 rate-limit operations plus 1 service binding            |
| Redemption gateway                                          | 4 rate-limit operations plus 1 service binding            |
| Paid upload gateway                                         | 4 rate-limit operations plus 1 service binding            |
| Transaction observation                                     | 0 in Portfolio; central Registry owns it                  |

While the migration lock is active, every chain-dependent row above has an
effective external-operation ceiling of zero; direct dynamic requests return
the canonical `503` before a limiter or service binding.

## Dynamic abuse checks

- Wrangler's Worker-first list contains only the three exact submission paths.
- `src/start.ts` returns the canonical migration `503` for all three paths and
  broad `/_serverFn/*` requests before the preserved envelope guard.
- `src/start.ts` rejects every broad `/_serverFn/*` path.
- Query variants, wrong method/origin/media type, encoded bodies, invalid
  multipart boundaries, absent/noncanonical multipart lengths, and oversized
  declarations fail before limiters and the service binding.
- Challenge uses public client/location fuses. Redemption and upload use both
  public and tighter paid client/location fuses.
- Missing bindings fail closed.
- The public Worker has no D1, KV, R2, Durable Object, Queue, signer, or Sui
  provider binding.

## Incident response

If Registry or Sui is degraded, do not add browser polling or direct provider
fallback. Keep new payments fail closed when configuration is unavailable.
For an interrupted paid submission, preserve the displayed digest for support
and do not ask the payer to pay again. Portfolio exposes no manual recovery,
retry, or digest-entry workflow.

## Rollback

Rollback means redeploying a previously verified static and Worker artifact
with its matching generated Registry contract. Never roll back only generated
contract files or only the Worker when that creates a revision mismatch. Re-run
the static, browser-network, and dry-run checks before applying the rollback.

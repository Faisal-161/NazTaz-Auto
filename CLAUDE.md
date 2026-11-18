# {{BRAND}} — Custom LED Puddle Light Storefront

@AGENTS.md

US-facing DTC store for custom LED puddle lights (door / side-mirror projectors that shine a logo,
name or design on the ground). Solo founder; Claude is the lead developer. Brand name and domain
are undecided — always write `{{BRAND}}` (it lives in `content/site.ts`, change it in one place).

**Current scope:** complete frontend, every feature working end-to-end on MOCK DATA. Shopify comes
later and must be a data-adapter swap, not a rewrite. SEO content comes later but must not be blocked.

## Read before working
| Topic | File |
| --- | --- |
| Business, customers, pricing, competitor, legal rules | [docs/brief.md](docs/brief.md) |
| Stack, commerce adapter, folders, rendering rules | [docs/architecture.md](docs/architecture.md) |
| Data models + cart line attributes | [docs/data-models.md](docs/data-models.md) |
| Routes, global UI, homepage sections | [docs/routes.md](docs/routes.md) |
| Feature specs F1–F10 | [docs/features.md](docs/features.md) |
| Design tokens + visual direction | [docs/design-system.md](docs/design-system.md) |
| Perf budgets, a11y, review gate | [docs/quality.md](docs/quality.md) |
| Roadmap (keep checkboxes current) | [docs/roadmap.md](docs/roadmap.md) |
| Decisions + open questions | [docs/decisions.md](docs/decisions.md) |
| **What's already built (read first)** | [docs/progress.md](docs/progress.md) |

## Commands (pnpm only)
```
pnpm dev            # next dev (Turbopack)
pnpm build          # production build — check route sizes against budgets
pnpm lint           # eslint
pnpm typecheck      # tsc --noEmit
pnpm test           # vitest run (unit: lib/**, components)
pnpm e2e            # playwright test (e2e/)
pnpm format         # prettier --write
pnpm shots          # playwright screenshots at 390px + 1440px -> .artifacts/screenshots
pnpm ci             # lint + typecheck + test + build (what CI runs)
```

## Next.js 16.4 — this is NOT older Next
- `cacheComponents: true` + `partialPrefetching: true` are on. Async data in a server component
  must be inside `'use cache'` (with `cacheLife`) or wrapped in `<Suspense>`. No `export const
  dynamic/revalidate`. `new Date()`, `Math.random()` in a prerender fail the build.
- `params` / `searchParams` are Promises: `const { handle } = await props.params`.
- Use `PageProps<'/products/[handle]'>` / `LayoutProps<'/'>` global helper types.
- `middleware.ts` is now `proxy.ts`. `next lint` is gone: use `eslint` CLI.
- Before using an unfamiliar Next API, read `node_modules/next/dist/docs/`. For other libraries use
  the Context7 MCP when it is connected; never guess an API.

## Architecture rules (non-negotiable)
1. **All data goes through `lib/commerce/`.** Components never `fetch`, never import `data/*.json`.
   `getCommerce()` from `lib/commerce` picks `mock` or `shopify` by `COMMERCE_PROVIDER`.
2. Both adapters implement `CommerceAdapter` in `lib/commerce/types.ts`. Add a method there first,
   then mock, then a typed TODO stub in shopify.
3. Cart line attributes use Shopify-compatible keys: `_vehicle`, `_housing_code`, `_fit_method`,
   `_design_id`, `_design_preview`. Keys live in `lib/commerce/attributes.ts`; never inline strings.
4. Checkout: mock page now (`/checkout`); later redirect to `cart.checkoutUrl`. Don't build UI that
   assumes we own checkout.
5. Pure logic lives in `lib/fitment`, `lib/projection`, `lib/pricing` — no React, no DOM, unit-tested.
6. Client state (cart, garage, customizer) = Zustand stores in `lib/stores/`, persisted to
   localStorage, SSR-safe (render nothing count-dependent until hydrated).
7. **No hard-coded product/vehicle data in components. All copy lives in `content/`.**
8. Products are per HOUSING, not per vehicle. Vehicles → fitment → housings → products.

## Rendering + performance
- Server Components by default. `"use client"` only for interactivity, at the smallest leaf.
- GSAP, canvas, video, heavy dialogs: `next/dynamic` or load on view. Never in the first-load bundle.
- `next/image` always, with `sizes`. Only the LCP image gets `priority`.
- First-load client code (header actions, sticky CTA, `app/error.tsx`) uses `cx()` from
  `lib/cx` and `buttonVariants` — NOT `cn()`/`<Button>` (tailwind-merge + Slot ≈ 10KB gz).
  Overlays mount on first open via `next/dynamic`. Run `pnpm analyze:size` after `pnpm build`.
- Budgets (mobile 4G): LCP < 2.5s, CLS < 0.1, INP < 200ms, first-load JS < 150KB gz on Home and
  Product. Lighthouse mobile ≥ 90. See docs/quality.md.
- Every animation has a `prefers-reduced-motion` fallback (CSS: `motion-safe:` / `motion-reduce:`;
  JS: `usePrefersReducedMotion()` from `lib/hooks`).

## Accessibility (WCAG 2.2 AA)
- Keyboard-usable finder, customizer, drawer, dialogs. Use Radix primitives for dialogs, menus,
  selects, tabs, toasts — don't hand-roll focus traps.
- Visible focus (`focus-visible:ring`), labels on every input, 24×24 min target, AA contrast on the
  dark theme (check muted text!).
- One `<h1>` per page, semantic landmarks (`header`, `nav`, `main#main`, `footer`), skip link.

## SEO-ready (no SEO content yet)
- Clean, lowercase, hyphenated URLs. Server-rendered content. Every route exports `metadata` or
  `generateMetadata` via `lib/seo/metadata.ts` helper (titles only for now).

## Legal / content rules
- NEVER copy custompuddlelights.com (Ludicrous Revolution Inc / PimpMyEV): no name, text, images,
  layout or reviews. No competitor images anywhere.
- No car-maker logos as designs or in our art. Uploads require a rights checkbox.
- No fake reviews or stats. Sample data is labelled "Sample" in the UI (`<SampleBadge />`).
- Placeholder media is clearly marked (`<PlaceholderMedia />`).

## Code style
- TypeScript strict, no `any` (use `unknown` + zod). Zod schemas validate fixtures and forms.
- Components: PascalCase files, named exports. One component per file in `components/<area>/`.
- Styling: Tailwind utilities backed by CSS-variable tokens in `app/globals.css`. No raw hex in
  components. Compose classes with `cn()` from `lib/utils`.
- Variants with `class-variance-authority`. Icons from `lucide-react` (import per icon).
- Forms: react-hook-form + zod resolver. Error messages from `content/`.
- Tests next to the domain: `tests/unit/**` for lib, `tests/components/**`, `e2e/**`.

## How to work
- **Start every session by reading [docs/progress.md](docs/progress.md)** — it lists everything
  already built. Don't rebuild or re-derive what's listed there.
- One roadmap item at a time (docs/roadmap.md). Use plan mode for big features.
- **After finishing each feature, append its full listing to docs/progress.md** (files, routes,
  data, adapter methods, tests, verification, gaps/TODOs) and tick docs/roadmap.md.
- New feature → run the `new-feature` skill (`.claude/skills/new-feature/SKILL.md`).
- After every UI change: screenshot 390px + 1440px (Playwright MCP, or `pnpm shots`), check
  console errors and keyboard tab order.
- Before marking anything done: run `pnpm ci`, then the `perf-a11y-reviewer` subagent. Only a
  PASS verdict lets you tick the roadmap box.
- Phase 2: use the Shopify Dev MCP to validate every Storefront API query.
- Secrets in `.env.local` only; document every var in `.env.example`.
- Record notable decisions in docs/decisions.md.

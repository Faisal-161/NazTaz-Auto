# Progress log

**Read this at the start of every session.** It lists everything already built, so nothing is
rebuilt or re-derived. Append one entry per finished feature (newest at the bottom) using the
template at the end. Keep [roadmap.md](roadmap.md) checkboxes in sync.

---

## Phase 1A: Foundation (2026-11-18)

**Status:** built. Reviewer verdict and screenshots are recorded under _Verification_.

### Tooling and config

| File                                   | What                                                                                                                                                                                                              |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `package.json`                         | Scripts: dev, build, start, lint, typecheck (`next typegen && tsc`), test, test:watch, e2e, shots, format, format:check, analyze:size, ci. pnpm 9, Node ≥ 20.9                                                    |
| `next.config.ts`                       | cacheComponents + partialPrefetching, AVIF/WebP, sandboxed SVG placeholders, `optimizePackageImports` (lucide, radix), Tailwind turbopack loader                                                                  |
| `tsconfig.json`                        | strict + `noUncheckedIndexedAccess`, `noImplicitOverride`, ES2022, `@/*` alias                                                                                                                                    |
| `eslint.config.mjs`                    | next core-web-vitals + TS + prettier; **architecture rules**: no `@/data/*` imports and no direct adapter imports outside `lib/commerce`; no global `fetch` in app/components/lib (except lib/commerce); no `any` |
| `.prettierrc.json` / `.prettierignore` | no semis, single quotes, width 100, tailwind class sorting (`cn`, `cva`)                                                                                                                                          |
| `vitest.config.mts`                    | jsdom, `resolve.tsconfigPaths`, `tests/**/*.test.{ts,tsx}`, setup `tests/setup.ts`                                                                                                                                |
| `playwright.config.ts`                 | projects: `chromium`, `reduced-motion` (Pixel 7, reduce), `shots` (captures). Prod server for CI / `pnpm shots`                                                                                                   |
| `.github/workflows/ci.yml`             | lint → format:check → typecheck → test → build → analyze:size                                                                                                                                                     |
| `scripts/route-size.mjs`               | gzip first-load JS per prerendered route from `.next/server/app/**/*.html` (ignores `noModule` polyfills). Fails if Home/Product > 150 KB                                                                         |
| `.env.example`                         | COMMERCE_PROVIDER, MOCK_LATENCY_MS, MOCK_ERROR_RATE, NEXT_PUBLIC_SITE_URL, Phase 2 Shopify vars                                                                                                                   |
| `.claude/agents/perf-a11y-reviewer.md` | strict reviewer subagent → PASS / FIX FIRST                                                                                                                                                                       |
| `.claude/skills/new-feature/SKILL.md`  | feature scaffold steps (types → data → adapter → logic → content → components → route → verify → review → **progress log**)                                                                                       |

### Design tokens (`app/globals.css`)

Tailwind v4 `@theme`: colours (`bg surface surface-2 line fg muted subtle accent accent-fg
accent-soft success warning danger focus fit-*`), fluid type `text-xs…5xl`, `spacing-section`,
`spacing-gutter`, radius `sm…xl`, `shadow-glow-sm/md/lg`, `text-glow` utility, durations
`fast/base/slow/scene`, easings `out/in-out/light`, z-index `header/sticky/drawer/toast`, sheet + fade
animations, `container-page` utility. Reduced motion collapses all durations. Fonts: Inter (sans) +
Space Grotesk (display) via `next/font`.

### Commerce layer (`lib/commerce/`)

| File               | What                                                                                                                                                                                                                                                                        |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `types.ts`         | Money, Image, Connection/PageInfo, Housing, Fitment, Vehicle, GarageVehicle, Product, Variant, Design, Cart, CartLine, CartLineInput, Order, OrderStage (`ORDER_STAGES`), Proof, Review, GalleryItem, Faq, BusinessPricing, Quote(Request), **`CommerceAdapter`** interface |
| `schemas.ts`       | zod schema per type + `fixtures` map (one per data file)                                                                                                                                                                                                                    |
| `attributes.ts`    | `ATTR` keys (`_vehicle _housing_code _fit_method _design_id _design_preview _gift _gift_message _gift_send_date`), `getAttr`, `setAttrs`, `vehicleLabel`, `attributesForVehicle`                                                                                            |
| `pagination.ts`    | `paginate()` → Shopify-style connection; `cursor:N` cursors                                                                                                                                                                                                                 |
| `errors.ts`        | `CommerceError` (NOT_FOUND / NOT_IMPLEMENTED / UPSTREAM / INVALID), `notImplemented()`                                                                                                                                                                                      |
| `mock/index.ts`    | `createMockAdapter({latencyMs, errorRate, random})`: every interface method; in-memory carts + proof state; deep copies; quote pricing from tiers                                                                                                                           |
| `shopify/index.ts` | `createShopifyAdapter()`: every method stubbed with the exact Storefront / Cart / Customer Account API op in a TODO                                                                                                                                                         |
| `index.ts`         | `getCommerce()` picks adapter by `COMMERCE_PROVIDER`; re-exports types + attribute helpers                                                                                                                                                                                  |
| `queries.ts`       | cached server reads (`'use cache'` + `cacheLife` + `cacheTag`): getProducts, getProduct, getVehicles, getHousings, getFitments, getDesigns, getFaqs                                                                                                                         |

Adapter methods: getProducts, getProduct, getDesigns, getDesign, getVehicles, getHousings,
getHousing, getFitments, createCart, getCart, addCartLines, updateCartLines, removeCartLines,
getOrders, getOrder, findOrder, getProof, respondToProof, getReviews, getGallery, getFaqs,
getBusinessPricing, requestQuote.

### Fixtures (`data/*.json`): all illustrative, `source: "sample"`

- `housings.json`: 13 housings (FD-DR-01, FD-MR-01, FD-DR-02, RM-MR-01, ST-DR-01, GM-MR-01, GM-MR-02, GM-DR-01, TS-DR-01, TY-DR-01, HN-DR-01, BM-DR-01, MB-DR-01), placeholder photos, sample OEM part numbers.
- `vehicles.json`: 16 vehicles (Tahoe and Yukon separate).
- `fitment.json`: 20 rows. Edge cases on purpose: **F-150 14th gen has 2 housings** (door vs mirror → visual picker); **Silverado 4th gen mid-generation change** (2019–21 GM-MR-01, 2022+ GM-MR-02); **Accord 11th gen has no factory lights** (universal path); trims with `some` factory lights.
- `products.json`: 15 = 13 vehicle products (one per housing; variants Lights 2|4 × Design Pre-made|Custom, 4-light = 1.7×) + universal wireless + design service.
- `designs.json` (14 original designs, no car-maker logos), `reviews.json` (6, sample), `gallery.json` (8, sample), `orders.json` (3 at stages proof_sent / engraving / delivered, email `demo@example.com`), `proofs.json` (3), `faqs.json` (7), `business-pricing.json` (4 tiers).
- Placeholder art: `public/placeholders/*.svg` (17 files, each labelled PLACEHOLDER).

### Client state (`lib/stores/`, `lib/hooks/`)

- `cart.ts`: `useCartStore` (persist `store.cart.v1`; lines merge on same merchandise + attributes; qty cap 20; `isOpen` not persisted), `cartCount`, `cartSubtotal` (integer cents).
- `garage.ts`: `useGarageStore` (persist `store.garage.v1`; add/update/remove/setActive; dedupe by year+make+model+trim), `selectActiveVehicle`.
- `ui.ts`: menu/search open state. `toast.ts`: toast queue + `toast()` helper.
- `lib/hooks`: `useHydrated`, `useMediaQuery`, `usePrefersReducedMotion` (server default: reduce).
- `lib/utils.ts`: `cn()` (tailwind-merge aware of our token scales), `formatMoney()`. `lib/cx.ts`: `cx()` = clsx only, **for first-load client code**.
- `lib/seo/metadata.ts`: `pageMetadata({title, description})`. `lib/announcement.ts`: pre-paint dismiss script.

### UI primitives (`components/ui/`)

Button (+ `button-variants.ts` cva only), Badge (neutral/accent/verified/likely/check/sample),
SampleBadge, PlaceholderMedia (next/image + visible "Placeholder" tag + aspect ratio), Sheet
(Radix Dialog; right/bottom), Dialog, Skeleton, EmptyState / ErrorState (`States.tsx`), Field + Input
(+ `inputClass`), Toaster (Radix Toast) + ToasterHost (lazy), LoadOnView + useOpenedOnce (`LazyMount.tsx`).

### Layout (`components/layout/`, `components/cart/`, `app/`)

- `app/layout.tsx`: fonts, viewport, skip link, AnnouncementBar, Header, `main#main`, Footer, StickyFitCta, ToasterHost.
- AnnouncementBar (server) + AnnouncementDismiss (client; hidden before paint via head script).
- Header (server) → Logo (placeholder wordmark), desktop nav, HeaderActions (client): search, **My Garage chip** (active vehicle), account, cart button + count (hydration-safe), menu button. Overlays (CartDrawer, MobileMenu, SearchDialog) are `next/dynamic` and mount on first open.
- MobileMenu: bottom sheet, nav + secondary links + "Find my fit". StickyFitCta: mobile-only, shows active vehicle; hidden on /fitment, /checkout, /cart, /studio.
- CartDrawer + `components/cart/CartLineItem`: design thumbnail (`_design_preview`), vehicle + housing, Edit design (`/studio?line=…`), qty ±, remove with Undo toast, subtotal, checkout → `/checkout`, view cart, empty state.
- SearchDialog: shell only (input + popular links). Real index in F10.
- Footer: 3 link columns, newsletter (rhf + zod) **loaded on view**, legal + trademark note.
- `app/page.tsx` placeholder hero (real homepage in 1B), `not-found.tsx`, `error.tsx` (slim, no Button), `global-error.tsx` (inline styles).

### Content (`content/`)

`site.ts` ({{BRAND}}, tagline, copyrightYear), `navigation.ts` (primary/secondary/footer), `layout.ts`
(announcement, header, mobileMenu, cartDrawer, footer, states), `search.ts`, `home.ts`.

### Tests

- Unit (49 passing): `tests/unit/utils.test.ts`, `commerce/fixtures.test.ts` (schema per file + referential integrity + launch vehicles + sample flags), `commerce/mock-adapter.test.ts` (pagination, filters, cart, proofs, quotes, latency/errors, shopify parity), `commerce/attributes.test.ts`, `stores/stores.test.ts`; component `tests/components/CartLineItem.test.tsx`.
- E2E: `e2e/smoke.spec.ts` (one h1, main, axe WCAG 2.2 AA per route), `e2e/shots.spec.ts` (390 + 1440 full-page per route, fails on console errors), `e2e/layout.spec.ts` (skip link, drawer focus trap + Esc returns focus, search, mobile menu, no horizontal scroll, open-state screenshots).

### Verification

- `pnpm lint`, `pnpm typecheck`, `pnpm test` (49/49), `pnpm build`: green.
- First-load JS, Home: **145.2 KB gz** (budget 150). Framework (React DOM + Next runtime) ≈ 129 KB of that.
- Screenshots: `.artifacts/screenshots/` (see session notes for review).
- Reviewer round 1: FIX FIRST. Tailwind `duration-*` reads `--transition-duration-*` (aliases added); input borders under 3:1 (new `line-strong` token, #5f6b7d); hard-coded strings moved to content/. Round 2: **PASS**.
- Also fixed: return focus on store-opened Sheet/Dialog (`components/ui/useReturnFocus.ts`), placeholder route shells (`content/placeholders.ts` + `components/sections/RoutePlaceholder.tsx`, 19 routes), safe-area padding, `preload` (Next 16) in place of `priority`, Logo `useId`, persisted-store sanitizers.
- Axe smoke: 3/3. Captures + keyboard: 11/11 (`PW_CHANNEL=chrome pnpm shots`). Unit: 51/51. Home 145.5 KB gz.

### Hosting

- `netlify.toml`: `pnpm build`, publish `.next`, Node 22, `COMMERCE_PROVIDER=mock`, cache header for /placeholders. Adapter auto-installed. Local Netlify build compiled fine (adapter v5.16.8) and then hit a Windows symlink EPERM; deploy from GitHub instead.

### Known gaps / TODO carried forward

- `e2e/layout.spec.ts` tolerates /products/* 404s (NOT_BUILT_YET). Remove that in 1B.
- Body bottom padding also applies on routes that hide the sticky CTA (cosmetic).
- Store sanitizers are hand-written guards (zod would add ~13 KB to first load).

- Cart store is client-only; Phase 1B wires it to the adapter cart via Server Actions.
- Search dialog is a shell (F10 in 1D). `/account`, `/fitment`, `/studio`, etc. links 404 until built.
- Brand, accent colour, fonts are placeholders pending founder answers (docs/decisions.md).
- Home budget headroom is ~5 KB: HeroDoor/GSAP/canvas must stay lazy.

---

## Entry template

```
## <Feature> (<date>)
**Status:** built | partial. Reviewer: PASS/FIX FIRST (date)
### Files: new / changed (path: purpose)
### Routes
### Data + adapter methods
### Stores / content
### Tests (unit, component, e2e)
### Verification (ci, route sizes, screenshots, reviewer)
### Known gaps / TODO
```

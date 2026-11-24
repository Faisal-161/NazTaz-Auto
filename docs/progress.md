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

## Phase 1B: Fitment logic, `lib/fitment` (2026-11-24)

**Status:** built (logic only, no UI). Reviewer: **PASS** (2026-11-24, after one FIX FIRST round with 5 blocking items, all fixed and covered by regression tests).

### Files (all new)

| File                         | What                                                                                                                                                                                                                                                                                                                             |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/fitment/types.ts`       | `FactoryAnswer`, `FitSelection` (slugs: factory, year, make, model, generation, trim, housing), `FitResolution` (incomplete / no_match / needs_generation / universal / ask_factory / pick_housing / resolved), `FitBadge`, `ProductFit`                                                                                         |
| `lib/fitment/slug.ts`        | `slugify` (strips accents), `sameSlug`                                                                                                                                                                                                                                                                                           |
| `lib/fitment/options.ts`     | `yearOptions`, `makeOptions`, `modelOptions`, `generationOptions`, `trimOptions`, `rowsFor`, `labelFor`                                                                                                                                                                                                                          |
| `lib/fitment/resolve.ts`     | **`resolveFitment(rows, selection)`**: the finder's brain. "No lights" → universal up front; year overlap → ask generation; mid-generation split by year, overlap year → picker; trims apply to yes AND some rows; uncertain row → ask factory question; URL housing only if a candidate. Also `weakestConfidence`, `housingsOf` |
| `lib/fitment/match.ts`       | `badgeFor`, `selectionForVehicle`, `resolveVehicle`, `candidateHousings`, **`productFit`** (built on resolveFitment so badges never disagree with the finder), `productsForVehicle`                                                                                                                                              |
| `lib/fitment/part-number.ts` | `normalizePartNumber`, `findByPartNumber` (exact from 2 chars, prefix from 4)                                                                                                                                                                                                                                                    |
| `lib/fitment/vin.ts`         | `validateVin` (check digit), `normalizeVin`, `mapVpicResponse`. The network call goes in the finder server action, not here                                                                                                                                                                                                      |
| `lib/fitment/url.ts`         | `parseFitParams` (strict, defensive), `toFitParams` (stable order), `updateSelection` (clears downstream steps)                                                                                                                                                                                                                  |
| `lib/fitment/index.ts`       | public exports                                                                                                                                                                                                                                                                                                                   |
| `content/fitment.ts`         | `fitBadges` copy (Verified fit / Likely fit / Check fit)                                                                                                                                                                                                                                                                         |

Docs: `docs/data-models.md` trims rule (empty = all trims; otherwise the row applies only to listed trims).

### Tests

116 total passing. `tests/unit/fitment/resolve.test.ts`, `match.test.ts`, `url-vin.test.ts`, `review-fixes.test.ts` (18 regression cases). Fixture checks: F-150 door/mirror picker, Silverado mid-generation split, Accord universal, Model Y instant, RAM trims.

### Verification

lint, typecheck, test 116/116, build green. Home unchanged (145.5 KB). No UI, so no screenshots.

### TODO for the finder UI (next item)

- `factory: "unsure"` loops back to `ask_factory`: the UI must offer the picker with Check fit, or photo review.
- A vehicle not in our table gives `unknown`: show no badge and offer part number / VIN / photo.
- **Save `generation` on garage vehicles** (a year in two generations otherwise gives `unknown`).
- Add a vPIC model alias map ("Silverado" vs "Silverado 1500").
- `updateSelection` clears make/model on a year change (deliberate).

---

## Phase 1B: Fit finder UI, `/fitment` (2026-11-24)

**Status:** built. Reviewer: **PASS** (2026-11-24, after 2 FIX FIRST rounds: 6 a11y/correctness
items, then a regex that rejected emails containing "s"; all fixed and covered by e2e tests).

### What the shopper sees

01 Factory lights? (Yes / No lights / Not sure) → 02 Year/Make/Model (+ Generation/Trim only when
needed; "not sure" help panel) → 03 Visual housing picker (housing + connector photos, tap to confirm,
"light on" glow) → 04 Confirmed plate (vehicle, housing code, fit badge, Saved to My Garage, Design
CTA) + products that fit + universal. Side panel: part number, **real VIN lookup (NHTSA vPIC)**,
photo review (mock). Selection lives in the URL. Fitment is labelled Sample.

### Files

| File                                    | What                                                                                                                                                                          |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/fitment/page.tsx`                  | Static shell (h1, intro, Sample badge) + `<Suspense>` FinderLoader (searchParams + cached fitments/housings/products)                                                         |
| `app/fitment/actions.ts`                | `lookupVin(input)` server action: length guard → `validateVin` → `decodeVin` → `matchVehicle`                                                                                 |
| `lib/services/vpic.ts`                  | `decodeVin` (NHTSA vPIC, 8s timeout, `'use cache'` days; network errors throw so they are never cached)                                                                       |
| `lib/fitment/vehicle-match.ts`          | `matchVehicle` (exact / punctuation-insensitive / unique prefix: "Silverado" → "Silverado 1500")                                                                              |
| `lib/money.ts`                          | `formatMoney` split out of `lib/utils` (no tailwind-merge in client bundles)                                                                                                  |
| `components/fitment/FitFinder.tsx`      | Orchestrator: step from `resolveFitment`, URL sync (replaceState), garage save, focus to the new step heading, part-number override (clears a mismatched vehicle), VIN, photo |
| `components/fitment/StepFrame.tsx`      | Numbered rail step (done/active/upcoming, Change button)                                                                                                                      |
| `components/fitment/FactoryStep.tsx`    | 3 choice buttons (aria-pressed)                                                                                                                                               |
| `components/fitment/VehicleStep.tsx`    | Native selects, generation/trim on demand, unsure panel, no-match panel. Exports `TRIM_OTHER`                                                                                 |
| `components/fitment/HousingStep.tsx`    | Housing + connector photo cards (buttons, aria-pressed, labelledby name, describedby specs), light-on glow                                                                    |
| `components/fitment/ResultStep.tsx`     | Confirmation plate + one product grid (housing products with badge, then universal)                                                                                           |
| `components/fitment/AltConfirm.tsx`     | Radix Tabs: part number search, VIN form (useTransition + server action), photo review (type/size/HEIC checks, preview, per-field errors)                                     |
| `components/fitment/FitBadge.tsx`       | Verified / Likely / Check fit badge with an sr-only description                                                                                                               |
| `components/fitment/FinderSkeleton.tsx` | Same footprint as step 1 + panel (no CLS)                                                                                                                                     |
| `components/product/ProductCard.tsx`    | Reusable product tile (whole card is one link, `headingLevel`, badge slot). **Reuse on shop/PDP**                                                                             |
| `content/fitment.ts`                    | All finder copy (+ badges)                                                                                                                                                    |

Also changed: `app/globals.css` (tokens `--font-mono`, `--color-light-pool`, `--animate-light-on`,
`html { scroll-padding-top: 6rem }`); `PlaceholderMedia` (`as` prop, cx, aspect via className); `Badge`, `Field`
use `cx`; `eslint.config.mjs` (lib/services may fetch); `playwright.config.ts` (never reuse a prod
server); placeholder SVGs (baked-in labels removed); `content/placeholders.ts` (fitment removed).

### Tests

- Unit: 120 (adds `tests/unit/fitment/vehicle-match.test.ts`).
- E2E `e2e/fitment.spec.ts` (8, at 390 + 1440):
  - F-150 picker → result → garage chip → reload restores, with axe WCAG 2.2 AA;
  - Accord universal;
  - keyboard only (arrows don't advance, focus follows step);
  - part number;
  - part number replacing a mismatched vehicle;
  - VIN check digit;
  - tab panel focus ring;
  - photo review with `sam.smith@example.com`.

### Verification

- lint, typecheck, test 120/120, build green.
- E2E (prod) smoke + fitment 13/13; shots 11/11.
- Home 145.5 KB gz; /fitment 173.2 KB gz (not budgeted).
- Screenshots: `.artifacts/screenshots/fitment-*`.

### Known gaps / TODO

- Product cards link to `/products/[handle]` (PDP not built: e2e tolerates /products 404s via `NOT_BUILT_YET`).
- "Design your lights" → `/studio?product=…` (studio is a placeholder).
- Photo review is mock (no upload; Phase 2 storage). **Rate-limit `lookupVin` before launch.**
- Part-number overrides aren't stored in the URL (reload loses them).
- Garage-wide filtering and badges on shop/home are the next roadmap item ("My Garage + site-wide filtering").
- AltConfirm could be lazy-loaded (~12 KB) if /fitment gets a budget.

---

## Visual identity: "Night street" (2026-11-24)

**Why:** the founder said the first pass looked like a typical AI build. Rules are in
[design-system.md](design-system.md).

- `app/globals.css`: new tokens (warm asphalt, `accent` signal amber, `projection` warm white,
  `light-pool`), tight radii, bigger fluid type, h1–h3 condensed uppercase.
- `app/layout.tsx`: fonts **Big Shoulders** (display) + **Archivo** (body, wdth axis).
- `components/ui/button-variants.ts`: rectangular actions, no glow; secondary = outline.
- `components/sections/NightScene.tsx` (new): drawn SVG night scene (asphalt grain, door edge + lens,
  beam, perspective projection, light-on). Reuse it as the poster for HeroDoor (F1).
- `app/page.tsx` + `content/home.ts`: new hero (scene above the headline on mobile; split layout on
  desktop) with a 4-line headline, intro, 2 CTAs and 3 numbered facts.
- `public/placeholders/*.svg`: product/gallery/design-service redrawn as night shots; all others
  recoloured to the warm palette.
- Square-cornered buttons in VehicleStep, StickyFitCta and the skip link; Logo glow is projection white.
- Verified: lint, typecheck, test 120/120, e2e 13/13, shots 11/11, axe clean. Home 145.6 KB gz.
  The reviewer subagent was not run (not a roadmap item); run it with the next feature.

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

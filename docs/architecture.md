# Architecture

## Stack

| Concern          | Choice                                                                            |
| ---------------- | --------------------------------------------------------------------------------- |
| Framework        | Next.js 16.4 App Router, React 19 Server Components, Turbopack                    |
| Rendering        | `cacheComponents` + `partialPrefetching` (static shell + streamed dynamic holes)  |
| Language         | TypeScript strict                                                                 |
| Styling          | Tailwind v4, design tokens as CSS variables in `app/globals.css` (`@theme`)       |
| Primitives       | Radix UI (`radix-ui` package), lucide-react icons, CVA variants                   |
| Motion           | CSS transitions by default; GSAP + ScrollTrigger lazy-loaded for hero/scroll only |
| Projection       | Canvas 2D, pure engine in `lib/projection`                                        |
| Client state     | Zustand + `persist` (localStorage): cart, garage, customizer                      |
| Forms            | react-hook-form + zod                                                             |
| Tests            | Vitest + Testing Library (jsdom); Playwright e2e + axe                            |
| Tooling          | pnpm, ESLint (flat config, next core-web-vitals), Prettier + tailwind plugin      |
| Hosting (later)  | Vercel                                                                            |
| Commerce (later) | Shopify Storefront API, Cart API, hosted checkout, Customer Account API           |

## Folder layout

```
app/                    routes (server components by default)
components/
  ui/                   primitives: Button, Badge, Sheet, Dialog, Skeleton, Toast, ...
  layout/               Header, Footer, MobileMenu, AnnouncementBar, CartDrawer shell
  sections/             homepage + marketing sections
  fitment/ customizer/ product/ cart/ account/ gallery/
lib/
  commerce/             THE data boundary (types, index, mock/, shopify/)
  projection/           pure projection engine (Phase 1B)
  fitment/              pure fitment logic (Phase 1B)
  pricing/              pure price calculation
  stores/               Zustand stores (cart, garage, customizer)
  hooks/                client hooks (reduced motion, hydration, media query)
  seo/                  metadata helpers (titles only until Phase 3)
  utils.ts              cn(), formatMoney()
data/                   mock JSON fixtures (validated by zod in tests)
content/                ALL user-facing copy, nav, FAQs, announcement
public/                 static assets (placeholders clearly marked)
tests/                  vitest unit + component tests
e2e/                    playwright specs + screenshot script
docs/                   this folder
.claude/                agents/, skills/
```

## Commerce adapter

```
lib/commerce/
  types.ts        domain types + CommerceAdapter interface
  schemas.ts      zod schemas for fixtures (mock validates on load in dev/tests)
  attributes.ts   cart line attribute keys (_vehicle, _housing_code, ...)
  index.ts        getCommerce(): picks adapter by COMMERCE_PROVIDER (mock|shopify)
  mock/           reads /data/*.json; async; optional latency (MOCK_LATENCY_MS), error
                  injection (MOCK_ERROR_RATE), cursor pagination identical to Shopify connections
  shopify/        same interface; every method throws NotImplemented with a TODO naming the
                  Storefront/Cart/Customer Account API operation it will call
```

Rules:

- Components and pages call `getCommerce()` (server) or Server Actions (mutations). Never `fetch`.
- The cart has two halves: **client store** (`lib/stores/cart.ts`) for instant UI, and the
  **adapter cart** (`createCart`, `addCartLines`, ...) which the mock implements in memory and Shopify
  will implement via Cart API. Phase 1B wires the store to call the adapter via Server Actions so
  that switching to Shopify does not change components.
- Pagination: `Connection<T> = { nodes: T[]; pageInfo: { hasNextPage; endCursor } }`, same as Shopify.
- Money: `{ amount: string; currencyCode: 'USD' }`, same as Shopify `MoneyV2`.
- IDs: opaque strings. Mock uses `gid://mock/Product/...` so code never parses IDs.

## Caching with cacheComponents

- Catalog reads (products, vehicles, housings, designs) are wrapped in `'use cache'` +
  `cacheLife('hours')` + `cacheTag('products')` in server data functions, so pages prerender a
  static shell. Phase 2 webhooks call `revalidateTag('products', 'max')`.
- Per-user data (cart, account, orders) is read in client stores now and will become
  `<Suspense>`-wrapped request-time reads in Phase 2.
- Garage-filtered UI (BestSellers etc.) is server-rendered generically, then filtered on the client
  from the garage store, so the static shell stays cacheable.

## Environment

See `.env.example`. `COMMERCE_PROVIDER` (default `mock`), `MOCK_LATENCY_MS`, `MOCK_ERROR_RATE`,
`NEXT_PUBLIC_SITE_URL`, and Phase 2 Shopify vars (documented but unused).

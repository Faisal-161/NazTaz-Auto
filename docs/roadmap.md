# Roadmap

Tick a box only after `pnpm ci` is green and `perf-a11y-reviewer` returns PASS.

## Phase 1A: Foundation
- [x] Scaffold (Next 16.4, TS strict, Tailwind v4, pnpm, ESLint, Prettier)
- [x] CI workflow (lint, typecheck, test, build)
- [x] Design tokens (colour, type, spacing, radius, glow, motion) + fonts
- [x] UI primitives (Button, Badge, Sheet, Dialog, Skeleton, Empty/Error state, Toast, Input, ...)
- [x] Commerce types + zod schemas + attribute keys
- [x] Mock adapter (latency, errors, pagination) + fixtures
- [x] Shopify adapter stubs (same interface, TODOs)
- [ ] Layout: announcement bar, header (nav, search trigger, garage chip, account, cart count),
      mobile bottom-sheet menu + sticky "Find my fit", cart drawer, footer + newsletter
- [x] 404 / 500 shells
- [x] `.claude/agents/perf-a11y-reviewer.md` + `.claude/skills/new-feature/SKILL.md`
- [x] Screenshot script (390 / 1440)

## Phase 1B: Core
- [ ] Fitment logic (`lib/fitment`) + tests
- [ ] Fitment finder UI + visual housing picker + part number + VIN (NHTSA vPIC) + photo upload
- [ ] My Garage + site-wide filtering + fit badges
- [ ] Projection engine (`lib/projection`) + tests
- [ ] Design studio (`/studio`)
- [ ] Product page (F4)
- [ ] Shop + shop-by-vehicle
- [ ] Cart (store ↔ adapter via Server Actions) + cart page + mock checkout
- [ ] Homepage sections + HeroDoor (GSAP vs image-sequence prototype; keep faster)

## Phase 1C: Account (mock)
- [ ] Mock login + account dashboard
- [ ] Orders + stage timeline (F6) + tracking page
- [ ] Proof approval (F5)
- [ ] "Did it fit?" prompt

## Phase 1D: More
- [ ] Gift mode (F7)
- [ ] Business landing + quote flow (F8)
- [ ] Gallery + reviews with filters (F9)
- [ ] Design library
- [ ] Install guides (template + 2 samples)
- [ ] Header search (F10)
- [ ] Help (shipping, returns, warranty, track), contact, about, blog placeholder
- [ ] 404 / 500 polish

## Phase 1E: Quality
- [ ] E2E: find fit → design → cart → checkout
- [ ] E2E: proof approval
- [ ] Reviewer pass on every route
- [ ] Lighthouse mobile ≥ 90 on Home + Product
- [ ] Reduced motion, keyboard, screen-reader pass
- [ ] iOS Safari + Android Chrome check

## Phase 2: Shopify
- [ ] Storefront token + env
- [ ] Products + metafields; metaobject definitions (housing, vehicle_fitment, design)
- [ ] Metaobject import script from `data/*.json`
- [ ] Real adapter (validate queries with Shopify Dev MCP)
- [ ] Cart API + `checkoutUrl` redirect
- [ ] Customer Account API
- [ ] Upload storage (designs, photos)
- [ ] Small app / serverless for proofs, stages, quotes
- [ ] Deploy to Vercel; switch `COMMERCE_PROVIDER=shopify`

## Phase 3: SEO + growth (later)
- [ ] Metadata, structured data, sitemap, robots
- [ ] Vehicle landing pages, install guides as content, blog
- [ ] Merchant Center feed

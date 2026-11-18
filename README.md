# {{BRAND}} storefront

DTC storefront for custom LED puddle lights. Next.js 16 (App Router, Cache Components), TypeScript
strict, Tailwind v4, Radix UI, Zustand. Runs fully on mock data today. Shopify (Storefront + Cart +
Customer Account APIs) plugs in later through `lib/commerce`.

## Quick start

```bash
pnpm install
cp .env.example .env.local   # COMMERCE_PROVIDER=mock
pnpm dev                     # http://localhost:3000
```

## Scripts

| Command                            | What                                                                         |
| ---------------------------------- | ---------------------------------------------------------------------------- |
| `pnpm dev` / `build` / `start`     | Next.js dev / production build / serve                                       |
| `pnpm lint` · `typecheck` · `test` | ESLint · tsc · Vitest                                                        |
| `pnpm e2e`                         | Playwright (smoke + axe)                                                     |
| `pnpm shots`                       | 390 px + 1440 px screenshots → `.artifacts/screenshots` (needs `pnpm build`) |
| `pnpm analyze:size`                | First-load JS per route (gzip) vs budgets                                    |
| `pnpm ci`                          | lint + typecheck + test + build                                              |

Set `PW_CHANNEL=chrome` (or `msedge`) to run Playwright with an installed browser.

## Docs

Start with [CLAUDE.md](CLAUDE.md), then [docs/progress.md](docs/progress.md) (what's built) and
[docs/roadmap.md](docs/roadmap.md).

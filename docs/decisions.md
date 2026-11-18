# Decisions log

Newest first. Format: date, decision, why.

## 2026-11-18: Phase 1A foundation choices
- **Next.js 16.4 with `cacheComponents` + `partialPrefetching`** (create-next-app defaults). This gives a
  static shell plus streaming, which matches the LCP goal. The cost is explicit `'use cache'` on data reads.
- **TypeScript 5.9** (not 7.x): create-next-app pins `^5`; TS 7 tooling compatibility with Next and
  ESLint is unverified. Revisit later.
- **Tailwind v4** CSS-first config: tokens in `app/globals.css` `@theme`. No `tailwind.config`.
- **`radix-ui` unified package** instead of per-primitive packages. It is tree-shaken per import.
- **Fonts**: Space Grotesk (display) + Inter (sans), self-hosted via `next/font/google`. Placeholder
  until the brand is chosen.
- **Accent colour**: cool cyan-white `#7DE3FF`-ish glow. Placeholder until the brand is chosen.
- **Toasts** use Radix Toast (no extra dependency).
- **Mock IDs** use `gid://mock/<Type>/<id>`, so code treats IDs as opaque like Shopify GIDs.
- **Fixture fitment data is illustrative**, not verified part data. It is marked `source: "sample"`.
- **Playwright MCP / Context7 MCP were not connected** in the first session. Screenshots come from
  `pnpm shots` (Playwright library), and APIs were checked against the bundled Next docs and installed
  type definitions.

## Open questions (waiting on founder)
See the bottom of the first session summary. Answers are recorded here as they arrive.

## 2026-11-18: Phase 1A performance findings
- Next 16 `next build` no longer prints first-load JS sizes, so `scripts/route-size.mjs` measures gzip
  from prerendered HTML (excluding `noModule` polyfills).
- Framework baseline is ~129 KB gz (React DOM ~72 + Next runtime ~45 + misc). Home sits at 145 KB.
  So: overlays (cart drawer, menu, search), the toaster and the newsletter form load on demand;
  first-load client leaves avoid tailwind-merge (`cx()`) and Radix Slot; `app/error.tsx` (shipped
  on every page) stays tiny. HeroDoor/GSAP/canvas MUST be lazy in 1B.
- Error boundary props in Next 16.4 are `{ error: unknown, retry }` (`retry` re-fetches).
- A second Claude session (naztaz-auto-63) wrote the initial Playwright/Vitest/metadata files and
  removed `vite-tsconfig-paths` in favour of Vitest `resolve.tsconfigPaths`. Kept.

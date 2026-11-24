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

## 2026-11-18: Hosting on Netlify (for now)

- Frontend is hosted on **Netlify** while we run on mock data; Shopify backend comes later. Netlify’s
  OpenNext adapter (`@netlify/plugin-nextjs`, auto-installed, currently v5.16.x) lists App Router,
  RSC, ISR/tags, image CDN and **Cache Components** as fully supported. `partialPrefetching` isn’t
  listed: verify on the first deploy.
- Deploy = Netlify builds from the GitHub repo (Linux). A local `netlify build` on Windows fails with
  EPERM on symlinks (needs Developer Mode); that is a local OS limit, not a project issue.
- Removed `images.dangerouslyAllowSVG`: Next serves `.svg` sources unoptimized automatically, so
  SVGs never go through Netlify Image CDN.
- Vercel remains an option later; nothing in the code is host-specific.

## 2026-11-24: Fit finder UI decisions

- **One-tap choices are buttons (aria-pressed), not radios.** Picking an answer advances the step;
  radios would make arrow keys select AND advance (WCAG 3.2.2). Tab moves, Enter/Space picks.
- **Native selects** for Year/Make/Model/Generation/Trim: OS pickers on phones, full keyboard
  support, no extra JS.
- **Design direction** (from the AnimatedWebs style references for Linear and Polestar, as guidance
  only, nothing copied): a numbered 01→04 rail, monospace for codes and part numbers ("spec sheet"),
  the glow colour kept for actions and the "light on" moment, and no gradient blobs or template
  layouts. AnimatedWebs is on the free plan, so no component source was used.
- **VIN** goes to the real NHTSA vPIC API from a server action (`app/fitment/actions.ts` →
  `lib/services/vpic.ts`). It is validated locally first (check digit) and cached for days; network
  failures throw so they are never cached. **TODO before launch:** rate-limit the action and bound
  the cache.
- **Part number vs selected vehicle:** if the part number's housing is not one of the vehicle's
  candidates, the vehicle is cleared and the shopper sees why. A fit is never saved under the
  wrong car.
- **Opening a shared result URL saves that vehicle to My Garage** (the result says so). Kept for
  now; revisit if it surprises people.
- **Photo review upload has no rights checkbox:** it is a photo of the car, not artwork. The brief
  requires the checkbox for artwork uploads (studio, gifts, business).
- **Fitment data is labelled Sample** on /fitment until vehicles are verified.
- **Bundle:** first-load client code uses `cx` (clsx) and `lib/money`, not `cn`/`lib/utils`
  (tailwind-merge ≈ 10 KB). /fitment is 173 KB gz (not budgeted). Lazy-loading AltConfirm is
  deferred because it sits above the fold on desktop.
- **Tailwind gotcha:** a colour token `--color-X` generates `text-X`/`bg-X` utilities, so
  `--color-glow` silently overrode our `text-glow` effect. The token was renamed to
  `--color-light-pool`.
- **Playwright** never reuses an existing _production_ server (it could be serving an old build).

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

---
name: new-feature
description: Scaffold a new storefront feature the project's way (types → mock data → adapter method → pure logic + tests → content entry → components → route → screenshots → reviewer). Use when starting any roadmap item or adding a feature/section/route.
---

# New feature scaffold

Arguments: feature name (kebab-case) and a one-line goal. Example: `fitment-finder "Year/Make/Model → housing picker"`.

Work through these steps in order and tick each one off in your reply. Skip a step only if it truly
doesn't apply, and say why.

## 0. Plan

- Find the item in `docs/roadmap.md` and the spec in `docs/features.md` / `docs/routes.md`.
- Big feature (>3 components or new data model)? Enter plan mode first.

## 1. Types (`lib/commerce/types.ts`)

- Add or extend domain types. Match Shopify field names (see `docs/data-models.md`).
- Add a zod schema in `lib/commerce/schemas.ts`.
- If data is needed: add the method signature to `CommerceAdapter`.

## 2. Mock data (`data/<name>.json`)

- Realistic but clearly sample: `"sample": true` where it will be shown as social proof.
- No car-maker logos, no competitor content. Fitment data `source: "sample"` unless verified.
- Add or extend `tests/unit/fixtures.test.ts` so the schema validates the file.

## 3. Adapter

- `lib/commerce/mock/index.ts`: implement via `load()` + `withLatency()`, with pagination if it is a list.
- `lib/commerce/shopify/index.ts`: add a stub that throws `notImplemented('<Storefront op>')` plus a TODO
  naming the exact query/mutation.
- Server read helper in `lib/commerce/queries.ts` wrapped in `'use cache'` + `cacheLife` + `cacheTag`
  for catalog data.

## 4. Pure logic (if any)

- In `lib/<domain>/` with no React/DOM imports. Tests in `tests/unit/<domain>/*.test.ts`, covering
  edge cases first.

## 5. Content (`content/<feature>.ts`)

- All headings, labels, help text, errors, empty/error states. Export a typed `as const` object.

## 6. Components (`components/<area>/`)

- Server component by default; split out a `*.client.tsx` leaf only for interactivity.
- Use `components/ui` primitives and tokens; `cn()`; CVA for variants.
- Include skeleton, empty and error states.
- Reduced motion: token durations / `motion-safe:` / `usePrefersReducedMotion()`.
- Heavy client code → `next/dynamic` or on-view loading.
- Component test in `tests/components/<Name>.test.tsx` (render, keyboard, a11y roles).

## 7. Route (if any)

- `app/<route>/page.tsx` with `export const metadata` / `generateMetadata` via `lib/seo/metadata.ts`.
- Exactly one `<h1>`. `await props.params`. Data reads cached or inside `<Suspense>`.
- `loading.tsx` / `error.tsx` where data can be slow or fail.

## 8. Verify

- `pnpm ci` green.
- Screenshots: Playwright MCP if available, else `pnpm shots -- <route>` → review 390px + 1440px.
- Check console errors and keyboard tab order.
- Add an e2e spec in `e2e/` for the main user flow.

## 9. Review + docs

- Run the `perf-a11y-reviewer` subagent with the feature's routes and files. Fix until PASS.
- Tick `docs/roadmap.md`; note any decision in `docs/decisions.md`.
- **Append a full listing to `docs/progress.md`** using its entry template: files created/changed,
  routes, content files, fixtures, adapter methods, stores, tests, verification (ci, screenshots,
  reviewer verdict), known gaps/TODOs. Future sessions rely on this to avoid redoing work.

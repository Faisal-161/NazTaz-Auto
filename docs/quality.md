# Quality gates

## Performance budgets (mobile, 4G)

| Metric                        | Budget        |
| ----------------------------- | ------------- |
| LCP                           | < 2.5s        |
| CLS                           | < 0.1         |
| INP                           | < 200ms       |
| First-load JS (Home, Product) | < 150 KB gzip |
| Lighthouse mobile performance | ≥ 90          |

How to check:

- `pnpm build` route output, then `pnpm analyze:size` (gzip of first-load chunks per route).
- Lighthouse mobile run against `pnpm start` (Phase 1E automates this).
- Keep GSAP, canvas engine, video, Radix Dialog contents and search index out of first-load JS.

## Accessibility (WCAG 2.2 AA)

- Every interactive control is keyboard reachable and operable, in a logical order, with visible focus.
- Dialogs/drawers: focus trapped, Esc closes, focus returns to trigger (Radix handles this).
- Inputs have labels; errors linked via `aria-describedby`; status via live regions/toasts.
- Contrast per design-system.md. Target size ≥ 24×24 CSS px (2.5.8).
- Dragging (sliders, image placement) always has a keyboard/button alternative (2.5.7).
- One `h1` per page; landmarks; skip link; `lang="en"`.
- Automated: `@axe-core/playwright` in e2e. Manual: keyboard pass and VoiceOver/TalkBack in Phase 1E.

## Reduced motion

Every animation has a `prefers-reduced-motion` fallback. Tests run Playwright with
`reducedMotion: 'reduce'` as one project.

## Review gate (before ticking any roadmap box)

1. `pnpm ci` green (lint, typecheck, test, build).
2. Screenshots at 390px and 1440px reviewed; console clean; keyboard tab order checked.
3. `perf-a11y-reviewer` subagent verdict = **PASS**. FIX FIRST → fix and re-run.

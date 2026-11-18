# Design system

## Direction

- Dark "night" theme. The projected light is the hero; UI recedes.
- **One glow accent colour** (`--accent`, cool cyan-white). Everything else is neutral night tones.
- Two font families via `next/font`: **display** (Space Grotesk) for headings, **readable sans**
  (Inter) for body and UI.
- Motion with meaning only: light turns on, door opens, design appears. No decorative bouncing.
- Placeholder media is clearly marked ("Placeholder" label); never competitor images.

## Tokens (`app/globals.css`)

All tokens are CSS variables exposed to Tailwind via `@theme`. Components use Tailwind classes
(`bg-surface`, `text-muted`, `shadow-glow`) and never raw hex.

| Group      | Tokens                                                                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Colour     | `bg`, `surface`, `surface-2`, `border`, `fg`, `muted`, `subtle`, `accent`, `accent-fg`, `accent-soft`, `success`, `warning`, `danger`, `focus`  |
| Fit badges | `fit-verified` (success), `fit-likely` (accent), `fit-check` (warning)                                                                          |
| Type scale | `text-xs` … `text-5xl` fluid with `clamp()`; display font for `h1–h3`                                                                           |
| Spacing    | Tailwind default 4px scale plus `--space-section` (fluid section padding)                                                                       |
| Radius     | `--radius-sm` 6px, `--radius-md` 10px, `--radius-lg` 16px, `--radius-xl` 24px, `full`                                                           |
| Glow       | `--glow-sm`, `--glow-md`, `--glow-lg` (box-shadow), `--glow-text` (text-shadow)                                                                 |
| Motion     | `--dur-fast` 120ms, `--dur-base` 200ms, `--dur-slow` 400ms, `--dur-scene` 900ms; `--ease-out`, `--ease-in-out`, `--ease-light` (light-on curve) |
| Layers     | `--z-header`, `--z-drawer`, `--z-toast`                                                                                                         |

## Contrast

- `fg` on `bg` ≥ 15:1; `muted` on `bg` ≥ 7:1; `subtle` on `bg` ≥ 4.5:1 (body text never below `subtle`).
- `accent-fg` on `accent` ≥ 4.5:1 for buttons.

## Reduced motion

`@media (prefers-reduced-motion: reduce)` sets all `--dur-*` to `0.01ms`, so CSS transitions using
tokens collapse automatically. JS animations check `usePrefersReducedMotion()` and jump to the end state.

## Primitives (`components/ui`)

Button (primary/secondary/ghost/link × sm/md/lg/icon), IconButton, Badge (fit variants + sample),
Sheet (Radix Dialog: side/bottom), Dialog, Skeleton, EmptyState, ErrorState, Toast/Toaster,
VisuallyHidden, Container, SampleBadge, PlaceholderMedia, Input, Label, Field.

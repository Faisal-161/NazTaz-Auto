# Design system

## Direction: "Night street" (since 2026-11-24)

Replaced the first pass (cyan glow, Space Grotesk/Inter, rounded cards), which read as a generic
"AI dark theme". The rules:

- **Warm asphalt blacks** (`bg #0c0b0a`, `surface`, `surface-2`), not blue-black.
- **Signal amber** (`accent #ffb23f`, turn signal / sodium street light) is ONLY for actions,
  eyebrows and the active step. **Projected light is warm white** (`projection #fff6e6`,
  `light-pool`), the product's actual effect, used for "light on" moments and the "likely" badge.
- **Type:** headings are **Big Shoulders** (condensed signage, weight 800, UPPERCASE via base
  styles, line-height 0.95); body is **Archivo** (has a width axis for condensed labels); system
  mono for codes and part numbers. All free via `next/font/google`, self-hosted.
- **Shapes:** tight radii (3/5/8/12px). Action buttons are rectangles (`rounded-md`), never pills.
  Pills only for chips/badges. Prefer hairline dividers (`border-line`) over nested cards.
- **No decorative glow:** glows only where light is projected (scene, light pool, `text-glow` on one
  headline line). No glowing buttons.
- **Imagery:** our own drawn night scenes (`components/sections/NightScene.tsx`, placeholder SVGs)
  until real photography exists. No stock car photos (they show car-maker badges).
- Motion with meaning only: light turns on, door opens, design appears. No decorative bouncing.
- Placeholder media is clearly marked ("Placeholder" label); never competitor images.
- Libraries for later signature moments (free): React Bits, Magic UI, Motion Primitives. Use them
  only for 2–3 moments, lazy-loaded (Home has about 4 KB of budget headroom).

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

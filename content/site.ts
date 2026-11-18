/** Single source of truth for brand identity. Brand + domain are undecided: change them here only. */
export const site = {
  name: '{{BRAND}}',
  tagline: 'Custom LED puddle lights for your doors and mirrors',
  description:
    'Custom LED puddle lights that project your logo, name or design on the ground when your door opens.',
  locale: 'en-US',
  currency: 'USD',
  /** Static on purpose: `new Date()` is not allowed in a prerender under cacheComponents. */
  copyrightYear: 2026,
} as const

export type Site = typeof site

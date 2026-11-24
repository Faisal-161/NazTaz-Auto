/**
 * Temporary route shells so navigation never 404s while features are built. Each entry is
 * replaced by the real page in the listed phase (see docs/roadmap.md).
 */
export type RouteKey = keyof typeof placeholders

export const placeholderCopy = {
  badge: 'In progress',
  body: (phase: string) => `This page is being built in Phase ${phase}.`,
  primary: 'Find my fit',
  secondary: 'Back to home',
} as const

export const placeholders = {
  shop: { title: 'Shop puddle lights', phase: '1B' },
  studio: { title: 'Design studio', phase: '1B' },
  cart: { title: 'Your cart', phase: '1B' },
  checkout: { title: 'Checkout', phase: '1B' },
  account: { title: 'Your account', phase: '1C' },
  designs: { title: 'Pre-made designs', phase: '1D' },
  gifts: { title: 'Puddle lights as a gift', phase: '1D' },
  business: { title: 'Puddle lights for business', phase: '1D' },
  gallery: { title: 'Night gallery', phase: '1D' },
  install: { title: 'Install guides', phase: '1D' },
  help: { title: 'Help center', phase: '1D' },
  'help-shipping': { title: 'Shipping', phase: '1D' },
  'help-returns': { title: 'Returns', phase: '1D' },
  'help-warranty': { title: 'Warranty', phase: '1D' },
  'help-track': { title: 'Track your order', phase: '1C' },
  contact: { title: 'Contact us', phase: '1D' },
  about: { title: 'About us', phase: '1D' },
  blog: { title: 'Blog', phase: '1D' },
} as const

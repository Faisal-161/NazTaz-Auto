/** Copy for global chrome: announcement, header, mobile menu, cart drawer, footer, states. */
export const announcement = {
  id: 'launch-2026-11',
  message: 'See your design glowing before you buy. Proof approval on every custom order.',
  link: { label: 'Try the studio', href: '/studio' },
  dismissLabel: 'Dismiss announcement',
} as const

export const header = {
  skipLink: 'Skip to content',
  homeLabel: 'Home',
  navLabel: 'Main',
  searchLabel: 'Search',
  searchPlaceholder: 'Search lights, vehicles, designs',
  accountLabel: 'Account',
  cartLabel: (count: number) => (count === 1 ? 'Cart, 1 item' : `Cart, ${count} items`),
  menuLabel: 'Open menu',
  garage: {
    empty: 'Add vehicle',
    emptyHint: 'Find lights that fit',
    activePrefix: 'My Garage',
  },
} as const

export const mobileMenu = {
  title: 'Menu',
  close: 'Close menu',
  findFit: 'Find my fit',
  findFitHint: 'Year, make, model: done in one tap',
} as const

export const cartDrawer = {
  title: 'Your cart',
  close: 'Close cart',
  empty: {
    title: 'Your cart is empty',
    body: 'Start with your vehicle and we will show the lights that plug right in.',
    cta: 'Find my fit',
    secondary: 'Browse all lights',
  },
  vehicle: 'Vehicle',
  housing: 'Housing',
  design: 'Design',
  editDesign: 'Edit design',
  quantity: 'Quantity',
  decrease: (title: string) => `Decrease quantity of ${title}`,
  increase: (title: string) => `Increase quantity of ${title}`,
  remove: (title: string) => `Remove ${title}`,
  removed: (title: string) => `${title} removed from cart`,
  subtotal: 'Subtotal',
  shippingNote: 'Shipping and taxes calculated at checkout.',
  leadNote: 'Custom lights ship after you approve your proof.',
  checkout: 'Checkout',
  viewCart: 'View cart',
} as const

export const footer = {
  newsletter: {
    title: 'Get launch offers and new designs',
    body: 'One or two emails a month. Unsubscribe anytime.',
    label: 'Email address',
    placeholder: 'you@example.com',
    submit: 'Subscribe',
    success: 'Thanks! You are on the list.',
    errors: { required: 'Enter your email address.', invalid: 'Enter a valid email address.' },
  },
  legal: (year: number, brand: string) => `© ${year} ${brand}. All rights reserved.`,
  trademarkNote:
    'Vehicle names are used only to describe fitment. We do not engrave vehicle-maker logos.',
} as const

export const states = {
  sample: 'Sample',
  sampleHint: 'Sample content for preview only. Not a real customer.',
  placeholder: 'Placeholder',
  dismissToast: 'Dismiss notification',
  retry: 'Try again',
  genericError: {
    title: 'Something went wrong',
    body: 'Please try again. If it keeps happening, contact us and we will sort it out.',
  },
  notFound: {
    title: 'This page took a wrong turn',
    body: 'The page you are looking for does not exist or has moved.',
    home: 'Go home',
    findFit: 'Find my fit',
  },
} as const

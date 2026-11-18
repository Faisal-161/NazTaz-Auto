/** Header, mobile menu and footer navigation. Routes must exist in docs/routes.md. */
export type NavLink = { label: string; href: string; description?: string }

export const primaryNav: NavLink[] = [
  { label: 'Shop', href: '/shop', description: 'Lights for your vehicle and universal lights' },
  {
    label: 'Design studio',
    href: '/studio',
    description: 'Preview your design glowing on the ground',
  },
  { label: 'Designs', href: '/designs', description: 'Ready-made designs to start from' },
  { label: 'Gifts', href: '/gifts', description: 'Buy now, they design later' },
  { label: 'Business', href: '/business', description: 'Logos for teams, dealers and fleets' },
  { label: 'Gallery', href: '/gallery', description: 'Night photos from installs' },
]

export const secondaryNav: NavLink[] = [
  { label: 'Install guides', href: '/install' },
  { label: 'Track an order', href: '/help/track' },
  { label: 'Help', href: '/help' },
  { label: 'Contact', href: '/contact' },
]

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: 'Shop',
    links: [
      { label: 'Find my fit', href: '/fitment' },
      { label: 'All lights', href: '/shop' },
      { label: 'Design studio', href: '/studio' },
      { label: 'Designs', href: '/designs' },
      { label: 'Gifts', href: '/gifts' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Install guides', href: '/install' },
      { label: 'Shipping', href: '/help/shipping' },
      { label: 'Returns', href: '/help/returns' },
      { label: 'Warranty', href: '/help/warranty' },
      { label: 'Track an order', href: '/help/track' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Business', href: '/business' },
      { label: 'Gallery', href: '/gallery' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: '/contact' },
    ],
  },
]

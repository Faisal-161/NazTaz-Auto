/** Routes covered by smoke tests and screenshots. Add each route as it is built. */
export const routes = [
  { name: 'home', path: '/' },
  { name: 'not-found', path: '/this-page-does-not-exist' },
  // Placeholder shell (one is enough to cover the template); swap for real routes as they land.
  { name: 'shop-placeholder', path: '/shop' },
] as const

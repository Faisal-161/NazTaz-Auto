import { createMockAdapter } from './mock'
import { createShopifyAdapter } from './shopify'
import type { CommerceAdapter } from './types'

export type * from './types'
export { ATTR, getAttr, setAttrs, vehicleLabel, attributesForVehicle } from './attributes'
export { CommerceError } from './errors'

let adapter: CommerceAdapter | undefined

/** The single entry point for commerce data. Provider chosen by COMMERCE_PROVIDER (mock|shopify). */
export function getCommerce(): CommerceAdapter {
  if (adapter) return adapter
  const provider = process.env.COMMERCE_PROVIDER ?? 'mock'
  if (provider === 'shopify') adapter = createShopifyAdapter()
  else if (provider === 'mock') adapter = createMockAdapter()
  else throw new Error(`Unknown COMMERCE_PROVIDER "${provider}" (expected mock|shopify)`)
  return adapter
}

import { cacheLife, cacheTag } from 'next/cache'
import { getCommerce } from '.'
import type { DesignCategory, ProductQuery } from './types'

/**
 * Cached server reads for catalog data. Pages/components call these (not the adapter) so the
 * static shell prerenders. Phase 2 webhooks call revalidateTag('<tag>', 'max').
 * Per-user data (cart, orders, proofs) is NOT cached here.
 */
export async function getProducts(query?: ProductQuery) {
  'use cache'
  cacheLife('hours')
  cacheTag('products')
  return getCommerce().getProducts(query)
}

export async function getProduct(handle: string) {
  'use cache'
  cacheLife('hours')
  cacheTag('products', `product:${handle}`)
  return getCommerce().getProduct(handle)
}

export async function getVehicles() {
  'use cache'
  cacheLife('days')
  cacheTag('fitment')
  return getCommerce().getVehicles()
}

export async function getHousings() {
  'use cache'
  cacheLife('days')
  cacheTag('fitment')
  return getCommerce().getHousings()
}

export async function getFitments(filter?: { make?: string; model?: string }) {
  'use cache'
  cacheLife('days')
  cacheTag('fitment')
  return getCommerce().getFitments(filter)
}

export async function getDesigns(category?: DesignCategory) {
  'use cache'
  cacheLife('hours')
  cacheTag('designs')
  return getCommerce().getDesigns({ first: 100, category })
}

export async function getFaqs(topic?: string) {
  'use cache'
  cacheLife('days')
  cacheTag('faqs')
  return getCommerce().getFaqs(topic)
}

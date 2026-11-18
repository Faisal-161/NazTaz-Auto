import { notImplemented } from '../errors'
import type { CommerceAdapter } from '../types'

/**
 * Shopify adapter (Phase 2). Same interface as the mock; each stub names the API operation it
 * will call. Validate every query with the Shopify Dev MCP before implementing.
 *
 * Env: SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_API_VERSION, SHOPIFY_STOREFRONT_PRIVATE_TOKEN,
 * SHOPIFY_CUSTOMER_ACCOUNT_* (see .env.example).
 *
 * Mapping notes:
 * - Housing / Fitment / Design → metaobjects `housing`, `vehicle_fitment`, `design` (same field names).
 * - Product metafields: custom.housing_code, custom.lens, custom.location, custom.lead_time_days,
 *   custom.in_the_box (list), custom.warranty_years, custom.best_seller_rank.
 * - Cart line attributes pass through unchanged (keys in ../attributes.ts).
 * - Orders/proofs/stages/quotes live in a small app or serverless store (Shopify has no proof model).
 */
export function createShopifyAdapter(): CommerceAdapter {
  return {
    name: 'shopify',
    // TODO(phase2): Storefront `products(first, after, query: "product_type:… tag:…", sortKey)` + metafields
    getProducts: async () => notImplemented('products query'),
    // TODO(phase2): Storefront `product(handle:)` with variants, media, metafields
    getProduct: async () => notImplemented('product(handle) query'),
    // TODO(phase2): Storefront `metaobjects(type: "design")`
    getDesigns: async () => notImplemented('metaobjects(type: design)'),
    // TODO(phase2): Storefront `metaobject(id:)`
    getDesign: async () => notImplemented('metaobject(id) design'),
    // TODO(phase2): derived from `metaobjects(type: "vehicle_fitment")` (unique make/model)
    getVehicles: async () => notImplemented('metaobjects(type: vehicle_fitment) → vehicles'),
    // TODO(phase2): Storefront `metaobjects(type: "housing")`
    getHousings: async () => notImplemented('metaobjects(type: housing)'),
    // TODO(phase2): Storefront `metaobject(handle: {type: "housing", handle})`
    getHousing: async () => notImplemented('metaobject(handle) housing'),
    // TODO(phase2): `metaobjects(type: "vehicle_fitment")`, filter server-side (cache with 'use cache')
    getFitments: async () => notImplemented('metaobjects(type: vehicle_fitment)'),
    // TODO(phase2): Cart API `cartCreate(input: { lines })`
    createCart: async () => notImplemented('cartCreate mutation'),
    // TODO(phase2): Cart API `cart(id:)`
    getCart: async () => notImplemented('cart(id) query'),
    // TODO(phase2): Cart API `cartLinesAdd`
    addCartLines: async () => notImplemented('cartLinesAdd mutation'),
    // TODO(phase2): Cart API `cartLinesUpdate`
    updateCartLines: async () => notImplemented('cartLinesUpdate mutation'),
    // TODO(phase2): Cart API `cartLinesRemove`
    removeCartLines: async () => notImplemented('cartLinesRemove mutation'),
    // TODO(phase2): Customer Account API `customer { orders }` + app-stored stages
    getOrders: async () => notImplemented('Customer Account API customer.orders'),
    // TODO(phase2): Customer Account API `order(id:)` + app-stored stages
    getOrder: async () => notImplemented('Customer Account API order(id)'),
    // TODO(phase2): proofs app endpoint (email + order number lookup)
    findOrder: async () => notImplemented('proofs app: order lookup'),
    // TODO(phase2): proofs app endpoint
    getProof: async () => notImplemented('proofs app: get proof'),
    // TODO(phase2): proofs app endpoint (approve / request change, upload to storage)
    respondToProof: async () => notImplemented('proofs app: respond to proof'),
    // TODO(phase2): reviews provider (app) or metaobjects(type: "review")
    getReviews: async () => notImplemented('reviews source'),
    // TODO(phase2): metaobjects(type: "gallery_item")
    getGallery: async () => notImplemented('metaobjects(type: gallery_item)'),
    // TODO(phase2): metaobjects(type: "faq") or keep in content/
    getFaqs: async () => notImplemented('metaobjects(type: faq)'),
    // TODO(phase2): shop metafield `custom.business_pricing` (json)
    getBusinessPricing: async () => notImplemented('shop.metafield business_pricing'),
    // TODO(phase2): quotes app endpoint (+ Draft Order via Admin API on approval)
    requestQuote: async () => notImplemented('quotes app: create quote'),
  }
}

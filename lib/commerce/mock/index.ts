import businessPricingJson from '@/data/business-pricing.json'
import designsJson from '@/data/designs.json'
import faqsJson from '@/data/faqs.json'
import fitmentJson from '@/data/fitment.json'
import galleryJson from '@/data/gallery.json'
import housingsJson from '@/data/housings.json'
import ordersJson from '@/data/orders.json'
import productsJson from '@/data/products.json'
import proofsJson from '@/data/proofs.json'
import reviewsJson from '@/data/reviews.json'
import vehiclesJson from '@/data/vehicles.json'
import { CommerceError } from '../errors'
import { paginate } from '../pagination'
import type {
  BusinessPricing,
  Cart,
  CartLine,
  CartLineInput,
  CommerceAdapter,
  Design,
  Faq,
  Fitment,
  GalleryItem,
  Housing,
  Money,
  Order,
  Product,
  Proof,
  Quote,
  Review,
  Vehicle,
} from '../types'

/**
 * Mock adapter: reads /data fixtures. Fixtures are validated against lib/commerce/schemas.ts in
 * tests/unit/fixtures.test.ts, so the casts below are checked at CI time, not at runtime.
 */
const db = {
  products: productsJson as Product[],
  designs: designsJson as Design[],
  vehicles: vehiclesJson as Vehicle[],
  housings: housingsJson as Housing[],
  fitment: fitmentJson as Fitment[],
  reviews: reviewsJson as Review[],
  gallery: galleryJson as GalleryItem[],
  orders: ordersJson as Order[],
  proofs: proofsJson as Proof[],
  faqs: faqsJson as Faq[],
  businessPricing: businessPricingJson as BusinessPricing,
}

export type MockOptions = { latencyMs?: number; errorRate?: number; random?: () => number }

const usd = (n: number): Money => ({ amount: n.toFixed(2), currencyCode: 'USD' })
const clone = <T>(v: T): T => structuredClone(v)
const eq = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

export function createMockAdapter(opts: MockOptions = {}): CommerceAdapter {
  const latencyMs = opts.latencyMs ?? Number(process.env.MOCK_LATENCY_MS ?? 0)
  const errorRate = opts.errorRate ?? Number(process.env.MOCK_ERROR_RATE ?? 0)
  const random = opts.random ?? Math.random

  /** Simulate network: optional latency + random failures. Always returns a deep copy. */
  async function call<T>(op: string, fn: () => T): Promise<T> {
    if (latencyMs > 0) await new Promise((r) => setTimeout(r, latencyMs))
    if (errorRate > 0 && random() < errorRate)
      throw new CommerceError(`Mock failure in ${op}`, 'UPSTREAM')
    return clone(fn())
  }

  // In-memory carts + mutable proof state (per server process; fine for mock).
  const carts = new Map<string, Cart>()
  const proofs = new Map(db.proofs.map((p) => [p.id, clone(p)]))
  let seq = 0

  const variantIndex = new Map(
    db.products.flatMap((p) => p.variants.map((v) => [v.id, { product: p, variant: v }] as const)),
  )

  function toLine(input: CartLineInput): CartLine {
    const hit = variantIndex.get(input.merchandiseId)
    if (!hit) throw new CommerceError(`Unknown merchandise ${input.merchandiseId}`, 'INVALID')
    const unit = Number(hit.variant.price.amount)
    return {
      id: `gid://mock/CartLine/${++seq}`,
      merchandiseId: input.merchandiseId,
      quantity: input.quantity,
      attributes: input.attributes ?? [],
      cost: { amountPerQuantity: usd(unit), totalAmount: usd(unit * input.quantity) },
      merchandise: {
        productHandle: hit.product.handle,
        productTitle: hit.product.title,
        variantTitle: hit.variant.title,
        image: hit.product.featuredImage,
      },
    }
  }

  function recalc(cart: Cart): Cart {
    for (const l of cart.lines) {
      l.cost.totalAmount = usd(Number(l.cost.amountPerQuantity.amount) * l.quantity)
    }
    const subtotal = cart.lines.reduce((s, l) => s + Number(l.cost.totalAmount.amount), 0)
    cart.totalQuantity = cart.lines.reduce((s, l) => s + l.quantity, 0)
    cart.cost = { subtotalAmount: usd(subtotal), totalAmount: usd(subtotal) }
    return cart
  }

  function requireCart(id: string): Cart {
    const cart = carts.get(id)
    if (!cart) throw new CommerceError(`Cart ${id} not found`, 'NOT_FOUND')
    return cart
  }

  return {
    name: 'mock',

    getProducts: (q = {}) =>
      call('getProducts', () => {
        let items = db.products
        if (q.productType) items = items.filter((p) => p.productType === q.productType)
        if (q.housingCodes) {
          const codes = new Set(q.housingCodes)
          items = items.filter((p) => p.housing_code !== null && codes.has(p.housing_code))
        }
        const price = (p: Product) => Number(p.priceRange.minVariantPrice.amount)
        const sorted = [...items]
        if (q.sort === 'price_asc') sorted.sort((a, b) => price(a) - price(b))
        if (q.sort === 'price_desc') sorted.sort((a, b) => price(b) - price(a))
        if (q.sort === 'best_selling')
          sorted.sort((a, b) => (a.best_seller_rank ?? 999) - (b.best_seller_rank ?? 999))
        return paginate(sorted, q)
      }),
    getProduct: (handle) =>
      call('getProduct', () => db.products.find((p) => p.handle === handle) ?? null),
    getDesigns: (args = {}) =>
      call('getDesigns', () =>
        paginate(
          args.category ? db.designs.filter((d) => d.category === args.category) : db.designs,
          args,
        ),
      ),
    getDesign: (id) => call('getDesign', () => db.designs.find((d) => d.id === id) ?? null),

    getVehicles: () => call('getVehicles', () => db.vehicles),
    getHousings: () => call('getHousings', () => db.housings),
    getHousing: (code) =>
      call('getHousing', () => db.housings.find((h) => eq(h.code, code)) ?? null),
    getFitments: (f = {}) =>
      call('getFitments', () =>
        db.fitment.filter(
          (r) => (!f.make || eq(r.make, f.make)) && (!f.model || eq(r.model, f.model)),
        ),
      ),

    createCart: (lines = []) =>
      call('createCart', () => {
        const id = `gid://mock/Cart/${++seq}`
        const cart = recalc({
          id,
          checkoutUrl: '/checkout',
          totalQuantity: 0,
          lines: lines.map(toLine),
          cost: { subtotalAmount: usd(0), totalAmount: usd(0) },
        })
        carts.set(id, cart)
        return cart
      }),
    getCart: (id) => call('getCart', () => carts.get(id) ?? null),
    addCartLines: (id, lines) =>
      call('addCartLines', () => {
        const cart = requireCart(id)
        cart.lines.push(...lines.map(toLine))
        return recalc(cart)
      }),
    updateCartLines: (id, updates) =>
      call('updateCartLines', () => {
        const cart = requireCart(id)
        for (const u of updates) {
          const line = cart.lines.find((l) => l.id === u.id)
          if (!line) throw new CommerceError(`Line ${u.id} not found`, 'NOT_FOUND')
          if (u.quantity !== undefined) line.quantity = u.quantity
          if (u.attributes) line.attributes = u.attributes
        }
        cart.lines = cart.lines.filter((l) => l.quantity > 0)
        return recalc(cart)
      }),
    removeCartLines: (id, lineIds) =>
      call('removeCartLines', () => {
        const cart = requireCart(id)
        cart.lines = cart.lines.filter((l) => !lineIds.includes(l.id))
        return recalc(cart)
      }),

    getOrders: (email) => call('getOrders', () => db.orders.filter((o) => eq(o.email, email))),
    getOrder: (id) => call('getOrder', () => db.orders.find((o) => o.id === id) ?? null),
    findOrder: (email, number) =>
      call(
        'findOrder',
        () =>
          db.orders.find((o) => eq(o.email, email) && o.number === number.replace(/^#/, '')) ??
          null,
      ),
    getProof: (id) => call('getProof', () => proofs.get(id) ?? null),
    respondToProof: (id, response) =>
      call('respondToProof', () => {
        const proof = proofs.get(id)
        if (!proof) throw new CommerceError(`Proof ${id} not found`, 'NOT_FOUND')
        if (proof.status !== 'pending') throw new CommerceError('Proof already answered', 'INVALID')
        if (response.action === 'approve') {
          proof.status = 'approved'
        } else {
          if (proof.revisionsUsed >= proof.revisionsAllowed)
            throw new CommerceError('No free revisions left', 'INVALID')
          proof.status = 'changes_requested'
          proof.revisionsUsed += 1
          proof.comments.push({
            id: `c${proof.comments.length + 1}`,
            author: 'customer',
            body: response.comment,
            at: new Date().toISOString(),
            ...(response.attachmentUrl ? { attachmentUrl: response.attachmentUrl } : {}),
          })
        }
        return proof
      }),

    getReviews: (f = {}) =>
      call('getReviews', () =>
        paginate(
          db.reviews.filter(
            (r) =>
              (!f.productHandle || r.product_handle === f.productHandle) &&
              (!f.housingCode || r.housing_code === f.housingCode) &&
              (!f.category || r.design_category === f.category),
          ),
          f,
        ),
      ),
    getGallery: (f = {}) =>
      call('getGallery', () =>
        paginate(
          db.gallery.filter(
            (g) =>
              (!f.make || eq(g.make, f.make)) && (!f.category || g.design_category === f.category),
          ),
          f,
        ),
      ),
    getFaqs: (topic) =>
      call('getFaqs', () => (topic ? db.faqs.filter((q) => q.topics.includes(topic)) : db.faqs)),

    getBusinessPricing: () => call('getBusinessPricing', () => db.businessPricing),
    requestQuote: (request) =>
      call('requestQuote', (): Quote => {
        const bp = db.businessPricing
        const tier = bp.tiers.find(
          (t) =>
            request.quantity >= t.min_qty && (t.max_qty === null || request.quantity <= t.max_qty),
        )
        if (!tier) throw new CommerceError('Quantity out of range', 'INVALID')
        const unit = Number(bp.base_unit_price.amount) * (1 - tier.discount_pct / 100)
        const setup = Number(bp.setup_fee.amount)
        return {
          id: `qt_${++seq}`,
          request,
          tierId: tier.id,
          unitPrice: usd(unit),
          setupFee: usd(setup),
          total: usd(unit * request.quantity + setup),
          status: 'sent',
          validUntil: new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10),
        }
      }),
  }
}

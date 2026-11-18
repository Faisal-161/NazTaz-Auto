import { describe, expect, it } from 'vitest'
import { ATTR } from '@/lib/commerce/attributes'
import { CommerceError } from '@/lib/commerce/errors'
import { createMockAdapter } from '@/lib/commerce/mock'
import { decodeCursor, paginate } from '@/lib/commerce/pagination'
import { createShopifyAdapter } from '@/lib/commerce/shopify'

const mock = () => createMockAdapter({ latencyMs: 0, errorRate: 0 })

describe('paginate', () => {
  const items = Array.from({ length: 7 }, (_, i) => i)
  it('walks pages with cursors like a Shopify connection', () => {
    const p1 = paginate(items, { first: 3 })
    expect(p1.nodes).toEqual([0, 1, 2])
    expect(p1.pageInfo.hasNextPage).toBe(true)
    const p3 = paginate(items, { first: 3, after: paginate(items, { first: 3, after: p1.pageInfo.endCursor }).pageInfo.endCursor })
    expect(p3.nodes).toEqual([6])
    expect(p3.pageInfo).toEqual({ hasNextPage: false, endCursor: 'cursor:6' })
  })
  it('returns an empty page past the end', () => {
    expect(paginate(items, { after: 'cursor:6' })).toEqual({ nodes: [], pageInfo: { hasNextPage: false, endCursor: null } })
  })
  it('rejects garbage cursors', () => {
    expect(() => decodeCursor('nope')).toThrow()
  })
})

describe('mock adapter: catalog + fitment', () => {
  it('filters products by housing and sorts best sellers first', async () => {
    const res = await mock().getProducts({ housingCodes: ['FD-DR-01'] })
    expect(res.nodes).toHaveLength(1)
    expect(res.nodes[0]?.housing_code).toBe('FD-DR-01')
    const best = await mock().getProducts({ sort: 'best_selling', first: 2 })
    expect(best.nodes.map((p) => p.best_seller_rank)).toEqual([1, 2])
  })
  it('returns null for unknown handles and copies data (no shared mutation)', async () => {
    const a = mock()
    expect(await a.getProduct('nope')).toBeNull()
    const p = await a.getProduct('universal-wireless-puddle-lights')
    p!.title = 'mutated'
    expect((await a.getProduct('universal-wireless-puddle-lights'))?.title).not.toBe('mutated')
  })
  it('looks up fitment case-insensitively', async () => {
    const rows = await mock().getFitments({ make: 'chevrolet', model: 'silverado 1500' })
    expect(rows.map((r) => r.housings[0])).toEqual(['GM-MR-01', 'GM-MR-02'])
  })
})

describe('mock adapter: cart (Cart API shape)', () => {
  it('creates, adds, updates and removes lines with attributes preserved', async () => {
    const a = mock()
    const { nodes } = await a.getProducts({ housingCodes: ['TS-DR-01'] })
    const variant = nodes[0]!.variants[0]!
    const attrs = [{ key: ATTR.housingCode, value: 'TS-DR-01' }]
    let cart = await a.createCart([{ merchandiseId: variant.id, quantity: 1, attributes: attrs }])
    expect(cart.checkoutUrl).toBe('/checkout')
    cart = await a.addCartLines(cart.id, [{ merchandiseId: variant.id, quantity: 2 }])
    expect(cart.totalQuantity).toBe(3)
    expect(cart.cost.subtotalAmount.amount).toBe((Number(variant.price.amount) * 3).toFixed(2))
    const first = cart.lines[0]!
    expect(first.attributes).toEqual(attrs)
    cart = await a.updateCartLines(cart.id, [{ id: first.id, quantity: 0 }])
    expect(cart.lines).toHaveLength(1)
    cart = await a.removeCartLines(cart.id, [cart.lines[0]!.id])
    expect(cart.totalQuantity).toBe(0)
  })
  it('rejects unknown merchandise', async () => {
    await expect(mock().createCart([{ merchandiseId: 'x', quantity: 1 }])).rejects.toBeInstanceOf(CommerceError)
  })
})

describe('mock adapter: orders, proofs, quotes', () => {
  it('finds an order by email + number (with or without #)', async () => {
    expect((await mock().findOrder('DEMO@example.com', '#1001'))?.id).toBe('ord_1001')
    expect(await mock().findOrder('other@example.com', '1001')).toBeNull()
  })
  it('requests a change, counting revisions, then refuses when none are left', async () => {
    const a = mock()
    const p = await a.respondToProof('prf_1001_1', { action: 'request_changes', comment: 'Bigger name' })
    expect(p.status).toBe('changes_requested')
    expect(p.revisionsUsed).toBe(1)
    await expect(a.respondToProof('prf_1001_1', { action: 'approve' })).rejects.toThrow(/already answered/)
  })
  it('prices a quote from the volume tier', async () => {
    const q = await mock().requestQuote({ company: 'Acme', contactName: 'A', email: 'a@b.co', quantity: 30, vehicles: 'F-150', deadline: '2027-01-01' })
    expect(q.tierId).toBe('tier_3')
    expect(q.unitPrice.amount).toBe('127.20')
    expect(q.total.amount).toBe((127.2 * 30 + 49).toFixed(2))
  })
})

describe('mock adapter: latency + error injection', () => {
  it('throws when the injected error fires', async () => {
    const a = createMockAdapter({ errorRate: 1, random: () => 0 })
    await expect(a.getVehicles()).rejects.toThrow(/Mock failure/)
  })
  it('waits for latency', async () => {
    const a = createMockAdapter({ latencyMs: 30 })
    const t0 = performance.now()
    await a.getVehicles()
    expect(performance.now() - t0).toBeGreaterThanOrEqual(25)
  })
})

describe('shopify adapter stub', () => {
  it('implements every adapter method (same interface as mock)', () => {
    const keys = (o: object) => Object.keys(o).sort()
    expect(keys(createShopifyAdapter())).toEqual(keys(mock()))
  })
  it('throws NOT_IMPLEMENTED until Phase 2', async () => {
    await expect(createShopifyAdapter().getProducts()).rejects.toMatchObject({ code: 'NOT_IMPLEMENTED' })
  })
})

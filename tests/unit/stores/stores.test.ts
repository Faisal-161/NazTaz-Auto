import { beforeEach, describe, expect, it } from 'vitest'
import { cartCount, cartSubtotal, useCartStore, type NewCartLine } from '@/lib/stores/cart'
import { selectActiveVehicle, useGarageStore } from '@/lib/stores/garage'

const line = (over: Partial<NewCartLine> = {}): NewCartLine => ({
  merchandiseId: 'gid://mock/ProductVariant/a',
  productHandle: 'a',
  title: 'A',
  variantTitle: '2 lights / Custom',
  unitPrice: { amount: '19.99', currencyCode: 'USD' },
  quantity: 1,
  image: { url: '/x.svg', altText: '', width: 1, height: 1 },
  attributes: [{ key: '_design_id', value: 'd1' }],
  ...over,
})

describe('cart store', () => {
  beforeEach(() => useCartStore.setState({ lines: [], isOpen: false }))

  it('merges identical merchandise + attributes, keeps different designs separate', () => {
    const s = useCartStore.getState()
    s.add(line())
    s.add(line({ attributes: [{ key: '_design_id', value: 'd1' }] }))
    s.add(line({ attributes: [{ key: '_design_id', value: 'd2' }] }))
    const { lines } = useCartStore.getState()
    expect(lines).toHaveLength(2)
    expect(cartCount(lines)).toBe(3)
  })
  it('computes subtotal in cents (no float drift)', () => {
    useCartStore.getState().add(line({ quantity: 3 }))
    expect(cartSubtotal(useCartStore.getState().lines).amount).toBe('59.97')
  })
  it('caps quantity and removes at zero', () => {
    const s = useCartStore.getState()
    s.add(line({ quantity: 50 }))
    const id = useCartStore.getState().lines[0]!.id
    expect(useCartStore.getState().lines[0]!.quantity).toBe(20)
    s.setQuantity(id, 0)
    expect(useCartStore.getState().lines).toHaveLength(0)
  })
})

describe('garage store', () => {
  beforeEach(() => useGarageStore.setState({ vehicles: [], activeId: null }))

  it('adds vehicles, activates the newest, dedupes the same vehicle', () => {
    const g = useGarageStore.getState()
    const a = g.addVehicle({ year: 2022, make: 'Ford', model: 'F-150' })
    const b = g.addVehicle({ year: 2023, make: 'Tesla', model: 'Model Y' })
    expect(useGarageStore.getState().activeId).toBe(b)
    const again = g.addVehicle({ year: 2022, make: 'ford', model: 'f-150', housing_code: 'FD-DR-01' })
    expect(again).toBe(a)
    expect(useGarageStore.getState().vehicles).toHaveLength(2)
    expect(selectActiveVehicle(useGarageStore.getState())?.housing_code).toBe('FD-DR-01')
  })
  it('falls back to another vehicle when the active one is removed', () => {
    const g = useGarageStore.getState()
    const a = g.addVehicle({ year: 2022, make: 'Ford', model: 'F-150' })
    const b = g.addVehicle({ year: 2023, make: 'Tesla', model: 'Model Y' })
    g.removeVehicle(b)
    expect(useGarageStore.getState().activeId).toBe(a)
  })
})

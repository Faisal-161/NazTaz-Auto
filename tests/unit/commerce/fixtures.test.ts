import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { fixtures, type FixtureName } from '@/lib/commerce/schemas'

const dataDir = path.resolve(__dirname, '../../../data')
const load = (name: string): unknown =>
  JSON.parse(fs.readFileSync(path.join(dataDir, `${name}.json`), 'utf8'))

describe('fixtures match schemas', () => {
  for (const name of Object.keys(fixtures) as FixtureName[]) {
    it(`data/${name}.json`, () => {
      const result = fixtures[name].safeParse(load(name))
      if (!result.success) throw new Error(result.error.message)
    })
  }

  it('every data file has a schema', () => {
    const files = fs
      .readdirSync(dataDir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace(/\.json$/, ''))
    expect(files.sort()).toEqual(Object.keys(fixtures).sort())
  })
})

describe('fixture referential integrity', () => {
  const housings = fixtures.housings.parse(load('housings'))
  const codes = new Set(housings.map((h) => h.code))
  const products = fixtures.products.parse(load('products'))
  const fitment = fixtures.fitment.parse(load('fitment'))
  const orders = fixtures.orders.parse(load('orders'))
  const proofs = fixtures.proofs.parse(load('proofs'))

  it('fitment references existing housings', () => {
    for (const f of fitment)
      for (const h of f.housings) expect(codes, `${f.id} → ${h}`).toContain(h)
  })
  it('vehicle products reference existing housings and every housing has a product', () => {
    const productCodes = new Set(
      products.filter((p) => p.productType === 'vehicle').map((p) => p.housing_code),
    )
    for (const c of productCodes) expect(codes).toContain(c)
    for (const c of codes) expect(productCodes, `housing ${c} has no product`).toContain(c)
  })
  it('handles and variant ids are unique', () => {
    const handles = products.map((p) => p.handle)
    expect(new Set(handles).size).toBe(handles.length)
    const vids = products.flatMap((p) => p.variants.map((v) => v.id))
    expect(new Set(vids).size).toBe(vids.length)
  })
  it('orders reference existing proofs', () => {
    const ids = new Set(proofs.map((p) => p.id))
    for (const o of orders) for (const id of o.proofIds) expect(ids).toContain(id)
  })
  it('covers the 15 launch vehicle lines', () => {
    const models = new Set(fitment.map((f) => `${f.make} ${f.model}`))
    for (const m of [
      'Ford F-150',
      'RAM 1500',
      'Chevrolet Silverado 1500',
      'Tesla Model 3',
      'Tesla Model Y',
      'Dodge Challenger',
      'Dodge Charger',
      'Toyota Camry',
      'Honda Accord',
      'Chevrolet Tahoe',
      'Cadillac Escalade',
      'Jeep Grand Cherokee',
      'Ford Mustang',
      'BMW 5 Series',
      'Mercedes-Benz C-Class',
    ])
      expect(models).toContain(m)
  })
  it('social proof is always flagged sample', () => {
    for (const name of ['reviews', 'gallery'] as const) {
      for (const item of load(name) as { sample: boolean }[]) expect(item.sample).toBe(true)
    }
  })
})

import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Fitment, GarageVehicle, Housing, Product } from '@/lib/commerce/types'
import {
  badgeFor,
  candidateHousings,
  findByPartNumber,
  normalizePartNumber,
  productFit,
  productsForVehicle,
} from '@/lib/fitment'

const load = <T>(name: string) =>
  JSON.parse(fs.readFileSync(path.resolve(__dirname, `../../../data/${name}.json`), 'utf8')) as T
const fitment = load<Fitment[]>('fitment')
const products = load<Product[]>('products')
const housings = load<Housing[]>('housings')
const byHousing = (code: string) => products.find((p) => p.housing_code === code)!
const universal = products.find((p) => p.productType === 'universal')!

const f150 = (over: Partial<GarageVehicle> = {}): GarageVehicle => ({
  id: 'v1',
  year: 2022,
  make: 'Ford',
  model: 'F-150',
  ...over,
})

describe('badges', () => {
  it('maps confidence to badge', () => {
    expect(badgeFor('verified')).toBe('verified')
    expect(badgeFor('likely')).toBe('likely')
    expect(badgeFor('unverified')).toBe('check')
  })
})

describe('productFit', () => {
  it('universal and service products are always universal', () => {
    expect(productFit(universal, f150(), fitment)).toEqual({ status: 'universal' })
    expect(productFit(universal, null, fitment)).toEqual({ status: 'universal' })
  })
  it('is unknown without a vehicle', () => {
    expect(productFit(byHousing('FD-DR-01'), null, fitment)).toEqual({ status: 'unknown' })
  })
  it('with a confirmed housing only that housing fits', () => {
    const v = f150({ housing_code: 'FD-DR-01', fit_method: 'picker' })
    expect(productFit(byHousing('FD-DR-01'), v, fitment)).toEqual({
      status: 'fits',
      badge: 'verified',
    })
    expect(productFit(byHousing('FD-MR-01'), v, fitment)).toEqual({ status: 'no_fit' })
    expect(productFit(byHousing('TS-DR-01'), v, fitment)).toEqual({ status: 'no_fit' })
  })
  it('photo review fits are always "Check fit" until our team confirms them', () => {
    const v = f150({ housing_code: 'FD-DR-01', fit_method: 'photo_review' })
    expect(productFit(byHousing('FD-DR-01'), v, fitment)).toEqual({
      status: 'fits',
      badge: 'check',
    })
  })
  it('unconfirmed housing with several candidates caps the badge at "Check fit"', () => {
    expect(candidateHousings(fitment, f150())).toEqual(['FD-DR-01', 'FD-MR-01'])
    expect(productFit(byHousing('FD-DR-01'), f150(), fitment)).toEqual({
      status: 'fits',
      badge: 'check',
    })
  })
  it('unconfirmed housing with one candidate keeps the row confidence', () => {
    const y: GarageVehicle = { id: 'v2', year: 2023, make: 'Tesla', model: 'Model Y' }
    expect(productFit(byHousing('TS-DR-01'), y, fitment)).toEqual({
      status: 'fits',
      badge: 'verified',
    })
  })
  it('uses the year for mid-generation changes', () => {
    const early: GarageVehicle = {
      id: 'v3',
      year: 2020,
      make: 'Chevrolet',
      model: 'Silverado 1500',
    }
    expect(productFit(byHousing('GM-MR-01'), early, fitment).status).toBe('fits')
    expect(productFit(byHousing('GM-MR-02'), early, fitment).status).toBe('no_fit')
  })
})

describe('productsForVehicle', () => {
  it('drops non-fitting products and orders fits before universal', () => {
    const v = f150({ housing_code: 'FD-DR-01', fit_method: 'picker' })
    const list = productsForVehicle(products, v, fitment)
    expect(list[0]?.product.housing_code).toBe('FD-DR-01')
    expect(list.every((x) => x.fit.status !== 'no_fit')).toBe(true)
    expect(list.slice(1).every((x) => x.fit.status === 'universal')).toBe(true)
  })
  it('returns everything unchanged without a vehicle', () => {
    expect(productsForVehicle(products, null, fitment)).toHaveLength(products.length)
  })
})

describe('part number search', () => {
  it('normalizes spacing, dashes and case', () => {
    expect(normalizePartNumber(' sample-fd 1001 ')).toBe('SAMPLEFD1001')
  })
  it('finds exact matches first, then prefixes; needs 4+ characters', () => {
    expect(findByPartNumber(housings, 'sample fd 1001')[0]).toMatchObject({
      exact: true,
      housing: { code: 'FD-DR-01' },
    })
    const prefix = findByPartNumber(housings, 'SAMPLE-FD-100')
    expect(prefix.map((m) => m.housing.code)).toEqual(['FD-DR-01', 'FD-MR-01', 'FD-DR-02'])
    expect(prefix.every((m) => !m.exact)).toBe(true)
    expect(findByPartNumber(housings, 'sam')).toEqual([])
    expect(findByPartNumber(housings, 'nothing-like-this')).toEqual([])
  })
  it('returns one match per housing even when several part numbers match', () => {
    const hits = findByPartNumber(housings, 'SAMPLE-ST-21')
    expect(hits).toHaveLength(1)
    expect(hits[0]?.housing.code).toBe('ST-DR-01')
  })
})

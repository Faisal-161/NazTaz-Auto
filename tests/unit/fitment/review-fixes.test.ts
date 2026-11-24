/**
 * Regression tests for the perf-a11y-reviewer findings on lib/fitment (2026-11-24).
 * Each block names the finding it locks down.
 */
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Fitment, GarageVehicle, Housing, Product } from '@/lib/commerce/types'
import {
  candidateHousings,
  findByPartNumber,
  mapVpicResponse,
  parseFitParams,
  productFit,
  productsForVehicle,
  resolveFitment,
  slugify,
} from '@/lib/fitment'

const load = <T>(name: string) =>
  JSON.parse(fs.readFileSync(path.resolve(__dirname, `../../../data/${name}.json`), 'utf8')) as T
const fitment = load<Fitment[]>('fitment')
const products = load<Product[]>('products')
const housings = load<Housing[]>('housings')
const byHousing = (code: string) => products.find((p) => p.housing_code === code)!

const row = (over: Partial<Fitment>): Fitment => ({
  id: 'r',
  make: 'Acme',
  model: 'Roadster',
  generation: '1st gen',
  year_start: 2018,
  year_end: 2022,
  trims: [],
  has_factory_lights: 'yes',
  housings: ['A'],
  confidence: 'verified',
  verified_installs: 0,
  source: 'test',
  ...over,
})
const v = (over: Partial<GarageVehicle>): GarageVehicle => ({
  id: 'v',
  year: 2022,
  make: 'Ford',
  model: 'F-150',
  ...over,
})

describe('VIN make casing ([-s] regex bug)', () => {
  const make = (m: string) =>
    mapVpicResponse({ Results: [{ ModelYear: '2023', Make: m, Model: 'X' }] })?.make
  it('title-cases multi-word and s-containing makes', () => {
    expect(make('TESLA')).toBe('Tesla')
    expect(make('NISSAN')).toBe('Nissan')
    expect(make('PORSCHE')).toBe('Porsche')
    expect(make('LAND ROVER')).toBe('Land Rover')
    expect(make('MERCEDES-BENZ')).toBe('Mercedes-Benz')
    expect(make('FORD')).toBe('Ford')
  })
  it('keeps capitalised makes', () => {
    expect(make('BMW')).toBe('BMW')
    expect(make('GMC')).toBe('GMC')
    expect(make('RAM')).toBe('RAM')
  })
})

describe('productFit respects "no factory lights" (fit_method universal)', () => {
  it('Model Y marked universal: vehicle products do not fit', () => {
    const y = v({ year: 2023, make: 'Tesla', model: 'Model Y', fit_method: 'universal' })
    expect(productFit(byHousing('TS-DR-01'), y, fitment)).toEqual({ status: 'no_fit' })
  })
  it('F-150 marked universal: only universal products are listed', () => {
    const list = productsForVehicle(products, v({ fit_method: 'universal' }), fitment)
    expect(list.every((x) => x.fit.status === 'universal')).toBe(true)
    expect(list.length).toBeGreaterThan(0)
  })
})

describe('productFit agrees with resolveFitment on trims', () => {
  it('RAM 1500 Tradesman (trim without lights): no fit, matching the finder', () => {
    const ram = v({ year: 2022, make: 'RAM', model: '1500', trim: 'Tradesman' })
    expect(
      resolveFitment(fitment, { year: 2022, make: 'ram', model: '1500', trim: 'tradesman' }),
    ).toMatchObject({ kind: 'universal', reason: 'trim_without_lights' })
    expect(productFit(byHousing('RM-MR-01'), ram, fitment)).toEqual({ status: 'no_fit' })
  })
  it('RAM 1500 with unknown trim on a "some" row: Check fit, never Verified', () => {
    const ram = v({ year: 2022, make: 'RAM', model: '1500' })
    expect(productFit(byHousing('RM-MR-01'), ram, fitment)).toEqual({
      status: 'fits',
      badge: 'check',
    })
  })
  it('RAM 1500 Laramie (listed trim): Verified', () => {
    const ram = v({ year: 2022, make: 'RAM', model: '1500', trim: 'Laramie' })
    expect(productFit(byHousing('RM-MR-01'), ram, fitment)).toEqual({
      status: 'fits',
      badge: 'verified',
    })
  })
})

describe('stale saved housing (year changed after picking)', () => {
  it('2020 Silverado holding the 2022+ housing: falls back to what the data supports', () => {
    const silverado = v({
      year: 2020,
      make: 'Chevrolet',
      model: 'Silverado 1500',
      housing_code: 'GM-MR-02',
      fit_method: 'picker',
    })
    expect(productFit(byHousing('GM-MR-02'), silverado, fitment)).toEqual({ status: 'no_fit' })
    expect(productFit(byHousing('GM-MR-01'), silverado, fitment)).toEqual({
      status: 'fits',
      badge: 'verified',
    })
    expect(candidateHousings(fitment, silverado)).toEqual(['GM-MR-01'])
  })
  it('externally confirmed housings (part number / VIN) are kept as confirmed', () => {
    const pn = v({ housing_code: 'fd-dr-01', fit_method: 'part_number' })
    expect(productFit(byHousing('FD-DR-01'), pn, fitment).status).toBe('fits')
    expect(productFit(byHousing('FD-MR-01'), pn, fitment)).toEqual({ status: 'no_fit' })
  })
})

describe('trims apply to "yes" rows too', () => {
  const rows = [
    row({ id: 'door', has_factory_lights: 'yes', trims: ['Platinum'], housings: ['DOOR'] }),
    row({ id: 'mirror', has_factory_lights: 'some', trims: ['XLT'], housings: ['MIRROR'] }),
  ]
  const base = { year: 2020, make: 'acme', model: 'roadster' }
  it('base trim (unlisted) → universal, not a verified door light', () => {
    expect(resolveFitment(rows, { ...base, trim: 'base' })).toMatchObject({
      kind: 'universal',
      reason: 'trim_without_lights',
    })
  })
  it('XLT → mirror only; Platinum → door only', () => {
    expect(resolveFitment(rows, { ...base, trim: 'xlt' })).toMatchObject({
      kind: 'resolved',
      housing: 'MIRROR',
    })
    expect(resolveFitment(rows, { ...base, trim: 'platinum' })).toMatchObject({
      kind: 'resolved',
      housing: 'DOOR',
    })
  })
  it('unknown trim → ask about factory lights first', () => {
    expect(resolveFitment(rows, base).kind).toBe('ask_factory')
  })
  it('a "some" row among mid-generation candidates triggers the factory question', () => {
    const mixed = [
      row({ id: 'early', generation: 'g', year_start: 2019, year_end: 2022, housings: ['EARLY'] }),
      row({
        id: 'late',
        generation: 'g',
        year_start: 2022,
        year_end: 2025,
        has_factory_lights: 'some',
        trims: ['Top'],
        housings: ['LATE'],
      }),
    ]
    expect(resolveFitment(mixed, { year: 2022, make: 'acme', model: 'roadster' }).kind).toBe(
      'ask_factory',
    )
  })
})

describe('non-blocking fixes', () => {
  it('"No factory lights" goes universal before any vehicle questions (F3 step 1)', () => {
    expect(resolveFitment(fitment, { factory: 'no' })).toMatchObject({
      kind: 'universal',
      reason: 'shopper_said_no',
      rows: [],
    })
  })
  it('only plain 4-digit years parse (one URL per selection)', () => {
    for (const y of ['0x7E6', '2.022e3', ' 2022', '2022 ', '02022'])
      expect(parseFitParams(new URLSearchParams({ year: y }))).toEqual({})
  })
  it('housing without make/model is ignored', () => {
    expect(parseFitParams(new URLSearchParams('housing=FD-DR-01'))).toEqual({})
  })
  it('exact short part numbers match; prefixes still need 4 chars', () => {
    const custom: Housing[] = [{ ...housings[0]!, code: 'X1', oem_part_numbers: ['AB1'] }]
    expect(findByPartNumber(custom, 'ab1')).toHaveLength(1)
    expect(findByPartNumber(custom, 'ab')).toHaveLength(0)
  })
  it('slugify strips accents', () => {
    expect(slugify('Citroën C5')).toBe('citroen-c5')
  })
})

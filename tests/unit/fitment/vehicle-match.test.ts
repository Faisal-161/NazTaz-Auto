import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Fitment } from '@/lib/commerce/types'
import { matchVehicle } from '@/lib/fitment'

const fitment = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../../data/fitment.json'), 'utf8'),
) as Fitment[]

describe('matchVehicle (VIN / external names → our slugs)', () => {
  it('matches exact and punctuation-insensitive names', () => {
    expect(matchVehicle(fitment, { year: 2022, make: 'Ford', model: 'F-150' })).toEqual({
      make: 'ford',
      model: 'f-150',
    })
    expect(matchVehicle(fitment, { year: 2022, make: 'FORD', model: 'F150' })).toEqual({
      make: 'ford',
      model: 'f-150',
    })
  })
  it('accepts a unique prefix ("Silverado" → "Silverado 1500")', () => {
    expect(matchVehicle(fitment, { year: 2021, make: 'Chevrolet', model: 'Silverado' })).toEqual({
      make: 'chevrolet',
      model: 'silverado-1500',
    })
  })
  it('returns null for unknown vehicles or years outside our data', () => {
    expect(matchVehicle(fitment, { year: 2022, make: 'Toyota', model: 'Corolla' })).toBeNull()
    expect(matchVehicle(fitment, { year: 2010, make: 'Ford', model: 'F-150' })).toBeNull()
    expect(matchVehicle(fitment, { year: 2022, make: 'Nope', model: 'X' })).toBeNull()
  })
  it('refuses ambiguous prefixes (Tesla "Model" could be 3 or Y)', () => {
    expect(matchVehicle(fitment, { year: 2023, make: 'Tesla', model: 'Model' })).toBeNull()
  })
})

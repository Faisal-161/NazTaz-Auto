import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Fitment } from '@/lib/commerce/types'
import {
  generationOptions,
  housingsOf,
  makeOptions,
  modelOptions,
  resolveFitment,
  trimOptions,
  weakestConfidence,
  yearOptions,
} from '@/lib/fitment'

const row = (over: Partial<Fitment>): Fitment => ({
  id: 'r',
  make: 'Acme',
  model: 'Roadster',
  generation: '1st gen',
  year_start: 2018,
  year_end: 2022,
  trims: [],
  has_factory_lights: 'yes',
  housings: ['AC-DR-01'],
  confidence: 'verified',
  verified_installs: 0,
  source: 'test',
  ...over,
})

const fixture = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../../data/fitment.json'), 'utf8'),
) as Fitment[]

describe('options', () => {
  const rows = [
    row({ id: 'a', make: 'Mercedes-Benz', model: 'C-Class', year_start: 2022, year_end: 2025 }),
    row({ id: 'b', make: 'Acme', model: 'Roadster', year_start: 2018, year_end: 2022 }),
    row({ id: 'c', make: 'Acme', model: 'Hauler', year_start: 2020, year_end: 2021 }),
  ]
  it('lists years newest first, merging ranges', () => {
    expect(yearOptions(rows)).toEqual([2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018])
  })
  it('only offers makes and models that exist for the year', () => {
    expect(makeOptions(rows, 2019)).toEqual([{ value: 'acme', label: 'Acme' }])
    expect(makeOptions(rows, 2022).map((o) => o.value)).toEqual(['acme', 'mercedes-benz'])
    expect(modelOptions(rows, 2021, 'acme').map((o) => o.value)).toEqual(['hauler', 'roadster'])
    expect(modelOptions(rows, 2019, 'acme').map((o) => o.value)).toEqual(['roadster'])
  })
  it('accepts slugs or display names for make/model', () => {
    expect(modelOptions(rows, 2023, 'Mercedes-Benz')).toEqual(
      modelOptions(rows, 2023, 'mercedes-benz'),
    )
  })
})

describe('resolveFitment: input steps', () => {
  const rows = [row({})]
  it('asks for year, then make, then model', () => {
    expect(resolveFitment(rows, {})).toEqual({ kind: 'incomplete', missing: 'year' })
    expect(resolveFitment(rows, { year: 2020 })).toEqual({ kind: 'incomplete', missing: 'make' })
    expect(resolveFitment(rows, { year: 2020, make: 'acme' })).toEqual({
      kind: 'incomplete',
      missing: 'model',
    })
  })
  it('returns no_match outside the covered years or for unknown vehicles', () => {
    expect(resolveFitment(rows, { year: 2017, make: 'acme', model: 'roadster' }).kind).toBe(
      'no_match',
    )
    expect(resolveFitment(rows, { year: 2020, make: 'acme', model: 'nope' }).kind).toBe('no_match')
  })
  it('resolves a single factory housing straight away', () => {
    const r = resolveFitment(rows, { year: 2020, make: 'acme', model: 'roadster' })
    expect(r).toMatchObject({
      kind: 'resolved',
      housing: 'AC-DR-01',
      confidence: 'verified',
      method: 'picker',
    })
  })
})

describe('resolveFitment: generations and mid-generation changes', () => {
  it('asks which generation when a year overlaps two generations', () => {
    const rows = [
      row({ id: 'g1', generation: '1st gen', year_start: 2015, year_end: 2020, housings: ['A'] }),
      row({ id: 'g2', generation: '2nd gen', year_start: 2020, year_end: 2024, housings: ['B'] }),
    ]
    const sel = { year: 2020, make: 'acme', model: 'roadster' }
    expect(resolveFitment(rows, sel)).toEqual({
      kind: 'needs_generation',
      generations: ['1st gen', '2nd gen'],
    })
    expect(generationOptions(rows, 2020, 'acme', 'roadster')).toHaveLength(2)
    expect(resolveFitment(rows, { ...sel, generation: '2nd-gen' })).toMatchObject({
      kind: 'resolved',
      housing: 'B',
    })
    // an unknown generation slug re-asks rather than guessing
    expect(resolveFitment(rows, { ...sel, generation: '9th-gen' }).kind).toBe('needs_generation')
  })

  it('picks the housing by year inside one generation (mid-generation change)', () => {
    const rows = [
      row({
        id: 'early',
        generation: '4th gen',
        year_start: 2019,
        year_end: 2021,
        housings: ['EARLY'],
      }),
      row({
        id: 'late',
        generation: '4th gen',
        year_start: 2022,
        year_end: 2025,
        housings: ['LATE'],
        confidence: 'likely',
      }),
    ]
    expect(resolveFitment(rows, { year: 2021, make: 'acme', model: 'roadster' })).toMatchObject({
      housing: 'EARLY',
    })
    expect(resolveFitment(rows, { year: 2023, make: 'acme', model: 'roadster' })).toMatchObject({
      housing: 'LATE',
      confidence: 'likely',
    })
  })

  it('shows the picker when the change-over year has both housings', () => {
    const rows = [
      row({
        id: 'early',
        generation: '4th gen',
        year_start: 2019,
        year_end: 2022,
        housings: ['EARLY'],
      }),
      row({
        id: 'late',
        generation: '4th gen',
        year_start: 2022,
        year_end: 2025,
        housings: ['LATE'],
      }),
    ]
    const sel = { year: 2022, make: 'acme', model: 'roadster' }
    expect(resolveFitment(rows, sel)).toMatchObject({
      kind: 'pick_housing',
      housings: ['EARLY', 'LATE'],
    })
    expect(resolveFitment(rows, { ...sel, housing: 'late' })).toMatchObject({
      kind: 'resolved',
      housing: 'LATE',
    })
  })

  it('ignores a housing from the URL that does not fit the vehicle', () => {
    const rows = [row({ housings: ['A', 'B'] })]
    const r = resolveFitment(rows, { year: 2020, make: 'acme', model: 'roadster', housing: 'ZZZ' })
    expect(r).toMatchObject({ kind: 'pick_housing', housings: ['A', 'B'] })
  })
})

describe('resolveFitment: factory lights', () => {
  const some = [row({ has_factory_lights: 'some', trims: ['Lariat', 'Platinum'], housings: ['A'] })]
  const base = { year: 2020, make: 'acme', model: 'roadster' }

  it('goes universal when the vehicle has no factory lights', () => {
    const r = resolveFitment([row({ has_factory_lights: 'no', housings: [] })], base)
    expect(r).toMatchObject({ kind: 'universal', reason: 'no_factory_lights' })
  })
  it('goes universal when the shopper says no', () => {
    expect(resolveFitment(some, { ...base, factory: 'no' })).toMatchObject({
      kind: 'universal',
      reason: 'shopper_said_no',
    })
  })
  it('asks about factory lights when only some trims have them', () => {
    expect(resolveFitment(some, base).kind).toBe('ask_factory')
    expect(resolveFitment(some, { ...base, factory: 'unsure' }).kind).toBe('ask_factory')
    expect(resolveFitment(some, { ...base, factory: 'yes' })).toMatchObject({
      kind: 'resolved',
      housing: 'A',
    })
  })
  it('lets a listed trim settle it, and an unlisted trim means universal', () => {
    expect(resolveFitment(some, { ...base, trim: 'lariat' })).toMatchObject({ kind: 'resolved' })
    expect(resolveFitment(some, { ...base, trim: 'xl' })).toMatchObject({
      kind: 'universal',
      reason: 'trim_without_lights',
    })
    // shopper insists they have lights on an unlisted trim: trust them, show the housing
    expect(resolveFitment(some, { ...base, trim: 'xl', factory: 'yes' })).toMatchObject({
      kind: 'resolved',
    })
  })
  it('lists trims for the vehicle', () => {
    expect(trimOptions(some, 2020, 'acme', 'roadster').map((t) => t.value)).toEqual([
      'lariat',
      'platinum',
    ])
  })
})

describe('helpers', () => {
  it('weakest confidence wins', () => {
    expect(weakestConfidence(['verified', 'likely'])).toBe('likely')
    expect(weakestConfidence(['verified', 'unverified', 'likely'])).toBe('unverified')
    expect(weakestConfidence([])).toBe('unverified')
  })
  it('unions housings in order without duplicates', () => {
    expect(housingsOf([row({ housings: ['A', 'B'] }), row({ housings: ['B', 'C'] })])).toEqual([
      'A',
      'B',
      'C',
    ])
  })
})

describe('against the launch fixtures', () => {
  it('F-150 14th gen with factory lights → door vs mirror picker', () => {
    const r = resolveFitment(fixture, { year: 2022, make: 'ford', model: 'f-150', factory: 'yes' })
    expect(r).toMatchObject({ kind: 'pick_housing', housings: ['FD-DR-01', 'FD-MR-01'] })
  })
  it('Silverado mid-generation split by year', () => {
    const base = { make: 'chevrolet', model: 'silverado-1500', factory: 'yes' as const }
    expect(resolveFitment(fixture, { ...base, year: 2020 })).toMatchObject({ housing: 'GM-MR-01' })
    expect(resolveFitment(fixture, { ...base, year: 2023 })).toMatchObject({
      housing: 'GM-MR-02',
      confidence: 'likely',
    })
  })
  it('Accord 11th gen → universal path', () => {
    expect(resolveFitment(fixture, { year: 2024, make: 'honda', model: 'accord' })).toMatchObject({
      kind: 'universal',
      reason: 'no_factory_lights',
    })
  })
  it('Tesla Model Y resolves with no questions (factory lights on all trims)', () => {
    expect(resolveFitment(fixture, { year: 2023, make: 'tesla', model: 'model-y' })).toMatchObject({
      kind: 'resolved',
      housing: 'TS-DR-01',
      confidence: 'verified',
    })
  })
})

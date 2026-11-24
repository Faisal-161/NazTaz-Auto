import { describe, expect, it } from 'vitest'
import {
  mapVpicResponse,
  parseFitParams,
  toFitParams,
  updateSelection,
  validateVin,
} from '@/lib/fitment'

describe('URL state', () => {
  it('round-trips a full selection with a stable key order', () => {
    const sel = {
      factory: 'yes' as const,
      year: 2022,
      make: 'ford',
      model: 'f-150',
      generation: '14th-gen',
      trim: 'xlt',
      housing: 'FD-DR-01',
    }
    const qs = toFitParams(sel)
    expect(qs).toBe(
      'factory=yes&year=2022&make=ford&model=f-150&gen=14th-gen&trim=xlt&housing=FD-DR-01',
    )
    expect(parseFitParams(new URLSearchParams(qs))).toEqual(sel)
  })
  it('accepts Next searchParams objects (arrays take the first value)', () => {
    expect(parseFitParams({ year: ['2021', '2020'], make: 'tesla', model: undefined })).toEqual({
      year: 2021,
      make: 'tesla',
    })
  })
  it('drops invalid or out-of-order values instead of throwing', () => {
    expect(
      parseFitParams(
        new URLSearchParams(
          'factory=maybe&year=1800&make=Ford!&model=f-150&gen=x&housing=<script>',
        ),
      ),
    ).toEqual({})
    // model without make is ignored
    expect(parseFitParams(new URLSearchParams('model=f-150&year=2022'))).toEqual({ year: 2022 })
    expect(parseFitParams(new URLSearchParams('year=20.5'))).toEqual({})
  })
  it('upper-cases housing codes', () => {
    expect(
      parseFitParams(new URLSearchParams('year=2022&make=ford&model=f-150&housing=fd-dr-01')),
    ).toMatchObject({ housing: 'FD-DR-01' })
  })
})

describe('updateSelection', () => {
  const full = {
    factory: 'yes' as const,
    year: 2022,
    make: 'ford',
    model: 'f-150',
    generation: '14th-gen',
    trim: 'xlt',
    housing: 'FD-DR-01',
  }
  it('changing the year clears everything after it', () => {
    expect(updateSelection(full, { year: 2019 })).toEqual({ factory: 'yes', year: 2019 })
  })
  it('changing the model keeps year + make', () => {
    expect(updateSelection(full, { model: 'mustang' })).toEqual({
      factory: 'yes',
      year: 2022,
      make: 'ford',
      model: 'mustang',
    })
  })
  it('changing the factory answer only clears the housing', () => {
    const { housing: _h, ...rest } = full
    void _h
    expect(updateSelection(full, { factory: 'no' })).toEqual({ ...rest, factory: 'no' })
  })
  it('setting the same value is a no-op; patches can set several fields at once', () => {
    expect(updateSelection(full, { year: 2022 })).toEqual(full)
    expect(updateSelection({}, { year: 2021, make: 'tesla', model: 'model-3' })).toEqual({
      year: 2021,
      make: 'tesla',
      model: 'model-3',
    })
  })
  it('clearing a field with undefined removes it and its downstream steps', () => {
    expect(updateSelection(full, { make: undefined })).toEqual({ factory: 'yes', year: 2022 })
  })
})

describe('VIN', () => {
  it('accepts a valid VIN (check digit) and normalizes input', () => {
    expect(validateVin('1hgcm82633a004352')).toEqual({ ok: true, vin: '1HGCM82633A004352' })
    expect(validateVin('1HG CM826 33A-004352')).toMatchObject({ ok: true })
    expect(validateVin('11111111111111111')).toMatchObject({ ok: true })
  })
  it('rejects bad length, illegal letters and wrong check digits', () => {
    expect(validateVin('1HGCM82633A00435')).toEqual({ ok: false, error: 'length' })
    expect(validateVin('1HGCM82633A00435O')).toEqual({ ok: false, error: 'characters' })
    expect(validateVin('1HGCM82643A004352')).toEqual({ ok: false, error: 'check_digit' })
  })
  it('maps a vPIC response and title-cases the make', () => {
    const json = { Results: [{ ModelYear: '2022', Make: 'FORD', Model: 'F-150', Trim: 'XLT' }] }
    expect(mapVpicResponse(json)).toEqual({ year: 2022, make: 'Ford', model: 'F-150', trim: 'XLT' })
    expect(
      mapVpicResponse({
        Results: [{ ModelYear: '2023', Make: 'MERCEDES-BENZ', Model: 'C-Class' }],
      }),
    ).toEqual({ year: 2023, make: 'Mercedes-Benz', model: 'C-Class' })
    expect(
      mapVpicResponse({
        Results: [{ ModelYear: '2020', Make: 'BMW', Model: '5 Series', Series: '530i' }],
      }),
    ).toEqual({ year: 2020, make: 'BMW', model: '5 Series' }) // Series is not a trim
  })
  it('returns null for failed or malformed decodes', () => {
    expect(mapVpicResponse(null)).toBeNull()
    expect(mapVpicResponse({ Results: [] })).toBeNull()
    expect(mapVpicResponse({ Results: [{ ModelYear: '', Make: '', Model: '' }] })).toBeNull()
    expect(mapVpicResponse('nope')).toBeNull()
  })
})

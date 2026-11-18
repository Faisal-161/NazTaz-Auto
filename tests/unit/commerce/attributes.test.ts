import { describe, expect, it } from 'vitest'
import { ATTR, attributesForVehicle, getAttr, setAttrs, vehicleLabel } from '@/lib/commerce/attributes'

describe('cart attributes', () => {
  it('uses the Shopify-compatible underscore keys', () => {
    expect([ATTR.vehicle, ATTR.housingCode, ATTR.fitMethod, ATTR.designId, ATTR.designPreview]).toEqual([
      '_vehicle',
      '_housing_code',
      '_fit_method',
      '_design_id',
      '_design_preview',
    ])
  })
  it('sets, overrides and drops empty values', () => {
    const a = setAttrs([{ key: '_design_id', value: 'old' }], { _design_id: 'new', _vehicle: '' })
    expect(a).toEqual([{ key: '_design_id', value: 'new' }])
    expect(getAttr(a, ATTR.designId)).toBe('new')
  })
  it('builds vehicle attributes', () => {
    const v = { id: 'v', year: 2022, make: 'Ford', model: 'F-150', trim: 'XLT', housing_code: 'FD-DR-01', fit_method: 'picker' as const }
    expect(vehicleLabel(v)).toBe('2022 Ford F-150 XLT')
    expect(attributesForVehicle(v)).toEqual([
      { key: '_vehicle', value: '2022 Ford F-150 XLT' },
      { key: '_housing_code', value: 'FD-DR-01' },
      { key: '_fit_method', value: 'picker' },
    ])
  })
})

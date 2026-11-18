import { describe, expect, it } from 'vitest'
import { cn, formatMoney } from '@/lib/utils'

describe('cn', () => {
  it('merges conflicting tailwind classes, last wins', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })
  it('drops falsy values', () => {
    expect(cn('a', false, undefined, null, 'b')).toBe('a b')
  })
})

describe('formatMoney', () => {
  it('drops cents on whole amounts', () => {
    expect(formatMoney({ amount: '49.00', currencyCode: 'USD' })).toBe('$49')
  })
  it('keeps two decimals otherwise', () => {
    expect(formatMoney({ amount: '49.5', currencyCode: 'USD' })).toBe('$49.50')
  })
  it('formats thousands', () => {
    expect(formatMoney({ amount: '1250', currencyCode: 'USD' })).toBe('$1,250')
  })
  it('throws on a non-numeric or empty amount', () => {
    expect(() => formatMoney({ amount: 'abc', currencyCode: 'USD' })).toThrow()
    expect(() => formatMoney({ amount: '', currencyCode: 'USD' })).toThrow()
  })
})

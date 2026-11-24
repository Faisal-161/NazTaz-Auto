import type { Money } from '@/lib/commerce/types'

/* Separate module so client code can format prices without pulling in tailwind-merge (lib/utils). */
const formatters = new Map<string, Intl.NumberFormat>()

/** Format a Shopify-style MoneyV2. Whole-dollar amounts drop the cents ("$49", "$49.50"). */
export function formatMoney(money: Money, locale = 'en-US'): string {
  const value = Number(money.amount)
  if (money.amount.trim() === '' || !Number.isFinite(value)) {
    throw new Error(`Invalid money amount: "${money.amount}"`)
  }
  const whole = Number.isInteger(value)
  const key = `${locale}|${money.currencyCode}|${whole}`
  let fmt = formatters.get(key)
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: money.currencyCode,
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: 2,
    })
    formatters.set(key, fmt)
  }
  return fmt.format(value)
}

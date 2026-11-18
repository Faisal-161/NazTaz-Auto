import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'
import type { Money } from '@/lib/commerce/types'

// Teach tailwind-merge our custom token scales so e.g. `text-sm text-muted` are not merged away.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'] }],
      shadow: [{ shadow: ['glow-sm', 'glow-md', 'glow-lg'] }],
    },
  },
})

/** Compose Tailwind classes; later classes win over conflicting earlier ones. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export type { Money }

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

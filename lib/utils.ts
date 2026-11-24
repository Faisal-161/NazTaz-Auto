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
export { formatMoney } from './money'

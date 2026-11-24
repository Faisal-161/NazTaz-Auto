import type { Housing } from '@/lib/commerce/types'

/** Part numbers are typed many ways: "ab-12 345", "AB12345". Compare on letters/digits only. */
export function normalizePartNumber(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export const MIN_PART_QUERY = 4

export type PartMatch = { housing: Housing; partNumber: string; exact: boolean }

/**
 * Find housings by OEM part number. Exact matches first (any length ≥ 2), then prefix matches (≥ 4 chars typed).
 * Returns at most one match per housing.
 */
export function findByPartNumber(
  housings: readonly Housing[],
  query: string,
  limit = 5,
): PartMatch[] {
  const q = normalizePartNumber(query)
  if (q.length < 2) return []
  const allowPrefix = q.length >= MIN_PART_QUERY
  const exact: PartMatch[] = []
  const prefix: PartMatch[] = []
  for (const housing of housings) {
    let best: PartMatch | null = null
    for (const pn of housing.oem_part_numbers) {
      const n = normalizePartNumber(pn)
      if (n === q) {
        best = { housing, partNumber: pn, exact: true }
        break
      }
      if (!best && allowPrefix && n.startsWith(q)) best = { housing, partNumber: pn, exact: false }
    }
    if (best) (best.exact ? exact : prefix).push(best)
  }
  return [...exact, ...prefix].slice(0, limit)
}

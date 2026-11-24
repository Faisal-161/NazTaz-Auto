import type { Fitment } from '@/lib/commerce/types'
import { slugify } from './slug'

/**
 * Match a decoded vehicle (VIN, free text) to our fitment table. External sources name models
 * differently ("Silverado" vs our "Silverado 1500", "F150" vs "F-150"), so after an exact slug
 * match we accept a unique prefix match within the same make and year.
 */
export function matchVehicle(
  rows: readonly Fitment[],
  input: { year: number; make: string; model: string },
): { make: string; model: string } | null {
  const make = slugify(input.make)
  const model = slugify(input.model)
  const compact = (s: string) => s.replace(/-/g, '')
  const candidates = rows.filter(
    (r) => slugify(r.make) === make && input.year >= r.year_start && input.year <= r.year_end,
  )
  const models = [...new Set(candidates.map((r) => slugify(r.model)))]
  if (models.length === 0) return null

  const exact = models.find((m) => m === model || compact(m) === compact(model))
  if (exact) return { make, model: exact }

  const prefix = models.filter(
    (m) => compact(m).startsWith(compact(model)) || compact(model).startsWith(compact(m)),
  )
  return prefix.length === 1 ? { make, model: prefix[0]! } : null
}

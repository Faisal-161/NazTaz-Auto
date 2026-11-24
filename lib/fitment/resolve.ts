import type { FitConfidence, Fitment } from '@/lib/commerce/types'
import { rowsFor } from './options'
import { sameSlug } from './slug'
import type { FitResolution, FitSelection } from './types'

const RANK: Record<FitConfidence, number> = { verified: 2, likely: 1, unverified: 0 }

/** Lowest confidence wins: a housing is only as certain as its weakest supporting row. */
export function weakestConfidence(values: readonly FitConfidence[]): FitConfidence {
  if (values.length === 0) return 'unverified'
  return values.reduce<FitConfidence>((min, c) => (RANK[c] < RANK[min] ? c : min), 'verified')
}

/** Union of housing codes in row order (stable for the picker). */
export function housingsOf(rows: readonly Fitment[]): string[] {
  return [...new Set(rows.flatMap((r) => r.housings))]
}

/**
 * Trims semantics (docs/data-models.md): an empty `trims` list means the row applies to all trims;
 * otherwise it applies only to the listed trims. This holds for 'yes' and 'some' rows alike.
 */
const appliesToTrim = (r: Fitment, trim: string) =>
  r.trims.length === 0 || r.trims.some((t) => sameSlug(t, trim))

/** Lights are certain on a row when it says 'yes' for all trims, or the trim is explicitly listed. */
const lightsCertain = (r: Fitment, trim: string | undefined) =>
  (r.has_factory_lights === 'yes' && r.trims.length === 0) ||
  (trim !== undefined && r.trims.some((t) => sameSlug(t, trim)))

/**
 * Resolve a finder selection into the next step. Pure: same rows + selection → same result.
 *
 * Handles:
 * - "No factory lights" answered up front → universal (F3 step 1), before any vehicle questions
 * - generation overlap (a year in two generations) → ask generation
 * - mid-generation housing changes (same generation, split by year) → the year picks the row;
 *   if a year sits in both halves, the housings are unioned → visual picker
 * - door vs mirror (several housings on one row) → visual picker
 * - trims: rows listing trims only apply to those trims; if lights depend on an unknown trim,
 *   ask the shopper
 */
export function resolveFitment(all: readonly Fitment[], sel: FitSelection): FitResolution {
  if (sel.factory === 'no') {
    const rows =
      sel.year !== undefined && sel.make && sel.model
        ? rowsFor(all, sel.year, sel.make, sel.model)
        : []
    return { kind: 'universal', reason: 'shopper_said_no', rows }
  }
  if (sel.year === undefined) return { kind: 'incomplete', missing: 'year' }
  if (!sel.make) return { kind: 'incomplete', missing: 'make' }
  if (!sel.model) return { kind: 'incomplete', missing: 'model' }

  let rows = rowsFor(all, sel.year, sel.make, sel.model)
  if (rows.length === 0) return { kind: 'no_match' }

  const generations = [...new Set(rows.map((r) => r.generation))]
  if (sel.generation) {
    const picked = rows.filter((r) => sameSlug(r.generation, sel.generation!))
    if (picked.length === 0) return { kind: 'needs_generation', generations }
    rows = picked
  } else if (generations.length > 1) {
    return { kind: 'needs_generation', generations }
  }

  if (rows.every((r) => r.has_factory_lights === 'no')) {
    return { kind: 'universal', reason: 'no_factory_lights', rows }
  }

  // Rows that could have factory lights at all.
  let lit = rows.filter((r) => r.has_factory_lights !== 'no')

  if (sel.trim) {
    const forTrim = lit.filter((r) => appliesToTrim(r, sel.trim!))
    if (forTrim.length === 0) {
      // Shopper insists they have lights on an unlisted trim: trust them, offer every housing.
      if (sel.factory !== 'yes') return { kind: 'universal', reason: 'trim_without_lights', rows }
    } else {
      lit = forTrim
    }
  }

  // If any candidate row's lights depend on something we don't know yet, ask before showing parts.
  const uncertain = lit.some((r) => !lightsCertain(r, sel.trim))
  if (uncertain && sel.factory !== 'yes') return { kind: 'ask_factory', rows: lit }

  const housings = housingsOf(lit)

  // Shopper already confirmed a housing (from the picker or URL): accept it if it's a candidate.
  if (sel.housing) {
    const code = housings.find((h) => sameSlug(h, sel.housing!))
    if (code) return resolved(code, lit)
  }

  if (housings.length === 1) return resolved(housings[0]!, lit)
  return { kind: 'pick_housing', housings, rows: lit }
}

function resolved(housing: string, rows: Fitment[]): FitResolution {
  const supporting = rows.filter((r) => r.housings.includes(housing))
  return {
    kind: 'resolved',
    housing,
    confidence: weakestConfidence(supporting.map((r) => r.confidence)),
    method: 'picker',
    rows: supporting,
  }
}

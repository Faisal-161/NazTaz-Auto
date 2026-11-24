import type { FactoryAnswer, FitSelection } from './types'

/**
 * Finder state lives in the URL: /fitment?factory=yes&year=2022&make=ford&model=f-150&gen=14th-gen
 * &trim=xlt&housing=FD-DR-01. Parsing is defensive: bad values are dropped, not thrown.
 */
type ParamSource = URLSearchParams | Record<string, string | string[] | undefined>

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const HOUSING = /^[A-Za-z0-9-]{2,32}$/
const FACTORY: readonly FactoryAnswer[] = ['yes', 'no', 'unsure']
export const MIN_YEAR = 1950
export const MAX_YEAR = 2035

function get(src: ParamSource, key: string): string | undefined {
  if (src instanceof URLSearchParams) return src.get(key) ?? undefined
  const v = src[key]
  return Array.isArray(v) ? v[0] : v
}

const slug = (v: string | undefined) => (v && v.length <= 60 && SLUG.test(v) ? v : undefined)

export function parseFitParams(src: ParamSource): FitSelection {
  const sel: FitSelection = {}
  const factory = get(src, 'factory')
  if (factory && (FACTORY as readonly string[]).includes(factory))
    sel.factory = factory as FactoryAnswer
  const rawYear = get(src, 'year')
  // Strict 4 digits: no "0x7E6", "2.022e3" or " 2022" aliases of the same URL.
  const year = rawYear && /^[0-9]{4}$/.test(rawYear) ? Number(rawYear) : NaN
  if (year >= MIN_YEAR && year <= MAX_YEAR) sel.year = year
  const make = slug(get(src, 'make'))
  if (make) sel.make = make
  // Later steps only count when the earlier ones are present (no orphan "model" without "make").
  const model = make ? slug(get(src, 'model')) : undefined
  if (model) sel.model = model
  const gen = model ? slug(get(src, 'gen')) : undefined
  if (gen) sel.generation = gen
  const trim = model ? slug(get(src, 'trim')) : undefined
  if (trim) sel.trim = trim
  const housing = model ? get(src, 'housing') : undefined
  if (housing && HOUSING.test(housing)) sel.housing = housing.toUpperCase()
  return sel
}

/** Stable key order so identical selections produce identical URLs (cache-friendly). */
export function toFitParams(sel: FitSelection): string {
  const p = new URLSearchParams()
  if (sel.factory) p.set('factory', sel.factory)
  if (sel.year !== undefined) p.set('year', String(sel.year))
  if (sel.make) p.set('make', sel.make)
  if (sel.model) p.set('model', sel.model)
  if (sel.generation) p.set('gen', sel.generation)
  if (sel.trim) p.set('trim', sel.trim)
  if (sel.housing) p.set('housing', sel.housing)
  return p.toString()
}

const ORDER = ['factory', 'year', 'make', 'model', 'generation', 'trim', 'housing'] as const

/**
 * Apply `patch` and clear every step downstream of a field that changed (a new year may not have
 * the same model; a new model has different generations, trims and housings). Changing the factory
 * answer only clears the housing.
 */
export function updateSelection(sel: FitSelection, patch: Partial<FitSelection>): FitSelection {
  const next: FitSelection = { ...sel, ...patch }
  for (const key of ORDER) {
    if (!(key in patch) || patch[key] === sel[key]) continue
    const downstream =
      key === 'factory' ? (['housing'] as const) : ORDER.slice(ORDER.indexOf(key) + 1)
    for (const d of downstream) if (!(d in patch)) delete next[d]
  }
  for (const key of ORDER) if (next[key] === undefined) delete next[key]
  return next
}

import type { Fitment } from '@/lib/commerce/types'
import { sameSlug, slugify } from './slug'

/** A select option: `value` is the slug stored in the URL, `label` is the display text. */
export type Option = { value: string; label: string }

const covers = (row: Fitment, year: number) => year >= row.year_start && year <= row.year_end

function uniqueOptions(labels: string[]): Option[] {
  const seen = new Map<string, string>()
  for (const label of labels) {
    const value = slugify(label)
    if (!seen.has(value)) seen.set(value, label)
  }
  return [...seen]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

/** Every model year covered by any row, newest first. */
export function yearOptions(rows: readonly Fitment[]): number[] {
  const years = new Set<number>()
  for (const r of rows) for (let y = r.year_start; y <= r.year_end; y++) years.add(y)
  return [...years].sort((a, b) => b - a)
}

/** Makes with at least one row covering `year`, A→Z. */
export function makeOptions(rows: readonly Fitment[], year: number): Option[] {
  return uniqueOptions(rows.filter((r) => covers(r, year)).map((r) => r.make))
}

/** Models of `make` covering `year`, A→Z. `make` may be a slug or display name. */
export function modelOptions(rows: readonly Fitment[], year: number, make: string): Option[] {
  return uniqueOptions(
    rows.filter((r) => covers(r, year) && sameSlug(r.make, make)).map((r) => r.model),
  )
}

/** Rows for a year/make/model (slugs or names). Several rows = generation overlap or a mid-generation split. */
export function rowsFor(
  rows: readonly Fitment[],
  year: number,
  make: string,
  model: string,
): Fitment[] {
  return rows.filter((r) => covers(r, year) && sameSlug(r.make, make) && sameSlug(r.model, model))
}

/** Generations covering the year (usually one). */
export function generationOptions(
  rows: readonly Fitment[],
  year: number,
  make: string,
  model: string,
): Option[] {
  return uniqueOptions(rowsFor(rows, year, make, model).map((r) => r.generation))
}

/** Trims listed for the matching rows (empty = trims don't matter). */
export function trimOptions(
  rows: readonly Fitment[],
  year: number,
  make: string,
  model: string,
): Option[] {
  return uniqueOptions(rowsFor(rows, year, make, model).flatMap((r) => r.trims))
}

/** Display names for slugs, using the rows as the dictionary. Falls back to the slug. */
export function labelFor(
  rows: readonly Fitment[],
  field: 'make' | 'model' | 'generation',
  slug: string,
): string {
  return rows.find((r) => sameSlug(r[field], slug))?.[field] ?? slug
}

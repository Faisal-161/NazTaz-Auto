import type { FitConfidence, Fitment, GarageVehicle, Product } from '@/lib/commerce/types'
import { housingsOf, resolveFitment } from './resolve'
import { sameSlug } from './slug'
import type { FitBadge, FitResolution, FitSelection, ProductFit } from './types'

/** verified → Verified, likely → Likely, unverified → Check fit. */
export function badgeFor(confidence: FitConfidence): FitBadge {
  return confidence === 'verified' ? 'verified' : confidence === 'likely' ? 'likely' : 'check'
}

/** Methods where the housing was confirmed outside the fitment table (no row needed). */
const EXTERNAL_METHODS = new Set(['part_number', 'vin', 'photo_review'])

/** Garage vehicle → finder selection, so badges use exactly the same rules as the finder. */
export function selectionForVehicle(v: GarageVehicle): FitSelection {
  const sel: FitSelection = { year: v.year, make: v.make, model: v.model }
  if (v.generation) sel.generation = v.generation
  if (v.trim) sel.trim = v.trim
  if (v.fit_method === 'universal') sel.factory = 'no'
  // A housing chosen in the picker implies the shopper has factory lights.
  else if (v.housing_code) sel.factory = 'yes'
  if (v.housing_code) sel.housing = v.housing_code
  return sel
}

/** What the fitment table says about a garage vehicle. */
export function resolveVehicle(rows: readonly Fitment[], v: GarageVehicle): FitResolution {
  return resolveFitment(rows, selectionForVehicle(v))
}

/**
 * Housings that could fit a garage vehicle, by the same rules as the finder. A stale saved housing
 * (no longer supported by the rows, e.g. the year changed) is ignored here.
 */
export function candidateHousings(rows: readonly Fitment[], v: GarageVehicle): string[] {
  const r = resolveVehicle(rows, v)
  if (r.kind === 'resolved') return [r.housing]
  if (r.kind === 'pick_housing') return r.housings
  if (r.kind === 'ask_factory') return housingsOf(r.rows)
  return []
}

/**
 * How a product relates to the active garage vehicle. Built on resolveFitment so a badge can never
 * disagree with the finder.
 * - universal / service products → universal
 * - no vehicle, or vehicle not in our table → unknown (don't hide anything)
 * - shopper said "no factory lights" (or trim has none) → vehicle products don't fit
 * - housing confirmed by part number / VIN / photo → only that housing fits
 *   (photo review stays "Check fit" until our team confirms it)
 * - otherwise: resolved housing gets its row confidence; any housing still being decided
 *   (picker, factory question) shows "Check fit"
 */
export function productFit(
  product: Product,
  vehicle: GarageVehicle | null,
  rows: readonly Fitment[],
): ProductFit {
  if (product.productType !== 'vehicle' || !product.housing_code) return { status: 'universal' }
  if (!vehicle) return { status: 'unknown' }
  const code = product.housing_code
  if (vehicle.fit_method === 'universal') return { status: 'no_fit' }

  if (vehicle.housing_code && vehicle.fit_method && EXTERNAL_METHODS.has(vehicle.fit_method)) {
    if (!sameSlug(vehicle.housing_code, code)) return { status: 'no_fit' }
    if (vehicle.fit_method === 'photo_review') return { status: 'fits', badge: 'check' }
    const r = resolveVehicle(rows, vehicle)
    return {
      status: 'fits',
      badge: r.kind === 'resolved' && sameSlug(r.housing, code) ? badgeFor(r.confidence) : 'check',
    }
  }

  const r = resolveVehicle(rows, vehicle)
  switch (r.kind) {
    case 'resolved':
      return sameSlug(r.housing, code)
        ? { status: 'fits', badge: badgeFor(r.confidence) }
        : { status: 'no_fit' }
    case 'pick_housing':
      return r.housings.some((h) => sameSlug(h, code))
        ? { status: 'fits', badge: 'check' }
        : { status: 'no_fit' }
    case 'ask_factory':
      return housingsOf(r.rows).some((h) => sameSlug(h, code))
        ? { status: 'fits', badge: 'check' }
        : { status: 'no_fit' }
    case 'universal':
      return { status: 'no_fit' }
    case 'needs_generation':
    case 'no_match':
    case 'incomplete':
      return { status: 'unknown' }
  }
}

/**
 * Filter + order a product list for the active vehicle: fitting products first (verified before
 * likely before check), then universal, then unknown; non-fitting vehicle products are dropped.
 * Without a vehicle the list is returned unchanged.
 */
export function productsForVehicle(
  products: readonly Product[],
  vehicle: GarageVehicle | null,
  rows: readonly Fitment[],
): { product: Product; fit: ProductFit }[] {
  const withFit = products.map((product) => ({ product, fit: productFit(product, vehicle, rows) }))
  if (!vehicle) return withFit
  const order = (f: ProductFit) =>
    f.status === 'fits'
      ? { verified: 0, likely: 1, check: 2 }[f.badge]
      : f.status === 'universal'
        ? 3
        : 4
  return withFit
    .filter((x) => x.fit.status !== 'no_fit')
    .sort((a, b) => order(a.fit) - order(b.fit))
}

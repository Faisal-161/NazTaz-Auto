/**
 * Fitment domain logic. Pure functions only (no React, DOM or network): the finder UI, garage,
 * badges and shop filtering all call these. See docs/features.md F3.
 */
export * from './types'
export { slugify, sameSlug } from './slug'
export {
  yearOptions,
  makeOptions,
  modelOptions,
  generationOptions,
  trimOptions,
  rowsFor,
  labelFor,
  type Option,
} from './options'
export { resolveFitment, housingsOf, weakestConfidence } from './resolve'
export {
  badgeFor,
  productFit,
  candidateHousings,
  productsForVehicle,
  selectionForVehicle,
  resolveVehicle,
} from './match'
export {
  findByPartNumber,
  normalizePartNumber,
  MIN_PART_QUERY,
  type PartMatch,
} from './part-number'
export { validateVin, normalizeVin, mapVpicResponse, type DecodedVin, type VinCheck } from './vin'
export { parseFitParams, toFitParams, updateSelection, MIN_YEAR, MAX_YEAR } from './url'

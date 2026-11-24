/**
 * Pure VIN helpers. The network call to NHTSA vPIC lives in the finder's server action (1B);
 * this file validates input and maps the response so both are unit-testable.
 * vPIC: https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/{vin}?format=json (free, no key)
 */

const TRANSLIT: Record<string, number> = {
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  E: 5,
  F: 6,
  G: 7,
  H: 8,
  J: 1,
  K: 2,
  L: 3,
  M: 4,
  N: 5,
  P: 7,
  R: 9,
  S: 2,
  T: 3,
  U: 4,
  V: 5,
  W: 6,
  X: 7,
  Y: 8,
  Z: 9,
}
const WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2]

export function normalizeVin(input: string): string {
  return input.toUpperCase().replace(/[\s-]/g, '')
}

export type VinCheck =
  { ok: true; vin: string } | { ok: false; error: 'length' | 'characters' | 'check_digit' }

/** 17 chars, no I/O/Q, valid North American check digit (position 9). */
export function validateVin(input: string): VinCheck {
  const vin = normalizeVin(input)
  if (vin.length !== 17) return { ok: false, error: 'length' }
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(vin)) return { ok: false, error: 'characters' }
  let sum = 0
  for (let i = 0; i < 17; i++) {
    const ch = vin[i]!
    const value = /\d/.test(ch) ? Number(ch) : TRANSLIT[ch]!
    sum += value * WEIGHTS[i]!
  }
  const rem = sum % 11
  const expected = rem === 10 ? 'X' : String(rem)
  return vin[8] === expected ? { ok: true, vin } : { ok: false, error: 'check_digit' }
}

export type DecodedVin = { year: number; make: string; model: string; trim?: string }

/**
 * Map a vPIC DecodeVinValues response to year/make/model. Returns null when the decode failed or
 * lacks the basics. Input is untrusted JSON, so every field is checked.
 */
export function mapVpicResponse(json: unknown): DecodedVin | null {
  if (!json || typeof json !== 'object') return null
  const results = (json as { Results?: unknown }).Results
  if (!Array.isArray(results) || !results[0] || typeof results[0] !== 'object') return null
  const r = results[0] as Record<string, unknown>
  const str = (k: string) => (typeof r[k] === 'string' ? (r[k] as string).trim() : '')
  const year = Number(str('ModelYear'))
  const make = titleCase(str('Make'))
  const model = str('Model')
  if (!Number.isInteger(year) || year < 1950 || !make || !model) return null
  // Trim only: vPIC 'Series' is often a body/series code, not a trim name.
  const trim = str('Trim')
  return trim ? { year, make, model, trim } : { year, make, model }
}

/** Makes that are written in capitals (everything else is title-cased: FORD → Ford). */
const CAPS_MAKES = new Set(['BMW', 'GMC', 'RAM', 'MINI', 'FIAT'])

/** vPIC returns makes upper-case ("FORD", "MERCEDES-BENZ"). */
function titleCase(s: string): string {
  if (CAPS_MAKES.has(s.toUpperCase())) return s.toUpperCase()
  return s
    .toLowerCase()
    .replace(/(^|[-\s])([a-z])/g, (_, sep: string, c: string) => sep + c.toUpperCase())
}

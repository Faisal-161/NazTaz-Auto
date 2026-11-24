'use server'

import { getFitments } from '@/lib/commerce/queries'
import { matchVehicle, validateVin, type DecodedVin } from '@/lib/fitment'
import { decodeVin } from '@/lib/services/vpic'

export type VinLookup =
  | {
      ok: true
      vehicle: DecodedVin
      /** Our make/model slugs when the vehicle is in the fitment table. */
      match: { year: number; make: string; model: string } | null
    }
  | { ok: false; error: 'length' | 'characters' | 'check_digit' | 'lookup' | 'network' }

/** Validate locally first (no wasted API call), then decode with NHTSA vPIC and match our table. */
export async function lookupVin(input: string): Promise<VinLookup> {
  if (typeof input !== 'string' || input.length > 40) return { ok: false, error: 'length' }
  const check = validateVin(input)
  if (!check.ok) return { ok: false, error: check.error }
  const decoded = await decodeVin(check.vin)
  if (!decoded.ok) return { ok: false, error: decoded.error }
  const rows = await getFitments()
  const m = matchVehicle(rows, decoded.vehicle)
  return {
    ok: true,
    vehicle: decoded.vehicle,
    match: m ? { year: decoded.vehicle.year, ...m } : null,
  }
}

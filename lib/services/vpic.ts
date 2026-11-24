import { cacheLife, cacheTag } from 'next/cache'
import { mapVpicResponse, type DecodedVin } from '@/lib/fitment/vin'

/**
 * NHTSA vPIC VIN decoder (free, no API key). Server-only: called from the fitment server action.
 * https://vpic.nhtsa.dot.gov/api/
 */
const ENDPOINT = 'https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues'

export type VpicResult =
  { ok: true; vehicle: DecodedVin } | { ok: false; error: 'lookup' | 'network' }

class VpicNetworkError extends Error {}

/**
 * Cached for days: a VIN always decodes to the same vehicle. Network failures THROW so they are
 * never cached; a definitive "could not decode" (null) is cached.
 */
async function fetchDecoded(vin: string): Promise<DecodedVin | null> {
  'use cache'
  cacheLife('days')
  cacheTag('vpic')
  let res: Response
  try {
    res = await fetch(`${ENDPOINT}/${encodeURIComponent(vin)}?format=json`, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    })
  } catch {
    throw new VpicNetworkError('vPIC unreachable')
  }
  if (!res.ok) throw new VpicNetworkError(`vPIC HTTP ${res.status}`)
  return mapVpicResponse(await res.json())
}

export async function decodeVin(vin: string): Promise<VpicResult> {
  try {
    const vehicle = await fetchDecoded(vin)
    return vehicle ? { ok: true, vehicle } : { ok: false, error: 'lookup' }
  } catch {
    return { ok: false, error: 'network' }
  }
}

import type { Attribute, GarageVehicle } from './types'

/**
 * Cart line attribute keys. Leading underscore = hidden from the customer in Shopify checkout.
 * These exact keys are sent to the Shopify Cart API in Phase 2 — never inline the strings.
 */
export const ATTR = {
  vehicle: '_vehicle',
  housingCode: '_housing_code',
  fitMethod: '_fit_method',
  designId: '_design_id',
  designPreview: '_design_preview',
  gift: '_gift',
  giftMessage: '_gift_message',
  giftSendDate: '_gift_send_date',
} as const

export type AttrKey = (typeof ATTR)[keyof typeof ATTR]

export function getAttr(attributes: Attribute[], key: AttrKey): string | undefined {
  return attributes.find((a) => a.key === key)?.value
}

/** Merge attributes; later values win, empty values are dropped. */
export function setAttrs(
  attributes: Attribute[],
  updates: Partial<Record<AttrKey, string | undefined>>,
): Attribute[] {
  const map = new Map(attributes.map((a) => [a.key, a.value]))
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || value === '') map.delete(key)
    else map.set(key, value)
  }
  return [...map].map(([key, value]) => ({ key, value }))
}

export function vehicleLabel(v: Pick<GarageVehicle, 'year' | 'make' | 'model' | 'trim'>): string {
  return [v.year, v.make, v.model, v.trim].filter(Boolean).join(' ')
}

export function attributesForVehicle(v: GarageVehicle): Attribute[] {
  return setAttrs([], {
    [ATTR.vehicle]: vehicleLabel(v),
    [ATTR.housingCode]: v.housing_code,
    [ATTR.fitMethod]: v.fit_method,
  })
}

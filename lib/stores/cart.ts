'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Attribute, Image, Money } from '@/lib/commerce/types'

/**
 * Client cart for instant UI. Line shape mirrors Shopify CartLine (merchandiseId + attributes).
 * Phase 1B: mutations also call the adapter cart via Server Actions; Phase 2: Shopify Cart API,
 * and checkout redirects to cart.checkoutUrl.
 */
export type ClientCartLine = {
  id: string
  merchandiseId: string
  productHandle: string
  title: string
  variantTitle: string
  unitPrice: Money
  quantity: number
  image: Image
  attributes: Attribute[]
}

export type NewCartLine = Omit<ClientCartLine, 'id'>

type CartState = {
  lines: ClientCartLine[]
  /** Drawer visibility is UI state: not persisted. */
  isOpen: boolean
  add: (line: NewCartLine) => void
  setQuantity: (id: string, quantity: number) => void
  remove: (id: string) => void
  clear: () => void
  open: () => void
  close: () => void
  setOpen: (open: boolean) => void
}

const MAX_QTY = 20

/** Same merchandise + same attributes = same line (like Shopify's line merge). */
function sameLine(
  a: Pick<ClientCartLine, 'merchandiseId' | 'attributes'>,
  b: Pick<ClientCartLine, 'merchandiseId' | 'attributes'>,
) {
  if (a.merchandiseId !== b.merchandiseId || a.attributes.length !== b.attributes.length)
    return false
  const key = (attrs: Attribute[]) =>
    JSON.stringify([...attrs].sort((x, y) => x.key.localeCompare(y.key)))
  return key(a.attributes) === key(b.attributes)
}

let lineSeq = 0
const newId = () => `line_${Date.now().toString(36)}_${(lineSeq++).toString(36)}`

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      add: (line) =>
        set((s) => {
          const existing = s.lines.find((l) => sameLine(l, line))
          if (existing) {
            return {
              lines: s.lines.map((l) =>
                l === existing
                  ? { ...l, quantity: Math.min(MAX_QTY, l.quantity + line.quantity) }
                  : l,
              ),
            }
          }
          return {
            lines: [
              ...s.lines,
              { ...line, id: newId(), quantity: Math.min(MAX_QTY, line.quantity) },
            ],
          }
        }),
      setQuantity: (id, quantity) =>
        set((s) => ({
          lines:
            quantity <= 0
              ? s.lines.filter((l) => l.id !== id)
              : s.lines.map((l) =>
                  l.id === id ? { ...l, quantity: Math.min(MAX_QTY, quantity) } : l,
                ),
        })),
      remove: (id) => set((s) => ({ lines: s.lines.filter((l) => l.id !== id) })),
      clear: () => set({ lines: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      setOpen: (isOpen) => set({ isOpen }),
    }),
    {
      name: 'store.cart.v1',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines }),
      // localStorage is untrusted: drop malformed lines instead of crashing the drawer.
      merge: (persisted, current) => ({
        ...current,
        lines: sanitizeLines((persisted as { lines?: unknown } | null)?.lines),
      }),
    },
  ),
)

function isMoney(v: unknown): v is Money {
  return (
    !!v &&
    typeof v === 'object' &&
    typeof (v as Money).amount === 'string' &&
    Number.isFinite(Number((v as Money).amount))
  )
}

function isLine(v: unknown): v is ClientCartLine {
  if (!v || typeof v !== 'object') return false
  const l = v as Partial<ClientCartLine>
  return (
    typeof l.id === 'string' &&
    typeof l.merchandiseId === 'string' &&
    typeof l.productHandle === 'string' &&
    typeof l.title === 'string' &&
    typeof l.variantTitle === 'string' &&
    isMoney(l.unitPrice) &&
    Number.isInteger(l.quantity) &&
    (l.quantity ?? 0) > 0 &&
    !!l.image &&
    typeof l.image.url === 'string' &&
    Array.isArray(l.attributes) &&
    l.attributes.every((a) => !!a && typeof a.key === 'string' && typeof a.value === 'string')
  )
}

export function sanitizeLines(v: unknown): ClientCartLine[] {
  return Array.isArray(v)
    ? v.filter(isLine).map((l) => ({ ...l, quantity: Math.min(MAX_QTY, l.quantity) }))
    : []
}

export function cartCount(lines: ClientCartLine[]): number {
  return lines.reduce((n, l) => n + l.quantity, 0)
}

export function cartSubtotal(lines: ClientCartLine[]): Money {
  const cents = lines.reduce(
    (sum, l) => sum + Math.round(Number(l.unitPrice.amount) * 100) * l.quantity,
    0,
  )
  return {
    amount: (cents / 100).toFixed(2),
    currencyCode: lines[0]?.unitPrice.currencyCode ?? 'USD',
  }
}

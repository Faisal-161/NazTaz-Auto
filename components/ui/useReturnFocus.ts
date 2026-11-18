'use client'

import { useRef } from 'react'

/**
 * Radix returns focus to a <Dialog.Trigger>. Our overlays open from stores (no Trigger), so
 * remember what was focused when the overlay opened and restore it on close (WCAG 2.4.3).
 */
export function useReturnFocus() {
  const opener = useRef<HTMLElement | null>(null)
  return {
    onOpenAutoFocus: () => {
      const el = document.activeElement
      opener.current = el instanceof HTMLElement && el !== document.body ? el : null
    },
    onCloseAutoFocus: (e: Event) => {
      const el = opener.current
      if (el && el.isConnected) {
        e.preventDefault()
        el.focus()
      }
    },
  }
}

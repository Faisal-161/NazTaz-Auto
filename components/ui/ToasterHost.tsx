'use client'

import dynamic from 'next/dynamic'
import { useToastStore } from '@/lib/stores/toast'
import { useOpenedOnce } from './LazyMount'

// Radix Toast (~20KB gz) loads only when the first toast is pushed: not in first-load JS.
const Toaster = dynamic(() => import('./Toaster').then((m) => m.Toaster))

export function ToasterHost({ closeLabel }: { closeLabel: string }) {
  const hasToasts = useToastStore((s) => s.toasts.length > 0)
  const mounted = useOpenedOnce(hasToasts)
  return mounted ? <Toaster closeLabel={closeLabel} /> : null
}

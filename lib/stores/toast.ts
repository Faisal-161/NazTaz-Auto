'use client'

import { create } from 'zustand'

export type ToastTone = 'info' | 'success' | 'error'
export type ToastItem = {
  id: number
  title: string
  description?: string
  tone: ToastTone
  action?: { label: string; altText: string; onClick: () => void }
}

type ToastState = {
  toasts: ToastItem[]
  push: (t: Omit<ToastItem, 'id' | 'tone'> & { tone?: ToastTone }) => void
  dismiss: (id: number) => void
}

let seq = 0

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  push: (t) => set((s) => ({ toasts: [...s.toasts.slice(-2), { tone: 'info', ...t, id: ++seq }] })),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

/** Imperative helper for event handlers: toast({ title: 'Added to cart' }). */
export const toast = (t: Parameters<ToastState['push']>[0]) => useToastStore.getState().push(t)

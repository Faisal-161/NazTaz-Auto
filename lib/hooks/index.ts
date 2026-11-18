'use client'

import { useSyncExternalStore } from 'react'

const noopSubscribe = () => () => {}

/** True only after hydration. Use to avoid rendering localStorage-dependent values on the server. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )
}

function mediaQuery(query: string) {
  return {
    subscribe(cb: () => void) {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', cb)
      return () => mql.removeEventListener('change', cb)
    },
    get: () => window.matchMedia(query).matches,
  }
}

export function useMediaQuery(query: string, serverDefault = false): boolean {
  const mq = mediaQuery(query)
  return useSyncExternalStore(mq.subscribe, mq.get, () => serverDefault)
}

/** JS animations must check this and jump to their end state when true. Server default: reduce. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)', true)
}

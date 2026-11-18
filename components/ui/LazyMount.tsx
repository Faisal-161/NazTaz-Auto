'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Mounts children only once they come near the viewport, so their JS chunk (via next/dynamic)
 * is not part of the first load. `placeholder` must match the final size to avoid CLS.
 */
export function LoadOnView({
  children,
  placeholder,
  rootMargin = '300px',
}: {
  children: ReactNode
  placeholder: ReactNode
  rootMargin?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || visible) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true)
          io.disconnect()
        }
      },
      { rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [visible, rootMargin])
  return <div ref={ref}>{visible ? children : placeholder}</div>
}

/** Keeps something mounted after it has been opened once (preserves close animations). */
export function useOpenedOnce(open: boolean): boolean {
  const [opened, setOpened] = useState(open)
  if (open && !opened) setOpened(true)
  return opened
}

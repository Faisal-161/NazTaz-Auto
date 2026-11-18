'use client'

import { CarFront } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { mobileMenu } from '@/content/layout'
import { vehicleLabel } from '@/lib/commerce/attributes'
import { useHydrated } from '@/lib/hooks'
import { selectActiveVehicle, useGarageStore } from '@/lib/stores/garage'

/** Routes with their own sticky bottom bar or where the CTA would be redundant. */
const HIDDEN_ON = ['/fitment', '/checkout', '/cart', '/studio']

/**
 * Mobile-only sticky "Find my fit". Always rendered with a fixed height so it never shifts
 * layout; the body reserves space for it (pb-20 on <body> below lg).
 */
export function StickyFitCta() {
  const pathname = usePathname()
  const hydrated = useHydrated()
  const active = useGarageStore(selectActiveVehicle)
  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null

  const label = hydrated && active ? vehicleLabel(active) : mobileMenu.findFit
  const href = hydrated && active ? '/shop' : '/fitment'

  return (
    <div className="fixed inset-x-0 bottom-0 z-sticky border-t border-line bg-bg/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
      <Link
        href={href}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent text-sm font-semibold text-accent-fg shadow-glow-sm"
      >
        <CarFront aria-hidden className="size-5" />
        <span className="truncate">{label}</span>
      </Link>
    </div>
  )
}

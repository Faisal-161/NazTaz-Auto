'use client'

import { CarFront, Menu, Search, ShoppingBag } from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { header } from '@/content/layout'
import { vehicleLabel } from '@/lib/commerce/attributes'
import { useHydrated } from '@/lib/hooks'
import { cartCount, useCartStore } from '@/lib/stores/cart'
import { selectActiveVehicle, useGarageStore } from '@/lib/stores/garage'
import { useUiStore } from '@/lib/stores/ui'
import { cx as cn } from '@/lib/cx'
import { useOpenedOnce } from '@/components/ui/LazyMount'

// Overlays load their code the first time they open — not in first-load JS.
const CartDrawer = dynamic(() => import('./CartDrawer').then((m) => m.CartDrawer))
const MobileMenu = dynamic(() => import('./MobileMenu').then((m) => m.MobileMenu))
const SearchDialog = dynamic(() => import('./SearchDialog').then((m) => m.SearchDialog))

const iconBtn =
  'relative inline-flex size-11 items-center justify-center rounded-full text-muted transition-colors duration-fast hover:bg-surface-2 hover:text-fg'

export function HeaderActions({ accountSlot }: { accountSlot: ReactNode }) {
  const hydrated = useHydrated()
  const count = useCartStore((s) => cartCount(s.lines))
  const cartOpen = useCartStore((s) => s.isOpen)
  const openCart = useCartStore((s) => s.open)
  const active = useGarageStore(selectActiveVehicle)
  const { menuOpen, searchOpen, setMenuOpen, setSearchOpen } = useUiStore()

  const cartMounted = useOpenedOnce(cartOpen)
  const menuMounted = useOpenedOnce(menuOpen)
  const searchMounted = useOpenedOnce(searchOpen)

  const shownCount = hydrated ? count : 0

  return (
    <>
      <button type="button" aria-label={header.searchLabel} className={iconBtn} onClick={() => setSearchOpen(true)}>
        <Search aria-hidden className="size-5" />
      </button>

      {/* My Garage chip: fixed min-width so hydration doesn't shift the header */}
      <Link
        href="/fitment"
        className={cn(
          'hidden h-10 min-w-36 items-center gap-2 rounded-full border px-3.5 text-sm transition-colors duration-fast md:inline-flex',
          hydrated && active
            ? 'border-accent/50 bg-accent-soft text-fg'
            : 'border-line text-muted hover:border-accent/50 hover:text-fg',
        )}
      >
        <CarFront aria-hidden className={cn('size-4', hydrated && active ? 'text-accent' : '')} />
        <span className="max-w-44 truncate">
          {hydrated && active ? (
            <>
              <span className="sr-only">{header.garage.activePrefix}: </span>
              {vehicleLabel(active)}
            </>
          ) : (
            header.garage.empty
          )}
        </span>
      </Link>

      {accountSlot}

      <button type="button" aria-label={header.cartLabel(shownCount)} className={iconBtn} onClick={openCart}>
        <ShoppingBag aria-hidden className="size-5" />
        <span
          aria-hidden
          className={cn(
            'absolute top-1 right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[0.6875rem] font-semibold text-accent-fg tabular-nums transition-transform duration-base ease-light',
            shownCount > 0 ? 'scale-100' : 'scale-0',
          )}
        >
          {shownCount}
        </span>
      </button>

      <button
        type="button"
        aria-label={header.menuLabel}
        aria-haspopup="dialog"
        className={cn(iconBtn, 'lg:hidden')}
        onClick={() => setMenuOpen(true)}
      >
        <Menu aria-hidden className="size-5" />
      </button>

      {cartMounted ? <CartDrawer /> : null}
      {menuMounted ? <MobileMenu /> : null}
      {searchMounted ? <SearchDialog /> : null}
    </>
  )
}

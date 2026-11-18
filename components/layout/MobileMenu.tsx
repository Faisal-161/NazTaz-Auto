'use client'

import { CarFront, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Sheet, SheetContent } from '@/components/ui/Sheet'
import { header, mobileMenu as t } from '@/content/layout'
import { primaryNav, secondaryNav } from '@/content/navigation'
import { useUiStore } from '@/lib/stores/ui'

/** Bottom-sheet menu for small screens: thumb-reachable, Radix focus trap, Esc/close returns focus. */
export function MobileMenu() {
  const open = useUiStore((s) => s.menuOpen)
  const setOpen = useUiStore((s) => s.setMenuOpen)
  const close = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="bottom" title={t.title} closeLabel={t.close}>
        <nav aria-label={header.navLabel} className="overflow-y-auto overscroll-contain px-3 pb-4">
          <ul className="grid gap-0.5">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  className="flex min-h-14 items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-surface-2"
                >
                  <span>
                    <span className="block font-medium">{item.label}</span>
                    {item.description ? (
                      <span className="block text-xs text-subtle">{item.description}</span>
                    ) : null}
                  </span>
                  <ChevronRight aria-hidden className="size-4 text-subtle" />
                </Link>
              </li>
            ))}
          </ul>
          <ul className="mt-3 flex flex-wrap gap-2 border-t border-line px-3 pt-4">
            {[...secondaryNav, { label: header.accountLabel, href: '/account' }].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  className="inline-flex h-10 items-center rounded-full border border-line px-4 text-sm text-muted hover:text-fg"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-line p-4">
          <Button asChild size="lg" className="w-full" onClick={close}>
            <Link href="/fitment">
              <CarFront aria-hidden />
              {t.findFit}
            </Link>
          </Button>
          <p className="mt-2 text-center text-xs text-subtle">{t.findFitHint}</p>
        </div>
      </SheetContent>
    </Sheet>
  )
}

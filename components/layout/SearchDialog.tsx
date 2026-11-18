'use client'

import { Search } from 'lucide-react'
import Link from 'next/link'
import { Dialog, DialogContent } from '@/components/ui/Dialog'
import { search as t } from '@/content/search'
import { useUiStore } from '@/lib/stores/ui'

/**
 * Search shell. Phase 1D (F10) adds the lazily-loaded client index over products, vehicles and
 * designs, with arrow-key navigation of results.
 */
export function SearchDialog() {
  const open = useUiStore((s) => s.searchOpen)
  const setOpen = useUiStore((s) => s.setSearchOpen)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        title={t.title}
        closeLabel={t.close}
        className="top-24 translate-y-0 sm:top-28"
      >
        <form role="search" onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="site-search" className="sr-only">
            {t.label}
          </label>
          <div className="relative">
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-subtle"
            />
            <input
              id="site-search"
              type="search"
              autoComplete="off"
              placeholder={t.placeholder}
              className="h-12 w-full rounded-lg border border-line-strong bg-bg pr-4 pl-11 text-base placeholder:text-subtle focus-visible:border-accent focus-visible:shadow-glow-sm focus-visible:outline-none"
            />
          </div>
        </form>
        <div className="mt-5">
          <p className="text-sm font-medium">{t.empty.title}</p>
          <p className="text-sm text-muted">{t.empty.body}</p>
          <p className="mt-5 text-xs font-medium tracking-wide text-subtle uppercase">
            {t.shortcutsTitle}
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {t.shortcuts.map((s) => (
              <li key={s.href}>
                <Link
                  href={s.href}
                  onClick={() => setOpen(false)}
                  className="inline-flex h-9 items-center rounded-full border border-line px-3.5 text-sm text-muted hover:border-accent/50 hover:text-fg"
                >
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}

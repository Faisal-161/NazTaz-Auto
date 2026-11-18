import { User } from 'lucide-react'
import Link from 'next/link'
import { header } from '@/content/layout'
import { primaryNav } from '@/content/navigation'
import { site } from '@/content/site'
import { HeaderActions } from './HeaderActions'
import { Logo } from './Logo'

/** Server component: nav markup is in the static shell; interactive bits are small client leaves. */
export function Header() {
  return (
    <header className="sticky top-0 z-header border-b border-line/70 bg-bg/85 backdrop-blur-md supports-[backdrop-filter]:bg-bg/70">
      <div className="container-page flex h-16 items-center gap-3 lg:gap-6">
        <Link href="/" aria-label={`${site.name} ${header.homeLabel}`} className="flex shrink-0 items-center rounded-md">
          <Logo />
        </Link>

        <nav aria-label={header.navLabel} className="hidden flex-1 lg:block">
          <ul className="flex items-center gap-1">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex h-10 items-center rounded-full px-3.5 text-sm text-muted transition-colors duration-fast hover:bg-surface-2 hover:text-fg"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
          <HeaderActions
            accountSlot={
              <Link
                href="/account"
                aria-label={header.accountLabel}
                className="hidden size-11 items-center justify-center rounded-full text-muted transition-colors duration-fast hover:bg-surface-2 hover:text-fg sm:inline-flex"
              >
                <User aria-hidden className="size-5" />
              </Link>
            }
          />
        </div>
      </div>
    </header>
  )
}

import Link from 'next/link'
import { Skeleton } from '@/components/ui/Skeleton'
import { footer } from '@/content/layout'
import { footerNav } from '@/content/navigation'
import { site } from '@/content/site'
import { Logo } from './Logo'
import { NewsletterLazy } from './NewsletterLazy'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1.2fr_2fr] lg:gap-16">
        <section aria-labelledby="newsletter-title" className="max-w-md">
          <Logo />
          <h2 id="newsletter-title" className="mt-6 text-xl font-semibold">
            {footer.newsletter.title}
          </h2>
          <p className="mt-1 text-sm text-muted">{footer.newsletter.body}</p>
          <div className="mt-4">
            {/* form JS (react-hook-form + zod) loads when the footer scrolls into view */}
            <NewsletterLazy placeholder={<Skeleton className="h-[4.75rem] w-full" />} />
          </div>
        </section>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {footerNav.map((col) => (
            <div key={col.title}>
              <h2 className="text-sm font-semibold">{col.title}</h2>
              <ul className="mt-3 grid gap-1">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="inline-flex min-h-8 items-center text-sm text-muted hover:text-fg">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-subtle sm:flex-row sm:justify-between">
          <p>{footer.legal(site.copyrightYear, site.name)}</p>
          <p>{footer.trademarkNote}</p>
        </div>
      </div>
    </footer>
  )
}

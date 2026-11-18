import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button-variants'
import { Badge } from '@/components/ui/Badge'
import { placeholderCopy as t, placeholders, type RouteKey } from '@/content/placeholders'

/** Temporary shell for a route that is not built yet. Replace with the real page. */
export function RoutePlaceholder({ route }: { route: RouteKey }) {
  const p = placeholders[route]
  return (
    <section className="container-page flex flex-1 flex-col items-start justify-center gap-4 py-section">
      <Badge variant="accent">{t.badge}</Badge>
      <h1 className="text-4xl font-semibold">{p.title}</h1>
      <p className="max-w-md text-muted">{t.body(p.phase)}</p>
      <div className="mt-2 flex flex-wrap gap-3">
        {route !== 'fitment' ? (
          <Link href="/fitment" className={buttonVariants()}>
            {t.primary}
          </Link>
        ) : null}
        <Link href="/" className={buttonVariants({ variant: 'secondary' })}>
          {t.secondary}
        </Link>
      </div>
    </section>
  )
}

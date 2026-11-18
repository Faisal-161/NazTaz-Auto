import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { states } from '@/content/layout'
import { pageMetadata } from '@/lib/seo/metadata'

export const metadata = pageMetadata({ title: 'Page not found' })

export default function NotFound() {
  const t = states.notFound
  return (
    <section className="container-page flex flex-1 flex-col items-center justify-center gap-4 py-section text-center">
      <p className="font-display text-6xl font-semibold text-accent text-glow" aria-hidden>
        404
      </p>
      <h1 className="text-3xl font-semibold">{t.title}</h1>
      <p className="max-w-md text-muted">{t.body}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/fitment">{t.findFit}</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/">{t.home}</Link>
        </Button>
      </div>
    </section>
  )
}

import { ArrowRight, CarFront } from 'lucide-react'
import Link from 'next/link'
import { NightScene } from '@/components/sections/NightScene'
import { buttonVariants } from '@/components/ui/button-variants'
import { home } from '@/content/home'
import { pageMetadata } from '@/lib/seo/metadata'

export const metadata = pageMetadata()

/**
 * Home hero (Phase 1B adds the other homepage sections).
 * Mobile: the night scene is its own block on top, headline below.
 * Desktop: full-height split, headline left, scene bleeding off the right edge.
 * The h1 text is the LCP element (the scene is inline SVG, no image request).
 */
export default function HomePage() {
  const t = home.hero
  return (
    <section className="relative isolate overflow-hidden border-b border-line lg:flex lg:min-h-[calc(100dvh-7rem)] lg:items-center">
      {/* scene */}
      <div className="relative h-[19rem] sm:h-[24rem] lg:absolute lg:inset-y-0 lg:right-0 lg:left-[34%] lg:-z-10 lg:h-auto">
        <NightScene projection={t.projection} sub={t.projectionSub} />
        {/* fade into the page: down on mobile, left on desktop */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_top,var(--color-bg),transparent_45%)] lg:bg-[linear-gradient(to_right,var(--color-bg),transparent_40%)]"
        />
      </div>

      <div className="relative container-page grid gap-8 pb-10 sm:pb-14 lg:py-24">
        <div className="-mt-10 max-w-3xl sm:-mt-14 lg:mt-0">
          <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.2em] text-accent uppercase">
            <span aria-hidden className="h-px w-8 bg-accent" />
            {t.eyebrow}
          </p>
          <h1 className="mt-5 text-[clamp(3rem,1.4rem+5vw,6.25rem)]">
            {t.heading.map((line, i) => (
              <span
                key={line}
                className={i === t.glowLine ? 'block text-projection text-glow' : 'block'}
              >
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-6 max-w-lg text-lg text-muted">{t.intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/fitment" className={buttonVariants({ size: 'lg' })}>
              <CarFront aria-hidden />
              {t.primaryCta}
            </Link>
            <Link href="/studio" className={buttonVariants({ size: 'lg', variant: 'secondary' })}>
              {t.secondaryCta}
              <ArrowRight aria-hidden />
            </Link>
          </div>
        </div>

        <ul className="flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-5 text-sm text-muted lg:max-w-3xl">
          {t.facts.map((f, i) => (
            <li key={f} className="flex items-center gap-3">
              <span className="font-mono text-xs text-accent">0{i + 1}</span>
              {f}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

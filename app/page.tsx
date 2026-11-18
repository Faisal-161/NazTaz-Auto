import { CarFront, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { home } from '@/content/home'
import { pageMetadata } from '@/lib/seo/metadata'

export const metadata = pageMetadata()

/** Phase 1A placeholder. Homepage sections (HeroDoor, FitmentBar, ...) arrive in Phase 1B. */
export default function HomePage() {
  return (
    <section className="relative isolate flex flex-1 items-center overflow-hidden py-section">
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 mx-auto h-72 max-w-4xl rounded-[50%] bg-[radial-gradient(closest-side,var(--color-accent-soft),transparent)] blur-2xl"
      />
      <div className="container-page flex flex-col items-start gap-6">
        <p className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-xs text-muted">
          <Sparkles aria-hidden className="size-3.5 text-accent" />
          {home.eyebrow}
        </p>
        <h1 className="max-w-3xl text-5xl font-semibold">
          {home.headingLead} <span className="text-accent text-glow">{home.headingGlow}</span>
        </h1>
        <p className="max-w-xl text-lg text-muted">{home.intro}</p>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/fitment">
              <CarFront aria-hidden />
              {home.primaryCta}
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/studio">{home.secondaryCta}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

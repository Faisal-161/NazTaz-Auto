'use client'

import { ArrowRight, Check, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { ProductCard } from '@/components/product/ProductCard'
import { buttonVariants } from '@/components/ui/button-variants'
import { finder } from '@/content/fitment'
import type { Housing, Product } from '@/lib/commerce/types'
import type { FitBadge as FitBadgeKind } from '@/lib/fitment'
import { FitBadge } from './FitBadge'

const t = finder.result

type Props = {
  vehicleLabel: string | null
  housing: Housing | null
  badge: FitBadgeKind | null
  savedToGarage: boolean
  /** Vehicle-specific products for the housing (empty on the universal path). */
  fitting: Product[]
  universal: Product[]
  universalReason?: 'no_factory_lights' | 'trim_without_lights' | 'shopper_said_no'
  onRestart: () => void
}

export function ResultStep({
  vehicleLabel,
  housing,
  badge,
  savedToGarage,
  fitting,
  universal,
  universalReason,
  onRestart,
}: Props) {
  const isUniversal = !housing
  const primary = isUniversal ? universal : fitting
  const designHref = primary[0] ? `/studio?product=${primary[0].handle}` : '/studio'

  return (
    <div className="flex flex-col gap-8">
      {/* Confirmation plate: the projected pool of light is the visual, the facts sit on top. */}
      <div className="relative isolate overflow-hidden rounded-xl border border-line bg-surface p-5 sm:p-7">
        <span
          aria-hidden
          className="absolute -bottom-24 left-1/2 -z-10 h-48 w-[120%] -translate-x-1/2 animate-light-on rounded-[50%] bg-[radial-gradient(closest-side,var(--color-light-pool),transparent)]"
        />
        <p className="font-mono text-xs tracking-widest text-accent uppercase">{t.confirmed}</p>
        {isUniversal ? (
          <>
            <p className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {t.universalTitle}
            </p>
            <p className="mt-2 max-w-prose text-muted">
              {universalReason === 'trim_without_lights' ? t.universalTrimBody : t.universalBody}
            </p>
          </>
        ) : (
          <>
            {vehicleLabel ? (
              <p className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                {vehicleLabel}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <p className="text-sm text-muted">
                {t.housing}{' '}
                <span className="rounded-sm border border-line-strong px-1.5 py-0.5 font-mono text-fg">
                  {housing.code}
                </span>{' '}
                <span className="text-subtle">· {housing.name}</span>
              </p>
              {badge ? <FitBadge badge={badge} /> : null}
            </div>
          </>
        )}
        {savedToGarage ? (
          <p role="status" className="mt-5 flex items-start gap-2 text-sm">
            <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-success" />
            <span>
              <span className="font-medium">{t.savedToGarage}.</span>{' '}
              <span className="text-muted">{t.savedHint}</span>
            </span>
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href={designHref} className={buttonVariants({ size: 'lg' })}>
            {t.designCta}
            <ArrowRight aria-hidden />
          </Link>
          <button
            type="button"
            onClick={onRestart}
            className={buttonVariants({ variant: 'ghost', size: 'lg' })}
          >
            <RotateCcw aria-hidden />
            {t.restart}
          </button>
        </div>
      </div>

      <section aria-labelledby="fit-products-title">
        <div className="flex items-end justify-between gap-4">
          <h3 id="fit-products-title" className="text-lg font-semibold tracking-tight">
            {isUniversal ? t.universalTitle : t.productsTitle}
          </h3>
          <Link
            href="/shop"
            className="text-sm text-muted underline-offset-4 hover:text-fg hover:underline"
          >
            {t.shopCta}
          </Link>
        </div>
        {!isUniversal && primary.length === 0 ? (
          <p className="mt-3 text-sm text-muted">{t.productsEmpty}</p>
        ) : null}
        {/* One grid: lights for this housing first (with fit badge), then universal options. */}
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {primary.map((p) => (
            <li key={p.id}>
              <ProductCard
                headingLevel="h4"
                product={p}
                badge={!isUniversal && badge ? <FitBadge badge={badge} /> : null}
              />
            </li>
          ))}
          {!isUniversal
            ? universal.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} headingLevel="h4" />
                </li>
              ))
            : null}
        </ul>
      </section>
    </div>
  )
}

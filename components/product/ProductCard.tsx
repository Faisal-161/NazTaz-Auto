import Link from 'next/link'
import type { ReactNode } from 'react'
import { PlaceholderMedia } from '@/components/ui/PlaceholderMedia'
import { finder } from '@/content/fitment'
import type { Product } from '@/lib/commerce/types'
import { cn, formatMoney } from '@/lib/utils'

type Props = {
  product: Product
  /** Fit badge (or anything) shown over the image. */
  badge?: ReactNode
  className?: string
  /** next/image sizes for the grid this card sits in. */
  sizes?: string
  /** Heading level for the title, to fit the page outline (default h3). */
  headingLevel?: 'h2' | 'h3' | 'h4'
}

/**
 * Product tile: image, title, "From" price, lead time. The whole card is one link (one tab stop);
 * the title is the accessible name. Works in server and client trees.
 */
export function ProductCard({
  product,
  badge,
  className,
  sizes = '(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 92vw',
  headingLevel: Heading = 'h3',
}: Props) {
  const t = finder.result
  const min = product.priceRange.minVariantPrice
  const max = product.priceRange.maxVariantPrice
  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-lg border border-line bg-surface transition-colors duration-base hover:border-line-strong',
        className,
      )}
    >
      <div className="relative">
        <PlaceholderMedia image={product.featuredImage} sizes={sizes} className="aspect-[4/3]" />
        {badge ? <div className="absolute top-3 left-3">{badge}</div> : null}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <Heading className="text-base leading-snug font-semibold text-pretty">
          <Link
            href={`/products/${product.handle}`}
            className="group-has-[a:focus-visible]:ring-0 after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {product.title}
          </Link>
        </Heading>
        <p className="text-sm text-muted">
          <span className="text-subtle">{t.from} </span>
          <span className="font-medium text-fg tabular-nums">{formatMoney(min)}</span>
          {max.amount !== min.amount ? (
            <span className="text-subtle tabular-nums"> – {formatMoney(max)}</span>
          ) : null}
        </p>
        <p className="mt-auto pt-2 text-xs text-subtle">
          {t.shipsAfterProof(product.lead_time_days)}
        </p>
      </div>
      {/* Focus ring for the whole card (the link's ::after covers it). */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-lg ring-focus group-has-[a:focus-visible]:ring-2"
      />
    </article>
  )
}

import NextImage from 'next/image'
import { states } from '@/content/layout'
import type { Image } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

type Props = {
  image: Image
  /** Required: next/image sizes for responsive loading. */
  sizes: string
  /** Only the page's LCP image. */
  priority?: boolean
  className?: string
  imgClassName?: string
}

/**
 * Renders a commerce image. Placeholder images (image.placeholder) get a visible label so they
 * can never be mistaken for real product photos.
 */
export function PlaceholderMedia({ image, sizes, priority, className, imgClassName }: Props) {
  return (
    <div
      className={cn('relative overflow-hidden bg-surface-2', className)}
      style={{ aspectRatio: `${image.width} / ${image.height}` }}
    >
      <NextImage
        src={image.url}
        alt={image.altText}
        fill
        sizes={sizes}
        priority={priority}
        className={cn('object-cover', imgClassName)}
      />
      {image.placeholder ? (
        <span className="absolute right-2 bottom-2 rounded-sm bg-bg/80 px-1.5 py-0.5 text-[0.6875rem] font-medium tracking-wide text-muted uppercase">
          {states.placeholder}
        </span>
      ) : null}
    </div>
  )
}

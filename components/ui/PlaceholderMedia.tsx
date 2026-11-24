import NextImage from 'next/image'
import { states } from '@/content/layout'
import { cx } from '@/lib/cx'
import type { Image } from '@/lib/commerce/types'

type Props = {
  image: Image
  /** Required: next/image sizes for responsive loading. */
  sizes: string
  /** Only the page's LCP image (Next 16: `preload` replaces deprecated `priority`). */
  preload?: boolean
  /** Pass the aspect ratio here (e.g. "aspect-[4/3]"); defaults to the image's own ratio. */
  className?: string
  imgClassName?: string
  /** Render as <span> inside buttons/links (a <div> is invalid inside <button>). */
  as?: 'div' | 'span'
}

/**
 * Renders a commerce image. Placeholder images (image.placeholder) get a visible label so they
 * can never be mistaken for real product photos. Uses cx (no tailwind-merge) because it ships in
 * client bundles; pass non-conflicting classes.
 */
export function PlaceholderMedia({
  image,
  sizes,
  preload,
  className,
  imgClassName,
  as: Tag = 'div',
}: Props) {
  const hasAspect = className?.includes('aspect-')
  return (
    <Tag
      className={cx('relative block overflow-hidden bg-surface-2', className)}
      style={hasAspect ? undefined : { aspectRatio: `${image.width} / ${image.height}` }}
    >
      <NextImage
        src={image.url}
        alt={image.altText}
        fill
        sizes={sizes}
        preload={preload}
        className={cx('object-cover', imgClassName)}
      />
      {image.placeholder ? (
        <span className="absolute right-2 bottom-2 rounded-sm bg-bg/80 px-1.5 py-0.5 text-[0.6875rem] font-medium tracking-wide text-muted uppercase">
          {states.placeholder}
        </span>
      ) : null}
    </Tag>
  )
}

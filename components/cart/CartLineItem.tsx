'use client'

import { Minus, Pencil, Plus, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { cartDrawer as t } from '@/content/layout'
import { ATTR, getAttr } from '@/lib/commerce/attributes'
import type { ClientCartLine } from '@/lib/stores/cart'
import { formatMoney } from '@/lib/money'

type Props = {
  line: ClientCartLine
  onQuantity: (quantity: number) => void
  onRemove: () => void
  onNavigate?: () => void
}

/** One cart line: design thumbnail, vehicle + housing, edit-design link, quantity, remove. */
export function CartLineItem({ line, onQuantity, onRemove, onNavigate }: Props) {
  const vehicle = getAttr(line.attributes, ATTR.vehicle)
  const housing = getAttr(line.attributes, ATTR.housingCode)
  const designId = getAttr(line.attributes, ATTR.designId)
  const preview = getAttr(line.attributes, ATTR.designPreview)
  const thumb = preview ?? line.image.url
  const lineTotal = {
    amount: (Number(line.unitPrice.amount) * line.quantity).toFixed(2),
    currencyCode: line.unitPrice.currencyCode,
  }

  return (
    <li className="flex gap-4 py-4">
      <div className="relative size-20 shrink-0 overflow-hidden rounded-md border border-line bg-bg">
        <Image src={thumb} alt="" fill sizes="80px" className="object-cover" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/products/${line.productHandle}`}
            onClick={onNavigate}
            className="line-clamp-2 text-sm font-medium hover:text-accent"
          >
            {line.title}
          </Link>
          <p className="shrink-0 text-sm font-medium tabular-nums">{formatMoney(lineTotal)}</p>
        </div>
        <p className="text-xs text-subtle">{line.variantTitle}</p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-2 text-xs text-muted">
          {vehicle ? (
            <>
              <dt className="text-subtle">{t.vehicle}</dt>
              <dd className="truncate">{vehicle}</dd>
            </>
          ) : null}
          {housing ? (
            <>
              <dt className="text-subtle">{t.housing}</dt>
              <dd className="font-mono">{housing}</dd>
            </>
          ) : null}
        </dl>
        <div className="mt-1 flex items-center justify-between gap-2">
          <div
            className="flex items-center rounded-full border border-line"
            role="group"
            aria-label={`${t.quantity}: ${line.title}`}
          >
            <button
              type="button"
              aria-label={t.decrease(line.title)}
              onClick={() => onQuantity(line.quantity - 1)}
              className="inline-flex size-9 items-center justify-center rounded-full text-muted hover:text-fg"
            >
              <Minus aria-hidden className="size-4" />
            </button>
            <output aria-live="polite" className="min-w-6 text-center text-sm tabular-nums">
              {line.quantity}
            </output>
            <button
              type="button"
              aria-label={t.increase(line.title)}
              onClick={() => onQuantity(line.quantity + 1)}
              className="inline-flex size-9 items-center justify-center rounded-full text-muted hover:text-fg"
            >
              <Plus aria-hidden className="size-4" />
            </button>
          </div>
          <div className="flex items-center gap-1">
            {designId ? (
              <Link
                href={`/studio?line=${encodeURIComponent(line.id)}`}
                onClick={onNavigate}
                className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium whitespace-nowrap text-accent hover:bg-accent-soft"
              >
                <Pencil aria-hidden className="size-3.5" />
                {t.editDesign}
              </Link>
            ) : null}
            <button
              type="button"
              aria-label={t.remove(line.title)}
              onClick={onRemove}
              className="inline-flex size-9 items-center justify-center rounded-full text-subtle hover:bg-surface-2 hover:text-danger"
            >
              <Trash2 aria-hidden className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </li>
  )
}

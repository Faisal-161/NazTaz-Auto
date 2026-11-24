'use client'

import { Check } from 'lucide-react'
import { PlaceholderMedia } from '@/components/ui/PlaceholderMedia'
import { finder } from '@/content/fitment'
import type { Housing } from '@/lib/commerce/types'
import { cn } from '@/lib/utils'

const t = finder.housing

/**
 * Visual housing picker: each option shows the housing AND its connector, side by side, because
 * the connector is what people can actually compare under the car. Native radios (arrow keys).
 */
export function HousingStep({
  housings,
  value,
  onChange,
}: {
  housings: Housing[]
  value: string | undefined
  onChange: (code: string) => void
}) {
  return (
    <fieldset>
      <legend className="text-base text-fg">{t.question}</legend>
      <p className="mt-1 text-sm text-subtle">{t.help}</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {housings.map((h) => {
          const checked = value === h.code
          return (
            <label
              key={h.code}
              className={cn(
                'group relative flex cursor-pointer flex-col overflow-hidden rounded-lg border bg-surface transition-[border-color] duration-base',
                'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus',
                checked ? 'border-accent' : 'border-line hover:border-line-strong',
              )}
            >
              <input
                type="radio"
                name="housing"
                value={h.code}
                checked={checked}
                onChange={() => onChange(h.code)}
                className="sr-only"
                aria-label={t.select(h.name)}
              />
              <div className="grid grid-cols-2 gap-px bg-line">
                <figure className="relative bg-surface">
                  <PlaceholderMedia
                    image={h.photo_housing}
                    sizes="(min-width: 768px) 16rem, 46vw"
                    className="aspect-[4/3]"
                  />
                  <figcaption className="absolute top-2 left-2 rounded-sm bg-bg/80 px-1.5 py-0.5 text-[0.6875rem] font-medium tracking-wide text-muted uppercase">
                    {t.housingPhoto}
                  </figcaption>
                </figure>
                <figure className="relative bg-surface">
                  <PlaceholderMedia
                    image={h.photo_connector}
                    sizes="(min-width: 768px) 16rem, 46vw"
                    className="aspect-[4/3]"
                  />
                  <figcaption className="absolute top-2 left-2 rounded-sm bg-bg/80 px-1.5 py-0.5 text-[0.6875rem] font-medium tracking-wide text-muted uppercase">
                    {t.connectorPhoto}
                  </figcaption>
                </figure>
              </div>
              <div className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-medium">{h.name}</p>
                  <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs text-muted">
                    <dt className="text-subtle">{t.code}</dt>
                    <dd className="font-mono text-fg">{h.code}</dd>
                    <dt className="text-subtle">{t.location[h.location]}</dt>
                    <dd>{h.connector}</dd>
                    {h.oem_part_numbers.length ? (
                      <>
                        <dt className="text-subtle">{t.partNumbers}</dt>
                        <dd className="truncate font-mono">{h.oem_part_numbers.join(', ')}</dd>
                      </>
                    ) : null}
                  </dl>
                </div>
                <span
                  aria-hidden
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-full border transition-colors duration-base',
                    checked
                      ? 'border-accent bg-accent text-accent-fg'
                      : 'border-line-strong text-transparent',
                  )}
                >
                  <Check className="size-4" />
                </span>
              </div>
              {/* the "light turns on" under the chosen housing */}
              {checked ? (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-6 -bottom-10 h-20 animate-light-on rounded-[50%] bg-[radial-gradient(closest-side,var(--color-light-pool),transparent)]"
                />
              ) : null}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

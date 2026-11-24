'use client'

import { Check } from 'lucide-react'
import { PlaceholderMedia } from '@/components/ui/PlaceholderMedia'
import { finder } from '@/content/fitment'
import { cx } from '@/lib/cx'
import type { Housing } from '@/lib/commerce/types'

const t = finder.housing
const tag =
  'absolute top-2 left-2 rounded-sm bg-bg/80 px-1.5 py-0.5 text-[0.6875rem] font-medium tracking-wide text-muted uppercase'

/**
 * Visual housing picker: each option shows the housing AND its connector side by side, because
 * the connector is what people can compare under the car. One tap confirms, so each card is a
 * button (name = housing name, description = code / location / part numbers). Buttons, not radios:
 * with radios the arrow keys would select AND advance the step (WCAG 3.2.2).
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
    <div role="group" aria-labelledby="housing-question" aria-describedby="housing-help">
      <p id="housing-question" className="text-base text-fg">
        {t.question}
      </p>
      <p id="housing-help" className="mt-1 text-sm text-subtle">
        {t.help}
      </p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {housings.map((h) => {
          const pressed = value === h.code
          const nameId = `housing-${h.code}-name`
          const descId = `housing-${h.code}-desc`
          return (
            <button
              key={h.code}
              type="button"
              aria-pressed={pressed}
              aria-labelledby={nameId}
              aria-describedby={descId}
              onClick={() => onChange(h.code)}
              className={cx(
                'group relative flex flex-col overflow-hidden rounded-lg border bg-surface text-left transition-[border-color] duration-base',
                pressed ? 'border-accent' : 'border-line hover:border-line-strong',
              )}
            >
              <span className="grid w-full grid-cols-2 gap-px bg-line">
                <span className="relative bg-surface">
                  <PlaceholderMedia
                    as="span"
                    image={h.photo_housing}
                    sizes="(min-width: 768px) 16rem, 46vw"
                    className="aspect-[4/3]"
                  />
                  <span className={tag}>{t.housingPhoto}</span>
                </span>
                <span className="relative bg-surface">
                  <PlaceholderMedia
                    as="span"
                    image={h.photo_connector}
                    sizes="(min-width: 768px) 16rem, 46vw"
                    className="aspect-[4/3]"
                  />
                  <span className={tag}>{t.connectorPhoto}</span>
                </span>
              </span>
              <span className="flex w-full items-start justify-between gap-3 p-4">
                <span className="min-w-0">
                  <span id={nameId} className="block font-medium">
                    {h.name}
                  </span>
                  {/* spans (not dl) are valid inside <button>; read as the description */}
                  <span
                    id={descId}
                    className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs text-muted"
                  >
                    <span className="text-subtle">{t.code}</span>
                    <span className="font-mono text-fg">{h.code}</span>
                    <span className="text-subtle">{t.location[h.location]}</span>
                    <span>{h.connector}</span>
                    {h.oem_part_numbers.length ? (
                      <>
                        <span className="text-subtle">{t.partNumbers}</span>
                        <span className="truncate font-mono">{h.oem_part_numbers.join(', ')}</span>
                      </>
                    ) : null}
                  </span>
                </span>
                <span
                  aria-hidden
                  className={cx(
                    'flex size-7 shrink-0 items-center justify-center rounded-full border transition-colors duration-base',
                    pressed
                      ? 'border-accent bg-accent text-accent-fg'
                      : 'border-line-strong text-transparent',
                  )}
                >
                  <Check className="size-4" />
                </span>
              </span>
              {/* the "light turns on" under the chosen housing */}
              {pressed ? (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-6 -bottom-10 h-20 animate-light-on rounded-[50%] bg-[radial-gradient(closest-side,var(--color-light-pool),transparent)]"
                />
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}

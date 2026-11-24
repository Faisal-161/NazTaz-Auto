'use client'

import { CircleHelp, Lightbulb, LightbulbOff } from 'lucide-react'
import { finder } from '@/content/fitment'
import { cx } from '@/lib/cx'
import type { FactoryAnswer } from '@/lib/fitment'

const t = finder.factory
const choices: { value: FactoryAnswer; Icon: typeof Lightbulb }[] = [
  { value: 'yes', Icon: Lightbulb },
  { value: 'no', Icon: LightbulbOff },
  { value: 'unsure', Icon: CircleHelp },
]

/**
 * One tap answers and moves on, so these are buttons (aria-pressed), not radios: with radios the
 * arrow keys would select AND advance (WCAG 3.2.2). Tab moves between options; Enter/Space picks.
 */
export function FactoryStep({
  value,
  onChange,
}: {
  value: FactoryAnswer | undefined
  onChange: (v: FactoryAnswer) => void
}) {
  return (
    <div role="group" aria-labelledby="factory-question" aria-describedby="factory-help">
      <p id="factory-question" className="text-base text-fg">
        {t.question}
      </p>
      <p id="factory-help" className="mt-1 text-sm text-subtle">
        {t.help}
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {choices.map(({ value: v, Icon }) => {
          const o = t.options[v]
          const pressed = value === v
          return (
            <button
              key={v}
              type="button"
              aria-pressed={pressed}
              onClick={() => onChange(v)}
              className={cx(
                'group flex flex-col items-start gap-3 rounded-lg border bg-surface p-4 text-left transition-[border-color,background-color] duration-base',
                pressed ? 'border-accent bg-accent-soft' : 'border-line hover:border-line-strong',
              )}
            >
              <Icon
                aria-hidden
                className={cx('size-5', pressed ? 'text-accent' : 'text-muted group-hover:text-fg')}
              />
              <span>
                <span className="block font-medium">{o.label}</span>
                <span className="mt-0.5 block text-sm text-subtle">{o.hint}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

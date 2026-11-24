'use client'

import { CircleHelp, Lightbulb, LightbulbOff } from 'lucide-react'
import { finder } from '@/content/fitment'
import type { FactoryAnswer } from '@/lib/fitment'
import { cn } from '@/lib/utils'

const t = finder.factory
const choices: { value: FactoryAnswer; Icon: typeof Lightbulb }[] = [
  { value: 'yes', Icon: Lightbulb },
  { value: 'no', Icon: LightbulbOff },
  { value: 'unsure', Icon: CircleHelp },
]

/** Native radio group styled as cards: arrow keys move between options, Space/Enter selects. */
export function FactoryStep({
  value,
  onChange,
}: {
  value: FactoryAnswer | undefined
  onChange: (v: FactoryAnswer) => void
}) {
  return (
    <fieldset>
      <legend className="text-base text-fg">{t.question}</legend>
      <p className="mt-1 text-sm text-subtle">{t.help}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {choices.map(({ value: v, Icon }) => {
          const o = t.options[v]
          const checked = value === v
          return (
            <label
              key={v}
              className={cn(
                'group relative flex cursor-pointer flex-col gap-3 rounded-lg border bg-surface p-4 transition-[border-color,background-color] duration-base',
                'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus',
                checked ? 'border-accent bg-accent-soft' : 'border-line hover:border-line-strong',
              )}
            >
              <input
                type="radio"
                name="factory"
                value={v}
                checked={checked}
                onChange={() => onChange(v)}
                className="sr-only"
              />
              <Icon
                aria-hidden
                className={cn('size-5', checked ? 'text-accent' : 'text-muted group-hover:text-fg')}
              />
              <span>
                <span className="block font-medium">{o.label}</span>
                <span className="mt-0.5 block text-sm text-subtle">{o.hint}</span>
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

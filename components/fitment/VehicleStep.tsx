'use client'

import { ChevronDown, CircleHelp } from 'lucide-react'
import { useId } from 'react'
import { finder } from '@/content/fitment'
import type { Fitment } from '@/lib/commerce/types'
import {
  generationOptions,
  makeOptions,
  modelOptions,
  trimOptions,
  yearOptions,
  type FitResolution,
  type FitSelection,
  type Option,
} from '@/lib/fitment'
import { cx } from '@/lib/cx'

const t = finder.vehicle
export const TRIM_OTHER = 'other'

type Props = {
  rows: readonly Fitment[]
  sel: FitSelection
  resolution: FitResolution
  onPatch: (patch: Partial<FitSelection>) => void
}

/**
 * Year → Make → Model with native selects (best on phones: OS picker, full keyboard support).
 * Generation and trim appear only when the data needs them.
 */
export function VehicleStep({ rows, sel, resolution, onPatch }: Props) {
  const years = yearOptions(rows)
  const makes = sel.year !== undefined ? makeOptions(rows, sel.year) : []
  const models = sel.year !== undefined && sel.make ? modelOptions(rows, sel.year, sel.make) : []
  const ready = sel.year !== undefined && sel.make && sel.model
  const gens = ready ? generationOptions(rows, sel.year!, sel.make!, sel.model!) : []
  const trims = ready ? trimOptions(rows, sel.year!, sel.make!, sel.model!) : []

  const showGen = resolution.kind === 'needs_generation' || (sel.generation && gens.length > 1)
  const showTrim = trims.length > 0 && (resolution.kind === 'ask_factory' || sel.trim !== undefined)
  const askFactory = resolution.kind === 'ask_factory'

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Select
          label={t.year}
          value={sel.year !== undefined ? String(sel.year) : ''}
          options={years.map((y) => ({ value: String(y), label: String(y) }))}
          onChange={(v) => onPatch({ year: v ? Number(v) : undefined })}
        />
        <Select
          label={t.make}
          value={sel.make ?? ''}
          options={makes}
          disabled={sel.year === undefined}
          onChange={(v) => onPatch({ make: v || undefined })}
        />
        <Select
          label={t.model}
          value={sel.model ?? ''}
          options={models}
          disabled={!sel.make}
          onChange={(v) => onPatch({ model: v || undefined })}
        />
      </div>

      {showGen ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <Select
            label={t.generation}
            value={sel.generation ?? ''}
            options={gens}
            hint={t.generationHelp}
            className="sm:col-span-2"
            onChange={(v) => onPatch({ generation: v || undefined })}
          />
        </div>
      ) : null}

      {showTrim ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <Select
            label={t.trim}
            value={sel.trim ?? ''}
            options={[...trims, { value: TRIM_OTHER, label: t.trimOther }]}
            hint={t.trimHelp}
            className="sm:col-span-2"
            onChange={(v) => onPatch({ trim: v || undefined })}
          />
        </div>
      ) : null}

      {askFactory ? (
        <div className="rounded-lg border border-line bg-surface p-4 sm:p-5">
          <p className="flex items-center gap-2 font-medium">
            <CircleHelp aria-hidden className="size-4 text-accent" />
            {t.unsureTitle}
          </p>
          <p className="mt-1 max-w-prose text-sm text-muted">{t.unsureBody}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onPatch({ factory: 'yes' })}
              className="inline-flex h-10 items-center rounded-md bg-accent px-4 text-sm font-semibold text-accent-fg"
            >
              {t.unsureShowHousings}
            </button>
            <button
              type="button"
              onClick={() => onPatch({ factory: 'no' })}
              className="inline-flex h-10 items-center rounded-md border border-line-strong px-4 text-sm text-fg hover:bg-surface-2"
            >
              {t.unsureNoLights}
            </button>
          </div>
        </div>
      ) : null}

      {resolution.kind === 'no_match' ? (
        <div role="status" className="rounded-lg border border-warning/40 bg-warning/5 p-4 sm:p-5">
          <p className="font-medium">{finder.noMatch.title}</p>
          <p className="mt-1 text-sm text-muted">{finder.noMatch.body}</p>
          <a
            href="#confirm-other"
            className="mt-3 inline-flex text-sm font-medium text-accent underline-offset-4 hover:underline"
          >
            {finder.alt.title}
          </a>
        </div>
      ) : null}
    </div>
  )
}

function Select({
  label,
  value,
  options,
  onChange,
  disabled,
  hint,
  className,
}: {
  label: string
  value: string
  options: Option[]
  onChange: (value: string) => void
  disabled?: boolean
  hint?: string
  className?: string
}) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className={cx('text-sm font-medium', disabled && 'text-subtle')}>
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          disabled={disabled}
          aria-describedby={hintId}
          onChange={(e) => onChange(e.target.value)}
          className={cx(
            'h-12 w-full appearance-none rounded-md border border-line-strong bg-bg pr-10 pl-3.5 text-base text-fg',
            'transition-[border-color,box-shadow] duration-fast focus-visible:border-accent focus-visible:shadow-glow-sm focus-visible:outline-none',
            'disabled:cursor-not-allowed disabled:border-line disabled:text-subtle',
            value === '' && 'text-muted',
          )}
        >
          <option value="">{finder.vehicle.choose(label)}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-subtle"
        />
      </div>
      {hint ? (
        <p id={hintId} className="text-xs text-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

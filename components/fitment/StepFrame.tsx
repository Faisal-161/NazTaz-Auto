'use client'

import { Check } from 'lucide-react'
import type { ReactNode, Ref } from 'react'
import { finder } from '@/content/fitment'
import { cn } from '@/lib/utils'

export type StepState = 'done' | 'active' | 'upcoming'

type Props = {
  id: string
  n: string
  title: string
  state: StepState
  summary?: ReactNode
  onEdit?: () => void
  headingRef?: Ref<HTMLHeadingElement>
  children?: ReactNode
  /** Last step draws no connector line below it. */
  last?: boolean
}

/**
 * One numbered step on a vertical rail: 01 ─ 02 ─ 03 ─ 04. Done steps collapse to a one-line
 * summary with "Change"; the active step is expanded; upcoming steps show only their title.
 */
export function StepFrame({
  id,
  n,
  title,
  state,
  summary,
  onEdit,
  headingRef,
  children,
  last,
}: Props) {
  const headingId = `${id}-title`
  return (
    <section
      aria-labelledby={headingId}
      aria-current={state === 'active' ? 'step' : undefined}
      className="relative grid grid-cols-[2.25rem_1fr] gap-x-4 sm:grid-cols-[2.75rem_1fr] sm:gap-x-6"
    >
      {/* rail */}
      <div className="relative flex flex-col items-center">
        <span
          aria-hidden
          className={cn(
            'relative z-10 flex size-9 items-center justify-center rounded-md border font-mono text-xs tabular-nums transition-colors duration-base sm:size-11 sm:text-sm',
            state === 'active' && 'border-accent bg-accent-soft text-accent shadow-glow-sm',
            state === 'done' && 'border-line-strong bg-surface-2 text-fg',
            state === 'upcoming' && 'border-line bg-bg text-subtle',
          )}
        >
          {state === 'done' ? <Check className="size-4" /> : n}
        </span>
        {!last ? (
          <span
            aria-hidden
            className={cn(
              'w-px flex-1 transition-colors duration-slow',
              state === 'done' ? 'bg-line-strong' : 'bg-line',
            )}
          />
        ) : null}
      </div>

      <div className={cn('min-w-0', last ? 'pb-2' : 'pb-10 sm:pb-12')}>
        <div className="flex min-h-9 items-center justify-between gap-3 sm:min-h-11">
          <h2
            id={headingId}
            ref={headingRef}
            tabIndex={-1}
            className={cn(
              'text-lg font-semibold tracking-tight outline-none sm:text-xl',
              state === 'upcoming' && 'text-subtle',
            )}
          >
            <span className="sr-only">Step {n}: </span>
            {title}
          </h2>
          {state === 'done' && onEdit ? (
            <button
              type="button"
              onClick={onEdit}
              aria-label={finder.editLabel(title.toLowerCase())}
              className="inline-flex h-9 shrink-0 items-center rounded-full px-3 text-sm text-muted transition-colors duration-fast hover:bg-surface-2 hover:text-fg"
            >
              {finder.edit}
            </button>
          ) : null}
        </div>
        {state === 'done' && summary ? (
          <div className="mt-1 text-sm text-muted">{summary}</div>
        ) : null}
        {state === 'active' ? <div className="mt-4">{children}</div> : null}
      </div>
    </section>
  )
}

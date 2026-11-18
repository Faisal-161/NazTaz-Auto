import { Label } from 'radix-ui'
import { useId, type ComponentPropsWithRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export const inputClass = cn(
  'h-11 w-full rounded-md border border-line-strong bg-bg px-3.5 text-base text-fg placeholder:text-subtle',
  'transition-[border-color,box-shadow] duration-fast',
  'focus-visible:border-accent focus-visible:shadow-glow-sm focus-visible:outline-none',
  'aria-invalid:border-danger',
)

export function Input({ className, ...props }: ComponentPropsWithRef<'input'>) {
  return <input className={cn(inputClass, className)} {...props} />
}

type FieldProps = {
  label: ReactNode
  /** Visually hide the label (still read by screen readers). */
  hideLabel?: boolean
  hint?: ReactNode
  error?: string
  className?: string
  children: (ids: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode
}

/** Label + control + hint + error with aria wiring. Render-prop so any control can be used. */
export function Field({ label, hideLabel, hint, error, className, children }: FieldProps) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label.Root htmlFor={id} className={cn('text-sm font-medium', hideLabel && 'sr-only')}>
        {label}
      </Label.Root>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint ? (
        <p id={hintId} className="text-xs text-subtle">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
}

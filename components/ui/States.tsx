import { TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type StateProps = {
  icon?: ReactNode
  title: string
  body?: ReactNode
  actions?: ReactNode
  className?: string
  /** Heading level for the title; pick to fit the page outline. */
  as?: 'h2' | 'h3' | 'p'
}

export function EmptyState({
  icon,
  title,
  body,
  actions,
  className,
  as: Title = 'h2',
}: StateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3 px-6 py-10 text-center', className)}>
      {icon ? (
        <div
          aria-hidden
          className="mb-1 flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent [&_svg]:size-6"
        >
          {icon}
        </div>
      ) : null}
      <Title className="font-display text-lg font-semibold">{title}</Title>
      {body ? <p className="max-w-sm text-sm text-muted">{body}</p> : null}
      {actions ? <div className="mt-2 flex flex-wrap justify-center gap-2">{actions}</div> : null}
    </div>
  )
}

export function ErrorState({
  title,
  body,
  actions,
  className,
  as: Title = 'h2',
}: Omit<StateProps, 'icon'>) {
  return (
    <div
      role="alert"
      className={cn('flex flex-col items-center gap-3 px-6 py-10 text-center', className)}
    >
      <div
        aria-hidden
        className="mb-1 flex size-14 items-center justify-center rounded-full bg-danger/10 text-danger"
      >
        <TriangleAlert className="size-6" />
      </div>
      <Title className="font-display text-lg font-semibold">{title}</Title>
      {body ? <p className="max-w-sm text-sm text-muted">{body}</p> : null}
      {actions ? <div className="mt-2 flex flex-wrap justify-center gap-2">{actions}</div> : null}
    </div>
  )
}

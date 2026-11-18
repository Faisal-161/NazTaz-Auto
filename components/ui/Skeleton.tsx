import type { ComponentPropsWithRef } from 'react'
import { cn } from '@/lib/utils'

/** Loading placeholder. Give it the final element's size so nothing shifts (CLS). */
export function Skeleton({ className, ...props }: ComponentPropsWithRef<'div'>) {
  return (
    <div
      aria-hidden
      className={cn('rounded-md bg-surface-2 motion-safe:animate-pulse', className)}
      {...props}
    />
  )
}

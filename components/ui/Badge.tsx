import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentPropsWithRef } from 'react'
import { cn } from '@/lib/utils'

export const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium [&_svg]:size-3.5',
  {
    variants: {
      variant: {
        neutral: 'border-line bg-surface-2 text-muted',
        accent: 'border-accent/40 bg-accent-soft text-accent',
        verified: 'border-fit-verified/40 bg-fit-verified/10 text-fit-verified',
        likely: 'border-fit-likely/40 bg-fit-likely/10 text-fit-likely',
        check: 'border-fit-check/40 bg-fit-check/10 text-fit-check',
        sample: 'border-warning/40 bg-warning/10 tracking-wide text-warning uppercase',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
)

export type BadgeProps = ComponentPropsWithRef<'span'> & VariantProps<typeof badgeVariants>

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

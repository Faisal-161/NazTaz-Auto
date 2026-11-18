import { cva } from 'class-variance-authority'

/**
 * Button styles without tailwind-merge or Radix Slot, so lightweight client code (error
 * boundaries, first-load leaves) can style links/buttons cheaply: className={buttonVariants()}.
 */
export const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap select-none',
    'transition-[background-color,color,box-shadow,opacity] duration-base ease-out',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
    'disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-[1.15em] [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-accent text-accent-fg shadow-glow-sm hover:shadow-glow-md active:opacity-90',
        secondary:
          'border border-line bg-surface-2 text-fg hover:border-accent/60 hover:bg-surface',
        ghost: 'text-fg hover:bg-surface-2',
        link: 'rounded-sm text-accent underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 px-3.5 text-sm',
        md: 'h-11 px-5 text-sm',
        lg: 'h-13 px-7 text-base',
        icon: 'size-11 text-base',
        'icon-sm': 'size-9 text-sm',
      },
    },
    compoundVariants: [{ variant: 'link', className: 'h-auto px-0' }],
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

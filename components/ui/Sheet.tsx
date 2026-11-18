'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import { Dialog } from 'radix-ui'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useReturnFocus } from './useReturnFocus'

/**
 * Side or bottom sheet built on Radix Dialog: focus trap, Esc to close, focus return, scroll lock
 * and aria wiring come from Radix. Animations use token durations (instant under reduced motion).
 */
export const Sheet = Dialog.Root
export const SheetTrigger = Dialog.Trigger
export const SheetClose = Dialog.Close

const sheetVariants = cva(
  'fixed z-drawer flex flex-col border-line bg-surface text-fg shadow-2xl outline-none',
  {
    variants: {
      side: {
        right:
          'inset-y-0 right-0 h-dvh w-full max-w-md border-l data-[state=closed]:animate-sheet-out-right data-[state=open]:animate-sheet-in-right',
        bottom:
          'inset-x-0 bottom-0 max-h-[85dvh] rounded-t-xl border-t pb-[env(safe-area-inset-bottom)] data-[state=closed]:animate-sheet-out-bottom data-[state=open]:animate-sheet-in-bottom',
      },
    },
    defaultVariants: { side: 'right' },
  },
)

type SheetContentProps = ComponentPropsWithRef<typeof Dialog.Content> &
  VariantProps<typeof sheetVariants> & {
    title: ReactNode
    /** Visually hide the title (it is still announced). */
    hideTitle?: boolean
    description?: ReactNode
    closeLabel: string
    headerExtra?: ReactNode
  }

export function SheetContent({
  side,
  title,
  hideTitle,
  description,
  closeLabel,
  headerExtra,
  className,
  children,
  ...props
}: SheetContentProps) {
  const returnFocus = useReturnFocus()
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-drawer bg-bg/70 backdrop-blur-sm data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
      <Dialog.Content
        {...props}
        onOpenAutoFocus={(e) => {
          returnFocus.onOpenAutoFocus()
          props.onOpenAutoFocus?.(e)
        }}
        onCloseAutoFocus={(e) => {
          returnFocus.onCloseAutoFocus(e)
          props.onCloseAutoFocus?.(e)
        }}
        className={cn(sheetVariants({ side }), className)}
        {...(description ? {} : { 'aria-describedby': undefined })}
      >
        {side === 'bottom' ? (
          <div aria-hidden className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-line" />
        ) : null}
        <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
          <Dialog.Title className={cn('font-display text-lg font-semibold', hideTitle && 'sr-only')}>
            {title}
          </Dialog.Title>
          <div className="flex items-center gap-1">
            {headerExtra}
            <Dialog.Close
              aria-label={closeLabel}
              className="inline-flex size-11 items-center justify-center rounded-full text-muted transition-colors duration-fast hover:bg-surface-2 hover:text-fg"
            >
              <X aria-hidden className="size-5" />
            </Dialog.Close>
          </div>
        </div>
        {description ? (
          <Dialog.Description className="px-5 pb-3 text-sm text-muted">{description}</Dialog.Description>
        ) : null}
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  )
}

'use client'

import { X } from 'lucide-react'
import { Dialog as D } from 'radix-ui'
import type { ComponentPropsWithRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useReturnFocus } from './useReturnFocus'

/** Centered modal on Radix Dialog. Used for search, confirmations, housing photo zoom, etc. */
export const Dialog = D.Root
export const DialogTrigger = D.Trigger
export const DialogClose = D.Close

type DialogContentProps = ComponentPropsWithRef<typeof D.Content> & {
  title: ReactNode
  description?: ReactNode
  closeLabel: string
}

export function DialogContent({
  title,
  description,
  closeLabel,
  className,
  children,
  ...props
}: DialogContentProps) {
  const returnFocus = useReturnFocus()
  return (
    <D.Portal>
      <D.Overlay className="fixed inset-0 z-drawer bg-bg/75 backdrop-blur-sm data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
      <D.Content
        {...props}
        onOpenAutoFocus={(e) => {
          returnFocus.onOpenAutoFocus()
          props.onOpenAutoFocus?.(e)
        }}
        onCloseAutoFocus={(e) => {
          returnFocus.onCloseAutoFocus(e)
          props.onCloseAutoFocus?.(e)
        }}
        className={cn(
          'fixed top-1/2 left-1/2 z-drawer w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-line bg-surface p-6 shadow-2xl outline-none data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in',
          className,
        )}
        {...(description ? {} : { 'aria-describedby': undefined })}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <D.Title className="font-display text-xl font-semibold">{title}</D.Title>
          <D.Close
            aria-label={closeLabel}
            className="-m-2 inline-flex size-11 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-fg"
          >
            <X aria-hidden className="size-5" />
          </D.Close>
        </div>
        {description ? (
          <D.Description className="mb-4 text-sm text-muted">{description}</D.Description>
        ) : null}
        {children}
      </D.Content>
    </D.Portal>
  )
}

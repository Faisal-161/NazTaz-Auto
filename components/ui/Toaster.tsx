'use client'

import { CircleCheck, Info, TriangleAlert, X } from 'lucide-react'
import { Toast } from 'radix-ui'
import { useToastStore, type ToastTone } from '@/lib/stores/toast'
import { cn } from '@/lib/utils'

const icons: Record<ToastTone, typeof Info> = {
  info: Info,
  success: CircleCheck,
  error: TriangleAlert,
}
const tones: Record<ToastTone, string> = {
  info: 'text-accent',
  success: 'text-success',
  error: 'text-danger',
}

/** Radix Toast viewport: announced via live region, swipe/Esc to dismiss, F8 hotkey to focus. */
export function Toaster({ closeLabel }: { closeLabel: string }) {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)
  return (
    <Toast.Provider swipeDirection="right" duration={4500}>
      {toasts.map((t) => {
        const Icon = icons[t.tone]
        return (
          <Toast.Root
            key={t.id}
            type={t.tone === 'error' ? 'foreground' : 'background'}
            onOpenChange={(open) => !open && dismiss(t.id)}
            className="flex items-start gap-3 rounded-lg border border-line bg-surface-2 p-4 shadow-2xl data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in data-[swipe=end]:animate-fade-out"
          >
            <Icon aria-hidden className={cn('mt-0.5 size-5 shrink-0', tones[t.tone])} />
            <div className="min-w-0 flex-1">
              <Toast.Title className="text-sm font-semibold">{t.title}</Toast.Title>
              {t.description ? (
                <Toast.Description className="mt-0.5 text-sm text-muted">
                  {t.description}
                </Toast.Description>
              ) : null}
            </div>
            {t.action ? (
              <Toast.Action
                altText={t.action.altText}
                onClick={t.action.onClick}
                className="rounded-full px-3 py-1.5 text-sm font-medium text-accent hover:bg-accent-soft"
              >
                {t.action.label}
              </Toast.Action>
            ) : null}
            <Toast.Close
              aria-label={closeLabel}
              className="-m-1 inline-flex size-8 items-center justify-center rounded-full text-muted hover:text-fg"
            >
              <X aria-hidden className="size-4" />
            </Toast.Close>
          </Toast.Root>
        )
      })}
      <Toast.Viewport className="fixed right-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-toast m-0 flex w-full max-w-sm list-none flex-col gap-2 p-4 outline-none md:bottom-0" />
    </Toast.Provider>
  )
}

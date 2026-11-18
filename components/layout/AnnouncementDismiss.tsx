'use client'

import { X } from 'lucide-react'
import { ANNOUNCEMENT_KEY } from '@/lib/announcement'

export function AnnouncementDismiss({ id, label }: { id: string; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        try {
          localStorage.setItem(ANNOUNCEMENT_KEY, id)
        } catch {
          // storage blocked: hide for this page view only
        }
        document.documentElement.setAttribute('data-hide-announcement', '')
      }}
      className="absolute top-1/2 right-2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-subtle hover:bg-surface-2 hover:text-fg"
    >
      <X aria-hidden className="size-4" />
    </button>
  )
}

'use client'

import dynamic from 'next/dynamic'
import type { ReactNode } from 'react'
import { LoadOnView } from '@/components/ui/LazyMount'

const NewsletterForm = dynamic(() => import('./NewsletterForm').then((m) => m.NewsletterForm))

export function NewsletterLazy({ placeholder }: { placeholder: ReactNode }) {
  return (
    <LoadOnView placeholder={placeholder}>
      <NewsletterForm />
    </LoadOnView>
  )
}

import Link from 'next/link'
import { announcement } from '@/content/layout'
import { AnnouncementDismiss } from './AnnouncementDismiss'

/**
 * Server-rendered so it is in the static shell. Dismissal is a tiny client leaf; the bar's
 * hidden state is applied before paint by a CSS attribute on <html> (no layout jump after load).
 */
export function AnnouncementBar() {
  return (
    <div
      data-announcement={announcement.id}
      className="announcement relative border-b border-line bg-surface text-center text-sm text-muted"
    >
      <p className="container-page py-2 pr-12">
        <span>{announcement.message}</span>{' '}
        <Link href={announcement.link.href} className="font-medium text-accent underline-offset-4 hover:underline">
          {announcement.link.label}
        </Link>
      </p>
      <AnnouncementDismiss id={announcement.id} label={announcement.dismissLabel} />
    </div>
  )
}

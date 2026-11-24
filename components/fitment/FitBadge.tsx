import { CircleCheck, CircleHelp, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { fitBadges } from '@/content/fitment'
import type { FitBadge as FitBadgeKind } from '@/lib/fitment'

const icons = { verified: ShieldCheck, likely: CircleCheck, check: CircleHelp } as const

/** Verified / Likely / Check fit. The description is exposed to assistive tech, not just a hover title. */
export function FitBadge({ badge, className }: { badge: FitBadgeKind; className?: string }) {
  const Icon = icons[badge]
  const t = fitBadges[badge]
  return (
    <Badge variant={badge} className={className} title={t.description}>
      <Icon aria-hidden />
      {t.label}
      <span className="sr-only">. {t.description}</span>
    </Badge>
  )
}

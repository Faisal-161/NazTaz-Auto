import { states } from '@/content/layout'
import { Badge } from './Badge'

/** Required on every piece of sample social proof (reviews, gallery, counts). */
export function SampleBadge({ className }: { className?: string }) {
  return (
    <Badge variant="sample" className={className} title={states.sampleHint}>
      {states.sample}
      <span className="sr-only">: {states.sampleHint}</span>
    </Badge>
  )
}

import { useId } from 'react'
import { site } from '@/content/site'

/** Placeholder wordmark until the brand is chosen: a glowing "puddle" ellipse + name. */
export function Logo() {
  // Rendered in header and footer: unique gradient id per instance.
  const glowId = useId()
  return (
    <span className="flex items-center gap-2">
      <svg aria-hidden viewBox="0 0 32 32" className="size-7">
        <defs>
          <radialGradient id={glowId} cx="50%" cy="65%" r="50%">
            <stop offset="0" stopColor="var(--color-accent)" stopOpacity="0.9" />
            <stop offset="1" stopColor="var(--color-accent)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="16" cy="22" rx="14" ry="6" fill={`url(#${glowId})`} />
        <path
          d="M11 4h10l-2.5 13h-5z"
          fill="var(--color-surface-2)"
          stroke="var(--color-accent)"
          strokeWidth="1.5"
        />
      </svg>
      <span className="font-display text-lg font-semibold tracking-tight">{site.name}</span>
    </span>
  )
}

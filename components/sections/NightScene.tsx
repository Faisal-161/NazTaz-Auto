import { useId } from 'react'
import { cx } from '@/lib/cx'

type Props = {
  /** Text projected on the ground (a name, initials, a business). */
  projection: string
  /** Small second line under the projection (e.g. "EST. 2026"). */
  sub?: string
  className?: string
}

/**
 * Original night scene drawn in SVG: textured asphalt, the bottom edge of an open door with its
 * light lens, a faint beam, and the projection on the ground in perspective. Decorative
 * (aria-hidden); the page's text carries the meaning. A few KB inline, no image request, so it
 * never competes with the LCP. The pool "turns on" via animate-light-on (instant under reduced
 * motion). Also the poster frame for the HeroDoor animation (F1).
 *
 * Exception to "no raw hex in components": this is illustration (SVG gradient stops), not UI
 * chrome. Its values mirror --color-projection and the asphalt tokens in app/globals.css.
 */
export function NightScene({ projection, sub, className }: Props) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  const g = (n: string) => `${id}-${n}`
  return (
    <svg
      aria-hidden
      focusable="false"
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMid slice"
      className={cx('block h-full w-full', className)}
    >
      <defs>
        {/* asphalt: dark warm base, grain from fractal noise */}
        <linearGradient id={g('ground')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#070605" />
          <stop offset="0.55" stopColor="#100e0c" />
          <stop offset="1" stopColor="#161310" />
        </linearGradient>
        <filter id={g('grain')} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" />
          <feColorMatrix values="0 0 0 0 0.62  0 0 0 0 0.58  0 0 0 0 0.52  0 0 0 0.11 0" />
        </filter>
        {/* pool of projected light */}
        <radialGradient id={g('pool')} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff6e6" stopOpacity="0.5" />
          <stop offset="0.45" stopColor="#fff1d6" stopOpacity="0.2" />
          <stop offset="1" stopColor="#fff1d6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={g('halo')} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd9a0" stopOpacity="0.14" />
          <stop offset="1" stopColor="#ffd9a0" stopOpacity="0" />
        </radialGradient>
        {/* beam from the lens down to the ground */}
        <linearGradient id={g('beam')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff6e6" stopOpacity="0.16" />
          <stop offset="1" stopColor="#fff6e6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={g('door')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b1815" />
          <stop offset="1" stopColor="#0d0b0a" />
        </linearGradient>
        {/* glass-etched projection: sharp core + soft bloom */}
        <filter id={g('bloom')} x="-20%" y="-60%" width="140%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="1600" height="1000" fill={`url(#${g('ground')})`} />
      <rect width="1600" height="1000" filter={`url(#${g('grain')})`} />

      {/* door: bottom edge + sill, lens glowing underneath */}
      <path d="M380 0 H1600 V300 L1060 352 H540 L380 300 Z" fill={`url(#${g('door')})`} />
      <path d="M540 352 H1060" stroke="#2e2a25" strokeWidth="3" />
      <rect x="757" y="352" width="86" height="12" rx="3" fill="#fff6e6" opacity="0.9" />

      <g className="animate-light-on">
        <path d="M757 364 L843 364 L1150 760 L450 760 Z" fill={`url(#${g('beam')})`} />
        <ellipse cx="800" cy="740" rx="700" ry="250" fill={`url(#${g('halo')})`} />
        <ellipse cx="800" cy="730" rx="470" ry="150" fill={`url(#${g('pool')})`} />
        {/* projection lies on the ground: squash vertically for perspective */}
        <g transform="translate(800 722) scale(1 0.42)" filter={`url(#${g('bloom')})`}>
          <text
            textAnchor="middle"
            y="0"
            fill="#fff8ec"
            style={{ font: '800 104px var(--font-display)', letterSpacing: '0.06em' }}
          >
            {projection}
          </text>
          {sub ? (
            <text
              textAnchor="middle"
              y="96"
              fill="#fff8ec"
              opacity="0.85"
              style={{ font: '700 44px var(--font-display)', letterSpacing: '0.4em' }}
            >
              {sub}
            </text>
          ) : null}
        </g>
      </g>
    </svg>
  )
}

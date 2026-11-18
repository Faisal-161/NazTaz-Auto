'use client'

import { states } from '@/content/layout'
import { site } from '@/content/site'

/**
 * Replaces the root layout when it crashes. Global CSS is not loaded here, so styles are inline
 * (same token values as globals.css).
 */
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'grid',
          placeItems: 'center',
          background: '#07090d',
          color: '#f2f5f8',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: '1rem',
        }}
      >
        <title>{`${states.genericError.title} | ${site.name}`}</title>
        <main id="main">
          <h1 style={{ fontSize: '1.75rem' }}>{states.genericError.title}</h1>
          <p style={{ color: '#b6bfcb', maxWidth: '28rem' }}>{states.genericError.body}</p>
          <button
            type="button"
            onClick={() => retry()}
            style={{ marginTop: '1rem', height: 44, padding: '0 1.25rem', borderRadius: 999, border: 0, background: '#7de3ff', color: '#03131b', fontWeight: 600, cursor: 'pointer' }}
          >
            {states.retry}
          </button>
        </main>
      </body>
    </html>
  )
}

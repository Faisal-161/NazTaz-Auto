'use client'

import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button-variants'
import { states } from '@/content/layout'

/**
 * Route-level 500 boundary. It ships with every page, so keep it tiny: no Button (Slot +
 * tailwind-merge), just the cva styles.
 */
export default function RouteError({ error, retry }: { error: unknown; retry: () => void }) {
  const digest = error instanceof Error && 'digest' in error ? String(error.digest) : null
  return (
    <section
      role="alert"
      className="container-page flex flex-1 flex-col items-center justify-center gap-4 py-section text-center"
    >
      <h1 className="text-3xl font-semibold">{states.genericError.title}</h1>
      <p className="max-w-md text-muted">{states.genericError.body}</p>
      {digest ? (
        <p className="font-mono text-xs text-subtle">
          {states.errorRef}: {digest}
        </p>
      ) : null}
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <button type="button" className={buttonVariants()} onClick={() => retry()}>
          {states.retry}
        </button>
        <Link href="/" className={buttonVariants({ variant: 'secondary' })}>
          {states.notFound.home}
        </Link>
      </div>
    </section>
  )
}

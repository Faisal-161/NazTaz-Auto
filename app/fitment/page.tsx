import { Suspense } from 'react'
import { FinderSkeleton } from '@/components/fitment/FinderSkeleton'
import { FitFinder } from '@/components/fitment/FitFinder'
import { finder } from '@/content/fitment'
import { getFitments, getHousings, getProducts } from '@/lib/commerce/queries'
import { parseFitParams, toFitParams } from '@/lib/fitment'
import { pageMetadata } from '@/lib/seo/metadata'

export const metadata = pageMetadata({
  title: finder.meta.title,
  description: finder.meta.description,
})

/**
 * Static shell (heading + intro) prerenders; the finder streams in because it reads searchParams
 * (selection lives in the URL). Catalog reads are cached in lib/commerce/queries.
 */
export default function FitmentPage(props: PageProps<'/fitment'>) {
  return (
    <div className="container-page py-12 sm:py-16">
      <header className="max-w-3xl">
        <p className="font-mono text-xs tracking-widest text-accent uppercase">{finder.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-semibold">{finder.title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">{finder.intro}</p>
      </header>
      <div className="mt-12 sm:mt-14">
        <Suspense fallback={<FinderSkeleton />}>
          <FinderLoader searchParams={props.searchParams} />
        </Suspense>
      </div>
    </div>
  )
}

async function FinderLoader({
  searchParams,
}: {
  searchParams: PageProps<'/fitment'>['searchParams']
}) {
  const [params, rows, housings, products] = await Promise.all([
    searchParams,
    getFitments(),
    getHousings(),
    getProducts({ first: 100 }),
  ])
  const initial = parseFitParams(params)
  // key: a new URL (e.g. header link back to /fitment) remounts with fresh state.
  return (
    <FitFinder
      key={toFitParams(initial)}
      rows={rows}
      housings={housings}
      products={products.nodes}
      initial={initial}
    />
  )
}

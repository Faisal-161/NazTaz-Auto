import { Skeleton } from '@/components/ui/Skeleton'

/** Same footprint as the first finder step + side panel, so streaming in causes no shift. */
export function FinderSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12" aria-hidden>
      <div className="flex flex-col gap-10">
        <div className="grid grid-cols-[2.25rem_1fr] gap-x-4 sm:grid-cols-[2.75rem_1fr] sm:gap-x-6">
          <Skeleton className="size-9 sm:size-11" />
          <div>
            <Skeleton className="h-7 w-56" />
            <Skeleton className="mt-6 h-5 w-full max-w-lg" />
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          </div>
        </div>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="grid grid-cols-[2.25rem_1fr] gap-x-4 sm:grid-cols-[2.75rem_1fr] sm:gap-x-6"
          >
            <Skeleton className="size-9 sm:size-11" />
            <Skeleton className="h-7 w-44" />
          </div>
        ))}
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  )
}

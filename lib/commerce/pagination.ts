import type { Connection, PageArgs } from './types'

const PREFIX = 'cursor:'

export function encodeCursor(index: number): string {
  return `${PREFIX}${index}`
}

export function decodeCursor(cursor: string | null | undefined): number {
  if (!cursor) return -1
  const n = Number(cursor.slice(PREFIX.length))
  if (!cursor.startsWith(PREFIX) || !Number.isInteger(n) || n < 0)
    throw new Error(`Invalid cursor: ${cursor}`)
  return n
}

/** Slice an array into a Shopify-style connection. `first` defaults to 24, max 100. */
export function paginate<T>(
  items: readonly T[],
  { first = 24, after }: PageArgs = {},
): Connection<T> {
  const size = Math.min(Math.max(first, 1), 100)
  const start = decodeCursor(after) + 1
  const nodes = items.slice(start, start + size)
  const last = start + nodes.length - 1
  return {
    nodes,
    pageInfo: {
      hasNextPage: last < items.length - 1,
      endCursor: nodes.length ? encodeCursor(last) : null,
    },
  }
}

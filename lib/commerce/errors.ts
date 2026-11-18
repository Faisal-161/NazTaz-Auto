export class CommerceError extends Error {
  constructor(
    message: string,
    readonly code: 'NOT_FOUND' | 'NOT_IMPLEMENTED' | 'UPSTREAM' | 'INVALID' = 'UPSTREAM',
  ) {
    super(message)
    this.name = 'CommerceError'
  }
}

export function notImplemented(operation: string): never {
  throw new CommerceError(
    `Shopify adapter: ${operation} is not implemented yet (Phase 2).`,
    'NOT_IMPLEMENTED',
  )
}

import { clsx, type ClassValue } from 'clsx'

/**
 * Class joiner WITHOUT tailwind-merge (~9KB gz). Use in client components that are part of the
 * first load (header actions, sticky CTA...) when classes don't need conflict resolution.
 * Server components and lazy-loaded client code can use cn() from lib/utils.
 */
export function cx(...inputs: ClassValue[]): string {
  return clsx(inputs)
}

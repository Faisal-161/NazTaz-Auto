import type { FitConfidence, FitMethod, Fitment } from '@/lib/commerce/types'

/** Answer to "Do you have factory puddle lights?" */
export type FactoryAnswer = 'yes' | 'no' | 'unsure'

/**
 * What the shopper has chosen so far. Make/model/generation are slugs (URL-safe, lowercase) so the
 * same object round-trips through the URL. Every field is optional: the finder fills them in order.
 */
export type FitSelection = {
  factory?: FactoryAnswer
  year?: number
  make?: string
  model?: string
  generation?: string
  trim?: string
  housing?: string
}

/** Result of resolving a selection against fitment rows. Drives the finder's next step. */
export type FitResolution =
  /** Need more input before anything can be resolved. */
  | { kind: 'incomplete'; missing: 'year' | 'make' | 'model' }
  /** Year/make/model is not in our fitment list. Offer part number / VIN / photo review / universal. */
  | { kind: 'no_match' }
  /** The year falls in more than one generation: ask which one. */
  | { kind: 'needs_generation'; generations: string[] }
  /** Vehicle (or this trim) has no factory lights, or shopper said "no": universal lights. */
  | {
      kind: 'universal'
      reason: 'no_factory_lights' | 'trim_without_lights' | 'shopper_said_no'
      rows: Fitment[]
    }
  /** Factory lights on some trims and the shopper hasn't said whether they have them. */
  | { kind: 'ask_factory'; rows: Fitment[] }
  /** More than one housing possible (mid-generation change, door vs mirror): visual picker. */
  | { kind: 'pick_housing'; housings: string[]; rows: Fitment[] }
  /** Exactly one housing confirmed. */
  | {
      kind: 'resolved'
      housing: string
      confidence: FitConfidence
      method: Extract<FitMethod, 'picker'>
      rows: Fitment[]
    }

/** Fit badge shown on product cards / PDP. */
export type FitBadge = 'verified' | 'likely' | 'check'

/** How a product relates to the shopper's active vehicle. */
export type ProductFit =
  | { status: 'fits'; badge: FitBadge }
  | { status: 'no_fit' }
  | { status: 'universal' }
  | { status: 'unknown' }

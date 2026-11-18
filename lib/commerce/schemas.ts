import { z } from 'zod'
import { ORDER_STAGES } from './types'

/**
 * Zod schemas for fixtures (and later, untrusted Shopify payloads). Tests validate every
 * data/*.json file against these so fixture drift fails CI.
 */
export const money = z.object({ amount: z.string().regex(/^\d+(\.\d{1,2})?$/), currencyCode: z.literal('USD') })
export const image = z.object({
  url: z.string().min(1),
  altText: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  placeholder: z.boolean().optional(),
})
const location = z.enum(['door', 'mirror', 'tailgate'])
const category = z.enum(['names', 'initials', 'wedding', 'business', 'enthusiast', 'pattern'])

export const housing = z.object({
  code: z.string().regex(/^[A-Z0-9-]+$/),
  name: z.string(),
  location,
  shape: z.string(),
  connector: z.string(),
  oem_part_numbers: z.array(z.string()),
  photo_housing: image,
  photo_connector: image,
  install_guide: z.string(),
  notes: z.string(),
})

export const fitment = z
  .object({
    id: z.string(),
    make: z.string(),
    model: z.string(),
    generation: z.string(),
    year_start: z.number().int().min(1950),
    year_end: z.number().int().max(2035),
    trims: z.array(z.string()),
    has_factory_lights: z.enum(['yes', 'some', 'no']),
    housings: z.array(z.string()),
    confidence: z.enum(['verified', 'likely', 'unverified']),
    verified_installs: z.number().int().min(0),
    source: z.string(),
  })
  .refine((f) => f.year_end >= f.year_start, 'year_end before year_start')
  .refine((f) => f.has_factory_lights === 'no' || f.housings.length > 0, 'factory lights need housings')

export const vehicle = z.object({
  id: z.string(),
  make: z.string(),
  makeSlug: z.string().regex(/^[a-z0-9-]+$/),
  model: z.string(),
  modelSlug: z.string().regex(/^[a-z0-9-]+$/),
  segment: z.enum(['truck', 'suv', 'car', 'ev']),
  image,
})

const variant = z.object({
  id: z.string(),
  title: z.string(),
  price: money,
  compareAtPrice: money.nullable(),
  availableForSale: z.boolean(),
  selectedOptions: z.array(z.object({ name: z.string(), value: z.string() })),
})

export const product = z.object({
  id: z.string(),
  handle: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string(),
  productType: z.enum(['vehicle', 'universal', 'service']),
  description: z.string(),
  featuredImage: image,
  images: z.array(image),
  priceRange: z.object({ minVariantPrice: money, maxVariantPrice: money }),
  options: z.array(z.object({ name: z.string(), values: z.array(z.string()) })),
  variants: z.array(variant).min(1),
  tags: z.array(z.string()),
  housing_code: z.string().nullable(),
  lens: z.enum(['single', 'dual']),
  location: z.union([location, z.literal('universal')]),
  lead_time_days: z.number().int().positive(),
  in_the_box: z.array(z.string()),
  warranty_years: z.number().int().positive(),
  best_seller_rank: z.number().int().positive().nullable(),
})

export const design = z.object({
  id: z.string(),
  handle: z.string(),
  name: z.string(),
  category,
  kind: z.enum(['premade', 'custom']),
  artUrl: z.string(),
  tags: z.array(z.string()),
  sample: z.boolean(),
})

export const review = z.object({
  id: z.string(),
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  title: z.string(),
  body: z.string(),
  author: z.string(),
  createdAt: z.string(),
  vehicle: z.string().nullable(),
  housing_code: z.string().nullable(),
  product_handle: z.string().nullable(),
  design_category: category,
  media: z.array(image),
  did_it_fit: z.boolean().nullable(),
  sample: z.literal(true),
})

export const galleryItem = z.object({
  id: z.string(),
  image,
  vehicle: z.string(),
  make: z.string(),
  design_category: category,
  caption: z.string(),
  sample: z.literal(true),
})

const stage = z.enum(ORDER_STAGES)
const attribute = z.object({ key: z.string(), value: z.string() })

export const proof = z.object({
  id: z.string(),
  orderId: z.string(),
  version: z.number().int().positive(),
  status: z.enum(['pending', 'approved', 'changes_requested']),
  lensArtUrl: z.string(),
  projectionUrl: z.string(),
  revisionsUsed: z.number().int().min(0),
  revisionsAllowed: z.number().int().min(0),
  comments: z.array(
    z.object({
      id: z.string(),
      author: z.enum(['customer', 'studio']),
      body: z.string(),
      at: z.string(),
      attachmentUrl: z.string().optional(),
    }),
  ),
  createdAt: z.string(),
})

export const order = z.object({
  id: z.string(),
  number: z.string(),
  email: z.email(),
  createdAt: z.string(),
  stage,
  stageHistory: z.array(z.object({ stage, at: z.string() })),
  lines: z.array(
    z.object({ title: z.string(), variantTitle: z.string(), quantity: z.number().int().positive(), price: money, attributes: z.array(attribute) }),
  ),
  total: money,
  proofIds: z.array(z.string()),
  tracking: z.object({ carrier: z.string(), number: z.string(), url: z.string() }).nullable(),
  sample: z.boolean(),
})

export const faq = z.object({ id: z.string(), question: z.string(), answer: z.string(), topics: z.array(z.string()) })

export const businessPricing = z.object({
  base_unit_price: money,
  setup_fee: money,
  lead_time_days: z.number().int().positive(),
  tiers: z.array(
    z.object({ id: z.string(), min_qty: z.number().int().positive(), max_qty: z.number().int().positive().nullable(), discount_pct: z.number().min(0).max(90), label: z.string() }),
  ),
})

export const fixtures = {
  housings: z.array(housing),
  fitment: z.array(fitment),
  vehicles: z.array(vehicle),
  products: z.array(product),
  designs: z.array(design),
  reviews: z.array(review),
  gallery: z.array(galleryItem),
  orders: z.array(order),
  proofs: z.array(proof),
  faqs: z.array(faq),
  'business-pricing': businessPricing,
} as const

export type FixtureName = keyof typeof fixtures

/**
 * Domain types shared by every commerce adapter. Field names match the future Shopify
 * objects / metaobjects (see docs/data-models.md) so the Shopify adapter is a mapping, not a
 * redesign. IDs are opaque strings — never parse them.
 */

// ---------- Primitives ----------
export type CurrencyCode = 'USD'
/** Shopify MoneyV2 */
export type Money = { amount: string; currencyCode: CurrencyCode }
export type Image = { url: string; altText: string; width: number; height: number; placeholder?: boolean }

/** Shopify-style connection for cursor pagination. */
export type PageInfo = { hasNextPage: boolean; endCursor: string | null }
export type Connection<T> = { nodes: T[]; pageInfo: PageInfo }
export type PageArgs = { first?: number; after?: string | null }

// ---------- Fitment ----------
export type HousingLocation = 'door' | 'mirror' | 'tailgate'
export type FactoryLights = 'yes' | 'some' | 'no'
export type FitConfidence = 'verified' | 'likely' | 'unverified'
export type FitMethod = 'picker' | 'part_number' | 'vin' | 'photo_review' | 'universal'

/** Metaobject `housing` */
export type Housing = {
  code: string
  name: string
  location: HousingLocation
  shape: string
  connector: string
  oem_part_numbers: string[]
  photo_housing: Image
  photo_connector: Image
  install_guide: string
  notes: string
}

/** Metaobject `vehicle_fitment` — one row per make/model/generation (+ optional year split). */
export type Fitment = {
  id: string
  make: string
  model: string
  generation: string
  year_start: number
  year_end: number
  trims: string[]
  has_factory_lights: FactoryLights
  housings: string[]
  confidence: FitConfidence
  verified_installs: number
  source: string
}

/** Navigation entity for /shop/vehicle/[make]/[model]. */
export type Vehicle = {
  id: string
  make: string
  makeSlug: string
  model: string
  modelSlug: string
  segment: 'truck' | 'suv' | 'car' | 'ev'
  image: Image
}

/** A vehicle saved in My Garage. */
export type GarageVehicle = {
  id: string
  year: number
  make: string
  model: string
  generation?: string
  trim?: string
  housing_code?: string
  fit_method?: FitMethod
}

// ---------- Catalog ----------
export type ProductType = 'vehicle' | 'universal' | 'service'
export type LensType = 'single' | 'dual'
export type SelectedOption = { name: string; value: string }
export type ProductOption = { name: string; values: string[] }

export type Variant = {
  id: string
  title: string
  price: Money
  compareAtPrice: Money | null
  availableForSale: boolean
  selectedOptions: SelectedOption[]
}

export type Product = {
  id: string
  handle: string
  title: string
  productType: ProductType
  description: string
  featuredImage: Image
  images: Image[]
  priceRange: { minVariantPrice: Money; maxVariantPrice: Money }
  options: ProductOption[]
  variants: Variant[]
  tags: string[]
  /** metafields */
  housing_code: string | null
  lens: LensType
  location: HousingLocation | 'universal'
  lead_time_days: number
  in_the_box: string[]
  warranty_years: number
  best_seller_rank: number | null
}

export type DesignCategory = 'names' | 'initials' | 'wedding' | 'business' | 'enthusiast' | 'pattern'
export type Design = {
  id: string
  handle: string
  name: string
  category: DesignCategory
  kind: 'premade' | 'custom'
  artUrl: string
  tags: string[]
  sample: boolean
}

// ---------- Cart ----------
export type Attribute = { key: string; value: string }

export type CartLine = {
  id: string
  merchandiseId: string
  quantity: number
  attributes: Attribute[]
  cost: { amountPerQuantity: Money; totalAmount: Money }
  merchandise: {
    productHandle: string
    productTitle: string
    variantTitle: string
    image: Image
  }
}

export type Cart = {
  id: string
  checkoutUrl: string
  totalQuantity: number
  lines: CartLine[]
  cost: { subtotalAmount: Money; totalAmount: Money }
}

export type CartLineInput = { merchandiseId: string; quantity: number; attributes?: Attribute[] }
export type CartLineUpdateInput = { id: string; quantity?: number; attributes?: Attribute[] }

// ---------- Orders + proofs ----------
export const ORDER_STAGES = [
  'design_received',
  'proof_sent',
  'approved',
  'engraving',
  'qc',
  'shipped',
  'delivered',
] as const
export type OrderStage = (typeof ORDER_STAGES)[number]

export type ProofStatus = 'pending' | 'approved' | 'changes_requested'
export type ProofComment = { id: string; author: 'customer' | 'studio'; body: string; at: string; attachmentUrl?: string }
export type Proof = {
  id: string
  orderId: string
  version: number
  status: ProofStatus
  lensArtUrl: string
  projectionUrl: string
  revisionsUsed: number
  revisionsAllowed: number
  comments: ProofComment[]
  createdAt: string
}

export type OrderLine = {
  title: string
  variantTitle: string
  quantity: number
  price: Money
  attributes: Attribute[]
}

export type Order = {
  id: string
  number: string
  email: string
  createdAt: string
  stage: OrderStage
  stageHistory: { stage: OrderStage; at: string }[]
  lines: OrderLine[]
  total: Money
  proofIds: string[]
  tracking: { carrier: string; number: string; url: string } | null
  sample: boolean
}

// ---------- Social proof (always sample until real) ----------
export type Review = {
  id: string
  rating: 1 | 2 | 3 | 4 | 5
  title: string
  body: string
  author: string
  createdAt: string
  vehicle: string | null
  housing_code: string | null
  product_handle: string | null
  design_category: DesignCategory
  media: Image[]
  did_it_fit: boolean | null
  sample: boolean
}

export type GalleryItem = {
  id: string
  image: Image
  vehicle: string
  make: string
  design_category: DesignCategory
  caption: string
  sample: boolean
}

// ---------- Content ----------
export type Faq = { id: string; question: string; answer: string; topics: string[] }

// ---------- Business ----------
export type PricingTier = { id: string; min_qty: number; max_qty: number | null; discount_pct: number; label: string }
export type BusinessPricing = { base_unit_price: Money; setup_fee: Money; tiers: PricingTier[]; lead_time_days: number }
export type QuoteRequest = {
  company: string
  contactName: string
  email: string
  quantity: number
  vehicles: string
  logoUrl?: string
  deadline: string
  notes?: string
}
export type Quote = {
  id: string
  request: QuoteRequest
  tierId: string
  unitPrice: Money
  setupFee: Money
  total: Money
  status: 'draft' | 'sent' | 'approved'
  validUntil: string
}

// ---------- Adapter contract ----------
export type ProductQuery = PageArgs & {
  productType?: ProductType
  housingCodes?: string[]
  sort?: 'best_selling' | 'price_asc' | 'price_desc'
}

export interface CommerceAdapter {
  readonly name: 'mock' | 'shopify'

  // catalog
  getProducts(query?: ProductQuery): Promise<Connection<Product>>
  getProduct(handle: string): Promise<Product | null>
  getDesigns(args?: PageArgs & { category?: DesignCategory }): Promise<Connection<Design>>
  getDesign(id: string): Promise<Design | null>

  // fitment
  getVehicles(): Promise<Vehicle[]>
  getHousings(): Promise<Housing[]>
  getHousing(code: string): Promise<Housing | null>
  getFitments(filter?: { make?: string; model?: string }): Promise<Fitment[]>

  // cart (Shopify Cart API shape)
  createCart(lines?: CartLineInput[]): Promise<Cart>
  getCart(cartId: string): Promise<Cart | null>
  addCartLines(cartId: string, lines: CartLineInput[]): Promise<Cart>
  updateCartLines(cartId: string, lines: CartLineUpdateInput[]): Promise<Cart>
  removeCartLines(cartId: string, lineIds: string[]): Promise<Cart>

  // account (mock now; Customer Account API later)
  getOrders(email: string): Promise<Order[]>
  getOrder(id: string): Promise<Order | null>
  findOrder(email: string, orderNumber: string): Promise<Order | null>
  getProof(id: string): Promise<Proof | null>
  respondToProof(id: string, response: { action: 'approve' } | { action: 'request_changes'; comment: string; attachmentUrl?: string }): Promise<Proof>

  // social proof + content
  getReviews(filter?: PageArgs & { productHandle?: string; housingCode?: string; category?: DesignCategory }): Promise<Connection<Review>>
  getGallery(filter?: PageArgs & { make?: string; category?: DesignCategory }): Promise<Connection<GalleryItem>>
  getFaqs(topic?: string): Promise<Faq[]>

  // business
  getBusinessPricing(): Promise<BusinessPricing>
  requestQuote(request: QuoteRequest): Promise<Quote>
}

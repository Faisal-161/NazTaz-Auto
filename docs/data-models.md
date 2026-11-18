# Data models

Field names match the future Shopify metaobjects and metafields exactly (snake_case for metaobject
fields). TypeScript types live in `lib/commerce/types.ts`; zod schemas live in `lib/commerce/schemas.ts`.

## Housing (metaobject `housing`)

| Field            | Type                         | Notes                                          |
| ---------------- | ---------------------------- | ---------------------------------------------- |
| code             | string                       | Unique, e.g. `FD-DR-01`. Products reference it |
| name             | string                       | Human name                                     |
| location         | `door \| mirror \| tailgate` |                                                |
| shape            | string                       | e.g. `oval`, `rectangle`, `round`              |
| connector        | string                       | Connector type label                           |
| oem_part_numbers | string[]                     | For part-number search                         |
| photo_housing    | string                       | Image URL (placeholder now)                    |
| photo_connector  | string                       | Image URL (placeholder now)                    |
| install_guide    | string                       | Install guide slug, e.g. `/install/[housing]`  |
| notes            | string                       | Fitment caveats                                |

## Vehicle fitment (metaobject `vehicle_fitment`)

| Field                   | Type                               | Notes                                                            |
| ----------------------- | ---------------------------------- | ---------------------------------------------------------------- |
| make, model, generation | string                             | Generation e.g. `14th gen (2021–2023)`                           |
| year_start, year_end    | number                             | Inclusive                                                        |
| trims                   | string[]                           | Empty means all trims                                            |
| has_factory_lights      | `yes \| some \| no`                | `some` = trim-dependent → show housing picker                    |
| housings                | string[]                           | Housing codes (refs). >1 = mid-generation change → visual picker |
| confidence              | `verified \| likely \| unverified` | Maps to badges Verified / Likely / Check fit                     |
| verified_installs       | number                             | Real count only; mock values labelled Sample                     |
| source                  | string                             | e.g. `oem-catalog`, `customer-install`, `dealer`                 |

## Vehicle

`{ id, make, model, slug (make/model), generations[], image }` (navigation entity for
`/shop/vehicle/[make]/[model]`).

## Product

Shopify Product shape plus metafields: `id, handle, title, productType (vehicle|universal|service),
description, featuredImage, images[], priceRange, options[], variants[], tags[],
housing_code?, lens (single|dual), location, leadTimeDays, inTheBox[], warrantyYears`.

## Variant

`{ id, title, price: Money, compareAtPrice?, availableForSale, selectedOptions[{name,value}] }`.
Options: `Lens`, `Lights` (2|4), `Color`, `Design` (custom|premade).

## Design

`{ id, name, category (names|initials|wedding|business|enthusiast|pattern), kind (premade|custom),
artUrl (single-color SVG/PNG), tags[], sample: boolean }`.

## Cart and CartLine

`Cart { id, checkoutUrl, lines: CartLine[], cost: { subtotal, total }, totalQuantity }`
`CartLine { id, merchandiseId, quantity, cost, attributes: {key,value}[] }`

### Cart line attribute keys (`lib/commerce/attributes.ts`)

| Key                                | Example                                                     | Meaning                             |
| ---------------------------------- | ----------------------------------------------------------- | ----------------------------------- |
| `_vehicle`                         | `2022 Ford F-150 XLT`                                       | Display string of garage vehicle    |
| `_housing_code`                    | `FD-DR-01`                                                  | Confirmed housing                   |
| `_fit_method`                      | `picker \| part_number \| vin \| photo_review \| universal` | How fit was confirmed               |
| `_design_id`                       | `dsg_123`                                                   | Saved design (premade or custom)    |
| `_design_preview`                  | URL                                                         | Thumbnail of the projection preview |
| `_gift`                            | `true`                                                      | Gift mode (F7)                      |
| `_gift_message`, `_gift_send_date` |                                                             | Gift mode                           |

Leading underscore = hidden from customers in Shopify checkout.

## Order, OrderStage, Proof

`OrderStage = design_received | proof_sent | approved | engraving | qc | shipped | delivered`
`Order { id, number, email, createdAt, stage, stageHistory[{stage, at}], lines, proofs[], tracking? }`
`Proof { id, orderId, version, status (pending|approved|changes_requested), lensArtUrl,
projectionUrl, revisionsUsed, revisionsAllowed (2), comments[] }`

## Review, GalleryItem, Quote

`Review { id, rating, title, body, author, vehicle?, housing_code?, design_category, media[],
didItFit?, sample: true }`
`GalleryItem { id, image, vehicle, design_category, sample: true }`
`Quote { id, company, quantity, vehicles[], logoUrl?, deadline, tier, unitPrice, total, status }`

## Fixtures (`data/*.json`)

products, designs, vehicles, housings, fitment (15 launch vehicles: F-150, RAM 1500, Silverado,
Tesla Model 3, Model Y, Challenger, Charger, Camry, Accord, Tahoe/Yukon, Escalade, Grand Cherokee,
Mustang, one BMW, one Mercedes), reviews (sample), gallery (sample), orders (with stages and proofs),
faqs, business-pricing. Fitment data is **illustrative** until verified against real parts.

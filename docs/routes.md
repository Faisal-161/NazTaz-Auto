# Routes and global UI

## Routes

| Route                                                                       | Purpose                                                  | Phase               |
| --------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------- |
| `/`                                                                         | Homepage (sections below)                                | 1B                  |
| `/shop`                                                                     | All products, filtered by active garage vehicle          | 1B                  |
| `/shop/vehicle/[make]/[model]`                                              | Products that fit a vehicle                              | 1B                  |
| `/products/[handle]`                                                        | Product page (F4)                                        | 1B                  |
| `/designs`                                                                  | Pre-made design library                                  | 1D                  |
| `/studio`                                                                   | Full design studio (F2)                                  | 1B                  |
| `/fitment`                                                                  | Fitment finder (F3)                                      | 1B                  |
| `/gifts`                                                                    | Gift mode landing (F7)                                   | 1D                  |
| `/business`                                                                 | B2B landing + quote form (F8)                            | 1D                  |
| `/gallery`                                                                  | Night gallery / UGC (F9)                                 | 1D                  |
| `/install`, `/install/[housing]`                                            | Install guides                                           | 1D                  |
| `/cart`                                                                     | Full cart page                                           | 1B                  |
| `/checkout`                                                                 | **Mock** checkout (later redirect to `cart.checkoutUrl`) | 1B                  |
| `/account`                                                                  | Mock login + dashboard                                   | 1C                  |
| `/account/orders/[id]`                                                      | Order + stage timeline (F6)                              | 1C                  |
| `/account/proofs/[id]`                                                      | Proof approval (F5)                                      | 1C                  |
| `/help`, `/help/shipping`, `/help/returns`, `/help/warranty`, `/help/track` | Help center                                              | 1D                  |
| `/contact`, `/about`                                                        |                                                          | 1D                  |
| `/blog`                                                                     | Placeholder only                                         | 1D                  |
| `not-found`, `error`, `global-error`                                        | 404 / 500                                                | 1A shell, 1D polish |

URL rules: lowercase, hyphenated, no IDs in URLs where a handle exists. Finder selections are kept in
search params (`/fitment?year=2022&make=ford&model=f-150&gen=14&housing=FD-DR-01`).

## Global UI

- **Announcement bar**: copy from `content/announcement.ts`, dismissible.
- **Header**: logo, primary nav, search trigger (F10), **My Garage chip** (active vehicle or
  "Add vehicle"), account, cart button with count.
- **Mobile**: hamburger → bottom-sheet menu; sticky bottom **"Find my fit"** CTA.
- **Cart drawer**: line items with design thumbnail, vehicle + housing, "Edit design" link,
  quantity, remove, subtotal, checkout CTA, empty state.
- **Footer**: link columns, newsletter signup (rhf + zod, mock submit), legal line.
- **Toasts** (Radix Toast), **skeletons**, and **empty/error states** on every data surface.

## Homepage sections (in order)

1. **HeroDoor**: scroll/tap → door opens → logo lights the ground. A static poster is the LCP and the
   reduced-motion fallback.
2. **FitmentBar**: Year / Make / Model quick finder → `/fitment`.
3. **PreviewTeaser**: type a name → projected preview (lightweight canvas).
4. **BestSellers**: filtered by garage.
5. **HowItWorks**: car → design → approve proof → install in 10 min.
6. **WhyUs**
7. **NightGallery** (UGC, Sample)
8. **Gifts**
9. **BusinessBand**
10. **Reviews** (Sample)
11. **FAQ + email capture**

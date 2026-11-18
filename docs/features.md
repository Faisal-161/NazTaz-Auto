# Feature specs

Each feature is built with the `new-feature` skill and reviewed by `perf-a11y-reviewer` before it is done.

## F1 Hero door animation
- Desktop: GSAP ScrollTrigger pinned scroll; door opens, light cone grows, logo appears on the ground.
- Mobile: tap to open (no scroll-jacking).
- Prototype **both** GSAP-driven layered SVG/CSS **and** an image sequence (canvas frames); measure
  LCP, JS size and INP; keep the faster one and record the result in decisions.md.
- Static poster image = LCP element (`priority`) and the reduced-motion fallback. GSAP is loaded via
  `next/dynamic` after idle or on interaction.

## F2 Design studio (`/studio`, compact version on PDP)
- Input: upload PNG/SVG/JPG, or text + font + icon.
- Controls: light color, scene (driveway, garage, parking lot, wet asphalt), door-height slider,
  left/right mirror, 2 vs 4 lights.
- Engine (`lib/projection`, pure, unit-tested):
  art → single-color mask (threshold/alpha) → perspective transform onto ground ellipse →
  radial falloff → bloom → distance blur.
- Warnings: low resolution, thin lines (< min stroke at lens scale), too much fill (> X% coverage).
- Rights checkbox required for uploads. Save design → cart attributes (`_design_id`,
  `_design_preview`). Download PNG / Web Share preview.
- Canvas runs on the client; OffscreenCanvas + worker if INP suffers.

## F3 Fitment finder (`/fitment`)
1. "Do you have factory puddle lights?" No → universal path.
2. Year → Make → Model → Generation.
3. **Visual housing picker**: photo cards of housing + connector, one tap to confirm.
4. Fitting products.
- Alternatives: OEM part-number search; **VIN decode via NHTSA vPIC** (real call,
  `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/{vin}?format=json`, free, no key);
  guided photo upload (stored for review, mock).
- **My Garage**: multiple vehicles, each with chosen housing; the active vehicle filters the whole site.
- Fit badges: **Verified** / **Likely** / **Check fit** (from `confidence`).
- Selections kept in URL search params. Logic in `lib/fitment` as pure tested functions, including
  mid-generation housing changes (year ranges overlapping within a generation).

## F4 Product page
Fit badge, gallery (night / install / connector) + video, compact customizer, options with live price
(`lib/pricing`), delivery estimate ("ships X days after proof approval"), in-the-box, install video,
warranty, FAQ, reviews with media, sticky mobile add-to-cart, upsells.

## F5 Proof approval (mock)
Proofs list, proof page (lens art + projection mock), Approve or Request change (comment + upload),
2 free revisions with a counter.

## F6 Order stages
Timeline: Design received → Proof sent → Approved → Engraving → QC → Shipped → Delivered.
Track page `/help/track`: email + order number lookup.

## F7 Gift mode
Buy now, recipient designs later via link; gift message; printable card; send date.

## F8 Business
Landing + quote form (qty, vehicles, logo upload, deadline) → mock volume quote from
`business-pricing.json` → approve flow.

## F9 Reviews + gallery
Filter by vehicle and design category. "Did it fit?" prompt in the account after delivery. All sample.

## F10 Header search
Client-side index across products, vehicles and designs built from a server-generated JSON payload.
Lazy-load the index when search opens. Keyboard: `/` opens, arrows navigate, Enter selects.

## Also
Pre-made design library, install guide template (+2 samples), mock login/account.

/** URL-safe slug: "Mercedes-Benz" → "mercedes-benz", "4th gen (DT)" → "4th-gen-dt". */
export function slugify(input: string): string {
  return (
    input
      .normalize('NFKD')
      // strip combining marks left by NFKD ("Citroën" → "Citroen")
      .replace(/\p{M}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  )
}

/** True when a display value and a slug (or two display values) refer to the same thing. */
export function sameSlug(a: string, b: string): boolean {
  return slugify(a) === slugify(b)
}

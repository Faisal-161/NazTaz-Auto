import { RoutePlaceholder } from '@/components/sections/RoutePlaceholder'
import { placeholders } from '@/content/placeholders'
import { pageMetadata } from '@/lib/seo/metadata'

// Placeholder route shell (see content/placeholders.ts): replace with the real page.
export const metadata = pageMetadata({ title: placeholders['help-returns'].title })

export default function Page() {
  return <RoutePlaceholder route="help-returns" />
}

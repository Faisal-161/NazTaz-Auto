import type { Metadata } from 'next'
import { site } from '@/content/site'

type PageMetaInput = {
  /** Page-specific title; omit on the homepage. */
  title?: string
  description?: string
}

/**
 * Every route builds its metadata here so Phase 3 SEO (canonical, OG, structured data) lands in
 * one place. Titles only for now.
 */
export function pageMetadata({ title, description }: PageMetaInput = {}): Metadata {
  return {
    title: title ? `${title} | ${site.name}` : `${site.name} | ${site.tagline}`,
    description: description ?? site.description,
  }
}

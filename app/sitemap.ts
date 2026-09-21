import type { MetadataRoute } from 'next'
import { isIndexable, siteUrl } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  return isIndexable ? [{ url: `${siteUrl}/` }, { url: `${siteUrl}/privacy` }] : []
}

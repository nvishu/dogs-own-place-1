import { SITE } from '@/lib/site'
import { SERVICES } from '@/lib/constants'

export default function sitemap() {
  const now = new Date()
  const pages = ['', '/services', '/about', '/contact'].map((p) => ({
    url: `${SITE.url}${p}`, lastModified: now, changeFrequency: p === '' ? 'weekly' : 'monthly', priority: p === '' ? 1 : 0.8,
  }))
  const services = SERVICES.map((s) => ({ url: `${SITE.url}/services/${s.id}`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 }))
  return [...pages, ...services]
}

import { SITE } from '@/lib/site'

export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/dashboard', '/payment', '/api/', '/auth/'] }],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  }
}

import { SITE } from '@/lib/site'

export default function manifest() {
  return {
    name: SITE.name, short_name: SITE.shortName, description: SITE.description,
    start_url: '/', display: 'standalone', background_color: '#FDF8F0', theme_color: SITE.themeColor,
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
  }
}

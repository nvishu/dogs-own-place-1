import './globals.css'
import Providers from '@/components/Providers'
import PageEffects from '@/components/effects/PageEffects'
import { SITE } from '@/lib/site'

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} | Premium Dog Services`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: ['dog training', 'dog walking', 'dog grooming', 'dog vaccination', 'dog health checkup', 'pet services India', 'DOP'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website', siteName: SITE.name, title: `${SITE.name} | Premium Dog Services`, description: SITE.description, url: '/', locale: 'en_IN',
    images: [{ url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&auto=format&fit=crop&q=80', width: 1200, height: 800, alt: 'Happy dog' }],
  },
  twitter: { card: 'summary_large_image', title: `${SITE.name} | Premium Dog Services`, description: SITE.description },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: SITE.themeColor,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,600&family=Nunito:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body bg-brand-cream min-h-screen">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <Providers>
          <div id="main-content">{children}</div>
          <PageEffects />
        </Providers>
      </body>
    </html>
  )
}

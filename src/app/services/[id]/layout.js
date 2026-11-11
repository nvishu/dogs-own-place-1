import { SERVICES } from '@/lib/constants'

export function generateMetadata({ params }) {
  const s = SERVICES.find((x) => x.id === params.id)
  if (!s) return { title: 'Service not found' }
  return {
    title: s.title,
    description: s.description,
    alternates: { canonical: `/services/${s.id}` },
    openGraph: { title: s.title, description: s.description, images: [{ url: s.image }] },
  }
}

export default function Layout({ children }) {
  return children
}

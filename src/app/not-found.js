import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata = { title: 'Page not found' }

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 pt-28 pb-16 text-center">
        <div>
          <div className="text-8xl mb-4 animate-float">🐕‍🦺</div>
          <h1 className="section-title mb-3">Oops — this page ran off!</h1>
          <p className="text-brand-brown/70 max-w-md mx-auto mb-8">We sniffed everywhere but couldn&apos;t find what you were looking for.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/" className="btn-primary btn-lg">Back to Home</Link>
            <Link href="/services" className="btn-secondary btn-lg">Browse Services</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

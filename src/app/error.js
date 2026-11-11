'use client'
import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({ error, reset }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-center">
      <div>
        <div className="text-7xl mb-4">🐾</div>
        <h1 className="section-title mb-3">Something went wrong</h1>
        <p className="text-brand-brown/70 max-w-md mx-auto mb-8">An unexpected error occurred. Please try again — if it keeps happening, contact us.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={() => reset()} className="btn-primary btn-lg">Try again</button>
          <Link href="/" className="btn-secondary btn-lg">Go Home</Link>
        </div>
      </div>
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { apiGetDogs, apiDeleteDog } from '@/lib/apiClient'
import Image from 'next/image'

export default function DogsPage() {
  const router = useRouter()
  const [dogs, setDogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    if (!localStorage.getItem('dop_user')) { router.push('/auth/login'); return }
    apiGetDogs()
      .then(d => setDogs(d.dogs || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [router])

  const deleteDog = async (id) => {
    if (!confirm('Remove this dog profile? This cannot be undone.')) return
    setDeleting(id)
    try {
      await apiDeleteDog(id)
      setDogs(prev => prev.filter(d => d._id !== id))
    } catch (err) { alert(err.message) }
    finally { setDeleting(null) }
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <div className="page-container pt-28 pb-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <Link href="/dashboard" className="text-brand-primary text-sm font-semibold mb-2 inline-block hover:underline">← Dashboard</Link>
            <h1 className="font-display text-3xl font-bold text-brand-dark">🐕 My Dogs</h1>
            <p className="text-gray-500 mt-1">Manage dog profiles, health records and vaccinations</p>
          </div>
          <Link href="/dashboard/dogs/add" className="btn-primary">+ Add Dog</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-64 bg-white rounded-3xl animate-pulse shadow-warm"/>)}
          </div>
        ) : dogs.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">🐾</div>
            <h2 className="font-display text-2xl font-bold text-brand-dark mb-3">No Dog Profiles Yet</h2>
            <p className="text-gray-500 mb-8">Add your dog to start tracking health, appointments, and more!</p>
            <Link href="/dashboard/dogs/add" className="btn-primary px-8 py-4 text-base">Add My First Dog 🐕</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
            {dogs.map(dog => (
              <div key={dog._id} className="card group overflow-hidden p-0">
                <div className="relative h-48 overflow-hidden">
                  <Image unoptimized fill sizes="(max-width: 768px) 100vw, 33vw" src={dog.image || 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&auto=format&fit=crop'}
                    alt={dog.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="font-display font-bold text-xl">{dog.name}</div>
                    <div className="text-white/80 text-sm">{dog.breed}</div>
                  </div>
                  <div className="absolute top-3 right-3 flex gap-2">
                    {dog.isVaccinated && <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">💉 Vaccinated</span>}
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                    {[
                      ['Gender', dog.gender || '—'],
                      ['Age', dog.age ? `${dog.age} yr` : '—'],
                      ['Weight', dog.weight ? `${dog.weight} kg` : '—'],
                      ['Color', dog.color || '—'],
                    ].map(([k, v]) => (
                      <div key={k} className="bg-brand-light rounded-lg p-2">
                        <div className="text-xs text-gray-400">{k}</div>
                        <div className="font-semibold text-brand-dark text-xs">{v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/dogs/${dog._id}`}
                      className="flex-1 btn-primary text-sm py-2.5 justify-center">View Profile</Link>
                    <Link href={`/dashboard/appointments?dog=${dog._id}`}
                      className="flex-1 btn-secondary text-sm py-2.5 justify-center">Book Service</Link>
                    <button onClick={() => deleteDog(dog._id)} disabled={deleting === dog._id}
                      className="w-10 flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50">
                      {deleting === dog._id ? '…' : '🗑'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { BREEDS } from '@/lib/constants'
import { apiCreateDog } from '@/lib/apiClient'
import Image from 'next/image'

const DOG_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=300&auto=format&fit=crop&q=80', label: 'Labrador' },
  { url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&auto=format&fit=crop&q=80', label: 'Golden' },
  { url: 'https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=300&auto=format&fit=crop&q=80', label: 'Husky' },
  { url: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=300&auto=format&fit=crop&q=80', label: 'Pug' },
  { url: 'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=300&auto=format&fit=crop&q=80', label: 'Beagle' },
  { url: 'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=300&auto=format&fit=crop&q=80', label: 'Poodle' },
]

export default function AddDogPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [form, setForm] = useState({
    name: '', breed: '', age: '', weight: '', gender: 'Male',
    color: '', microchip: '', healthNotes: '', image: DOG_IMAGES[0].url,
    isVaccinated: false, isNeutered: false,
  })

  useEffect(() => { if (!localStorage.getItem('dop_user')) router.push('/auth/login') }, [router])

  const set = (k, v) => setForm(f => ({...f, [k]: v}))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.breed) { setError('Dog name and breed are required'); return }
    setLoading(true)
    setError('')
    try {
      await apiCreateDog(form)
      router.push('/dashboard/dogs')
    } catch (err) {
      setError(err.message || 'Failed to save dog. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <div className="page-container pt-28 pb-16 max-w-3xl">
        <div className="mb-8">
          <Link href="/dashboard/dogs" className="text-brand-primary text-sm font-semibold hover:underline">← Back to My Dogs</Link>
          <h1 className="font-display text-3xl font-bold text-brand-dark mt-2">Add Dog Profile 🐾</h1>
          <p className="text-gray-500 mt-1">Fill in your dog&apos;s details to track health and book services</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo */}
          <div className="card">
            <h2 className="font-bold text-brand-dark mb-4">📸 Choose a Photo</h2>
            <div className="flex items-center gap-6">
              <Image src={form.image} alt="Selected" width={96} height={96} className="w-24 h-24 rounded-2xl object-cover border-2 border-brand-primary shadow-brand"/>
              <div>
                <button type="button" onClick={() => setPickerOpen(!pickerOpen)}
                  className="btn-secondary text-sm px-4 py-2 mb-2">
                  {pickerOpen ? 'Close Picker' : 'Change Photo'}
                </button>
                <p className="text-xs text-gray-400">Select from our library or we&apos;ll use this default</p>
              </div>
            </div>
            {pickerOpen && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-4">
                {DOG_IMAGES.map(img => (
                  <button type="button" key={img.url} onClick={() => { set('image', img.url); setPickerOpen(false) }}
                    className={`relative rounded-xl overflow-hidden h-20 border-2 transition-all ${form.image === img.url ? 'border-brand-primary scale-105 shadow-brand' : 'border-transparent hover:border-orange-300'}`}>
                    <Image src={img.url} alt={img.label} fill sizes="120px" className="object-cover"/>
                    <span className="absolute bottom-1 left-0 right-0 text-center text-white text-xs font-bold">{img.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Basic info */}
          <div className="card">
            <h2 className="font-bold text-brand-dark mb-4">🐕 Basic Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-brand-dark mb-1.5 block">Dog&apos;s Name *</label>
                <input value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder="e.g. Bruno, Bella, Max" className="input-field" required/>
              </div>
              <div>
                <label className="text-sm font-semibold text-brand-dark mb-1.5 block">Breed *</label>
                <select value={form.breed} onChange={e => set('breed', e.target.value)} className="input-field" required>
                  <option value="">Select breed</option>
                  {BREEDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-brand-dark mb-1.5 block">Gender</label>
                <select value={form.gender} onChange={e => set('gender', e.target.value)} className="input-field">
                  <option>Male</option><option>Female</option><option>Unknown</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-brand-dark mb-1.5 block">Age (years)</label>
                <input type="number" value={form.age} onChange={e => set('age', e.target.value)}
                  placeholder="e.g. 2" min="0" max="25" className="input-field"/>
              </div>
              <div>
                <label className="text-sm font-semibold text-brand-dark mb-1.5 block">Weight (kg)</label>
                <input type="number" value={form.weight} onChange={e => set('weight', e.target.value)}
                  placeholder="e.g. 18" step="0.1" className="input-field"/>
              </div>
              <div>
                <label className="text-sm font-semibold text-brand-dark mb-1.5 block">Coat Color</label>
                <input value={form.color} onChange={e => set('color', e.target.value)}
                  placeholder="e.g. Golden, Black & White" className="input-field"/>
              </div>
            </div>
          </div>

          {/* Health */}
          <div className="card">
            <h2 className="font-bold text-brand-dark mb-4">🩺 Health Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-gray-100 cursor-pointer hover:border-brand-primary transition-colors">
                <input type="checkbox" checked={form.isVaccinated} onChange={e => set('isVaccinated', e.target.checked)} className="w-4 h-4 accent-brand-primary"/>
                <span className="font-semibold text-brand-dark text-sm">💉 Vaccinated</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-gray-100 cursor-pointer hover:border-brand-primary transition-colors">
                <input type="checkbox" checked={form.isNeutered} onChange={e => set('isNeutered', e.target.checked)} className="w-4 h-4 accent-brand-primary"/>
                <span className="font-semibold text-brand-dark text-sm">✂️ Neutered/Spayed</span>
              </label>
            </div>
            <div>
              <label className="text-sm font-semibold text-brand-dark mb-1.5 block">Microchip ID (optional)</label>
              <input value={form.microchip} onChange={e => set('microchip', e.target.value)}
                placeholder="Enter 15-digit microchip number" className="input-field mb-3"/>
            </div>
            <div>
              <label className="text-sm font-semibold text-brand-dark mb-1.5 block">Health Notes (optional)</label>
              <textarea value={form.healthNotes} onChange={e => set('healthNotes', e.target.value)}
                placeholder="Allergies, medications, special conditions..." className="input-field resize-none h-24"/>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading}
              className="btn-primary flex-1 justify-center py-4 text-base disabled:opacity-60">
              {loading
                ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Saving to MongoDB...</span>
                : '🐾 Save Dog Profile'}
            </button>
            <Link href="/dashboard/dogs" className="btn-secondary px-6 py-4">Cancel</Link>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  )
}

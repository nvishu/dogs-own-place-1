'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { SERVICES } from '@/lib/constants'
import { apiGetDogs, apiGetAppointments, apiCreateAppointment, apiCancelAppointment } from '@/lib/apiClient'

const TIME_SLOTS = ['08:00 AM','09:00 AM','10:00 AM','11:00 AM','12:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM','06:00 PM']

const STATUS_COLORS = {
  confirmed: 'bg-blue-100 text-blue-700',
  pending:   'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
  in_progress:'bg-purple-100 text-purple-700',
}

function AppointmentsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState(null)
  const [dogs, setDogs] = useState([])
  const [appointments, setAppointments] = useState([])
  const [view, setView] = useState(searchParams.get('service') ? 'book' : 'list')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [booked, setBooked] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    service: searchParams.get('service') || '',
    dogId: searchParams.get('dog') || '',
    plan: 'standard', date: '', time: '', notes: '', address: '', homeVisit: false,
  })

  useEffect(() => {
    const stored = localStorage.getItem('dop_user')
    if (!stored) { router.push('/auth/login'); return }
    setUser(JSON.parse(stored))
    Promise.all([apiGetDogs(), apiGetAppointments()])
      .then(([d, a]) => { setDogs(d.dogs || []); setAppointments(a.appointments || []) })
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [router])

  const set = (k, v) => setForm(f => ({...f, [k]: v}))
  const selectedService = SERVICES.find(s => s.id === form.service)
  const selectedDog = dogs.find(d => d._id === form.dogId)
  const price = selectedService?.price[form.plan] || 0
  const totalPrice = form.homeVisit ? price + 200 : price
  const getMinDate = () => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0] }

  const handleBook = async () => {
    if (!form.service || !form.date || !form.time) { setError('Please select service, date and time'); return }
    setLoading(true); setError('')
    try {
      const appt = await apiCreateAppointment({
        serviceId: form.service,
        serviceName: selectedService?.title,
        dogId: form.dogId || null,
        plan: form.plan, date: form.date, time: form.time,
        notes: form.notes, address: form.address,
        homeVisit: form.homeVisit, price: totalPrice,
      })
      setAppointments(prev => [appt.appointment, ...prev])
      setBooked(true)
    } catch (err) { setError(err.message || 'Booking failed. Please try again.') }
    finally { setLoading(false) }
  }

  const handleCancel = async (id) => {
    if (!confirm('Cancel this appointment?')) return
    try {
      await apiCancelAppointment(id, 'Cancelled by user')
      setAppointments(prev => prev.map(a => a._id === id ? {...a, status: 'cancelled'} : a))
    } catch (err) { alert(err.message) }
  }

  if (!user) return <div className="min-h-screen flex items-center justify-center text-4xl animate-bounce">🐾</div>

  if (booked) return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <div className="page-container pt-28 pb-16 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="w-28 h-28 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 text-6xl animate-bounce">🎉</div>
          <h1 className="font-display text-3xl font-bold text-brand-dark mb-2">Appointment Booked!</h1>
          <p className="text-gray-500 mb-2">Your <strong>{selectedService?.title}</strong> is confirmed for {form.date} at {form.time}</p>
          <p className="text-brand-primary font-bold text-xl mb-8">₹{totalPrice.toLocaleString()}</p>
          <div className="flex flex-col gap-3">
            <Link href="/payment" className="btn-primary justify-center py-4">💳 Pay Now</Link>
            <button onClick={() => { setBooked(false); setView('list'); setForm({ service:'', dogId:'', plan:'standard', date:'', time:'', notes:'', address:'', homeVisit:false }) }}
              className="btn-secondary justify-center py-3">View All Appointments</button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <div className="page-container pt-28 pb-16">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <Link href="/dashboard" className="text-brand-primary text-sm font-semibold mb-2 inline-block hover:underline">← Dashboard</Link>
            <h1 className="font-display text-3xl font-bold text-brand-dark">📅 Appointments</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setView('list')} className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${view==='list'?'bg-brand-primary text-white':'bg-white text-gray-600 border border-gray-200 hover:border-brand-primary'}`}>My Bookings</button>
            <button onClick={() => setView('book')} className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${view==='book'?'bg-brand-primary text-white':'bg-white text-gray-600 border border-gray-200 hover:border-brand-primary'}`}>+ Book New</button>
          </div>
        </div>

        {view === 'list' ? (
          fetching ? (
            <div className="space-y-4">{[1,2,3].map(i=><div key={i} className="h-24 bg-white rounded-2xl animate-pulse"/>)}</div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-7xl mb-4">📅</div>
              <h2 className="font-display text-2xl font-bold text-brand-dark mb-3">No Appointments Yet</h2>
              <button onClick={() => setView('book')} className="btn-primary px-8 py-4">Book Your First Service 🐾</button>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map(appt => {
                const svc = SERVICES.find(s => s.id === appt.serviceId)
                return (
                  <div key={appt._id} className="card flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-brand-light flex items-center justify-center text-3xl flex-shrink-0">{svc?.icon || '🐾'}</div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-brand-dark">{appt.serviceName}</h3>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${STATUS_COLORS[appt.status] || 'bg-gray-100 text-gray-600'}`}>{appt.status}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${appt.paymentStatus==='paid'?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>
                          {appt.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Unpaid'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">{appt.dogName || 'No dog'} · {appt.date} at {appt.time} · <span className="capitalize">{appt.plan}</span> plan</div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <div className="font-bold text-brand-primary text-lg">₹{appt.price?.toLocaleString()}</div>
                      </div>
                      <div className="flex gap-2">
                        {appt.paymentStatus !== 'paid' && appt.status !== 'cancelled' && (
                          <Link href="/payment" className="btn-primary text-xs px-3 py-2">Pay</Link>
                        )}
                        {(appt.status === 'confirmed' || appt.status === 'pending') && (
                          <button onClick={() => handleCancel(appt._id)}
                            className="text-xs px-3 py-2 border border-red-200 text-red-500 rounded-full hover:bg-red-50 transition-colors">
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        ) : (
          /* Book form */
          <div className="max-w-2xl mx-auto space-y-6">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">⚠️ {error}</div>}

            <div className="card">
              <h2 className="font-bold text-brand-dark mb-4">🐾 Select Service</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SERVICES.map(s => (
                  <button key={s.id} type="button" onClick={() => set('service', s.id)}
                    className={`p-3 rounded-2xl border-2 text-center transition-all ${form.service===s.id?'border-brand-primary bg-brand-light shadow-brand scale-105':'border-gray-100 hover:border-brand-primary'}`}>
                    <div className="text-2xl mb-1">{s.icon}</div>
                    <div className="text-xs font-bold text-brand-dark leading-tight">{s.title}</div>
                    <div className="text-xs text-brand-primary font-semibold">₹{s.price.basic}+</div>
                  </button>
                ))}
              </div>
            </div>

            {form.service && (
              <div className="card">
                <h2 className="font-bold text-brand-dark mb-4">📋 Plan & Dog</h2>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {['basic','standard','premium'].map(p => (
                    <button key={p} type="button" onClick={() => set('plan', p)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${form.plan===p?'border-brand-primary bg-orange-50':'border-gray-100 hover:border-orange-300'}`}>
                      <div className="text-xs text-gray-500 capitalize">{p}</div>
                      <div className="font-bold text-brand-primary">₹{selectedService?.price[p].toLocaleString()}</div>
                    </button>
                  ))}
                </div>
                {dogs.length > 0 && (
                  <select value={form.dogId} onChange={e => set('dogId', e.target.value)} className="input-field">
                    <option value="">Select a dog (optional)</option>
                    {dogs.map(d => <option key={d._id} value={d._id}>{d.name} ({d.breed})</option>)}
                  </select>
                )}
              </div>
            )}

            {form.service && (
              <div className="card">
                <h2 className="font-bold text-brand-dark mb-4">📅 Date & Time</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-semibold text-brand-dark mb-1.5 block">Date</label>
                    <input type="date" value={form.date} min={getMinDate()} onChange={e => set('date', e.target.value)} className="input-field"/>
                  </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
                  {TIME_SLOTS.map(t => (
                    <button key={t} type="button" onClick={() => set('time', t)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border-2 transition-all ${form.time===t?'border-brand-primary bg-brand-light text-brand-primary':'border-gray-100 text-gray-500 hover:border-orange-300'}`}>
                      {t}
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-3 cursor-pointer mb-4">
                  <input type="checkbox" checked={form.homeVisit} onChange={e => set('homeVisit', e.target.checked)} className="w-4 h-4 accent-brand-primary"/>
                  <span className="text-sm font-medium text-brand-dark">🏠 Home visit (+₹200)</span>
                </label>
                {form.homeVisit && (
                  <textarea value={form.address} onChange={e => set('address', e.target.value)}
                    placeholder="Enter your full address for the home visit" className="input-field resize-none h-20"/>
                )}
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                  placeholder="Any special instructions or notes..." className="input-field resize-none h-16 mt-3"/>
              </div>
            )}

            {form.service && form.date && form.time && (
              <div className="card bg-orange-gradient text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white/80 text-sm">Total Amount</div>
                    <div className="font-display font-bold text-4xl">₹{totalPrice.toLocaleString()}</div>
                    {form.homeVisit && <div className="text-white/70 text-xs mt-1">Includes ₹200 home visit fee</div>}
                  </div>
                  <button onClick={handleBook} disabled={loading}
                    className="bg-white text-brand-primary font-bold px-6 py-3 rounded-full hover:bg-brand-cream transition-colors shadow-warm disabled:opacity-60">
                    {loading
                      ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"/>Booking...</span>
                      : 'Confirm Booking →'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default function AppointmentsPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-4xl animate-bounce">🐾</div>}><AppointmentsContent /></Suspense>
}

'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { apiGetDog, apiGetAppointments, apiAddHealthRecord } from '@/lib/apiClient'
import Image from 'next/image'
import toast from 'react-hot-toast'

const fmt = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '')

export default function DogProfilePage() {
  const router = useRouter()
  const params = useParams()
  const [dog, setDog] = useState(null)
  const [appts, setAppts] = useState([])
  const [tab, setTab] = useState('overview')
  const [addingVax, setAddingVax] = useState(false)
  const [saving, setSaving] = useState(false)
  const [vaxForm, setVaxForm] = useState({ name: '', date: '', next: '' })

  useEffect(() => {
    if (!localStorage.getItem('dop_user')) { router.push('/auth/login'); return }
    let cancelled = false
    Promise.all([apiGetDog(params.id), apiGetAppointments().catch(() => ({ appointments: [] }))])
      .then(([d, a]) => {
        if (cancelled) return
        setDog(d.dog)
        setAppts((a.appointments || []).filter(x => x.dog?._id === params.id))
      })
      .catch(() => { if (!cancelled) router.push('/dashboard/dogs') })
    return () => { cancelled = true }
  }, [params.id, router])

  const saveVax = async () => {
    if (!vaxForm.name || !vaxForm.date || saving) return
    setSaving(true)
    try {
      const res = await apiAddHealthRecord(dog._id, {
        type: 'vaccination', title: vaxForm.name, date: vaxForm.date, nextDueDate: vaxForm.next || undefined,
      })
      setDog(res.dog)
      setAddingVax(false)
      setVaxForm({ name: '', date: '', next: '' })
      toast.success('Vaccination record saved')
    } catch (err) {
      toast.error(err.message || 'Could not save the record')
    } finally {
      setSaving(false)
    }
  }

  if (!dog) return <div className="min-h-screen flex items-center justify-center text-4xl animate-bounce">🐾</div>

  // Vaccination records come from the dog's healthRecords stored in MongoDB
  const vaccinations = (dog.healthRecords || [])
    .filter(r => r.type === 'vaccination')
    .map(r => ({ name: r.title, date: fmt(r.date), next: fmt(r.nextDueDate) }))
  const allAppts = appts

  const tabs = ['overview', 'vaccinations', 'appointments', 'health']

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <div className="page-container pt-28 pb-16">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-brand-primary">Dashboard</Link>
          <span>/</span>
          <Link href="/dashboard/dogs" className="hover:text-brand-primary">My Dogs</Link>
          <span>/</span>
          <span className="text-brand-primary font-semibold">{dog.name}</span>
        </div>

        {/* Hero */}
        <div className="card mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-orange-gradient opacity-5" />
          <div className="relative flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <div className="relative w-32 h-32 rounded-3xl overflow-hidden flex-shrink-0 shadow-brand border-4 border-white">
              {dog.image ? <Image unoptimized fill sizes="128px" src={dog.image} alt={dog.name} className="object-cover"/> : <div className="w-full h-full bg-orange-100 flex items-center justify-center text-5xl">🐕</div>}
            </div>
            <div className="flex-1">
              <h1 className="font-display text-3xl font-bold text-brand-dark">{dog.name}</h1>
              <p className="text-gray-500 text-lg">{dog.breed}</p>
              <div className="flex flex-wrap gap-3 mt-3">
                {[
                  dog.gender && `${dog.gender==='Male'?'♂':'♀'} ${dog.gender}`,
                  dog.age && `🎂 ${dog.age} years`,
                  dog.weight && `⚖️ ${dog.weight} kg`,
                  dog.color && `🎨 ${dog.color}`,
                ].filter(Boolean).map(info => (
                  <span key={info} className="badge bg-orange-100 text-brand-dark text-sm">{info}</span>
                ))}
              </div>
              {dog.microchip && <p className="text-xs text-gray-400 mt-2">🔖 Microchip: {dog.microchip}</p>}
            </div>
            <div className="flex gap-3">
              <Link href={"/dashboard/appointments?dog="+dog._id} className="btn-primary text-sm px-5 py-2">📅 Book Service</Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={"px-5 py-2.5 rounded-full font-semibold text-sm capitalize transition-all whitespace-nowrap "+
                (tab===t ? 'bg-brand-primary text-white shadow-brand' : 'bg-white text-brand-dark hover:bg-brand-light border border-orange-100')}>
              {t==='overview'?'📋':t==='vaccinations'?'💉':t==='appointments'?'📅':'🩺'} {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-bold text-brand-dark mb-4">📋 Dog Details</h3>
              <div className="space-y-3 text-sm">
                {[
                  ['Name', dog.name], ['Breed', dog.breed], ['Age', dog.age ? dog.age+' years' : '-'],
                  ['Weight', dog.weight ? dog.weight+' kg' : '-'], ['Gender', dog.gender||'-'],
                  ['Color', dog.color||'-'], ['Microchip', dog.microchip||'Not registered'],
                ].map(([label,value]) => (
                  <div key={label} className="flex justify-between py-2 border-b border-orange-50">
                    <span className="text-gray-400">{label}</span>
                    <span className="font-semibold text-brand-dark">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {dog.healthNotes && (
                <div className="card">
                  <h3 className="font-bold text-brand-dark mb-3">🩺 Health Notes</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{dog.healthNotes}</p>
                </div>
              )}
              <div className="card">
                <h3 className="font-bold text-brand-dark mb-3">💉 Vaccination Summary</h3>
                {vaccinations.length === 0
                  ? <p className="text-gray-400 text-sm">No vaccination records. <button onClick={() => setTab('vaccinations')} className="text-brand-primary font-semibold hover:underline">Add now →</button></p>
                  : vaccinations.map((v,i) => (
                    <div key={i} className="flex items-center justify-between py-2 text-sm">
                      <span className="text-gray-700">{v.name}</span>
                      <span className={"badge "+((v.next && new Date(v.next)>new Date())?'bg-green-100 text-green-700':'bg-red-100 text-red-700')}>
                        {(v.next && new Date(v.next)>new Date())?'✓ Current':'⚠ Overdue'}
                      </span>
                    </div>
                  ))
                }
              </div>
              <div className="card bg-brand-light border-2 border-brand-primary text-center py-6">
                <div className="text-4xl mb-2">📅</div>
                <p className="font-bold text-brand-dark mb-3">Ready to book a service for {dog.name}?</p>
                <Link href={"/dashboard/appointments?dog="+dog._id} className="btn-primary text-sm px-6 py-2.5">Book Now →</Link>
              </div>
            </div>
          </div>
        )}

        {/* Vaccinations Tab */}
        {tab === 'vaccinations' && (
          <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold text-brand-dark">💉 Vaccination Records</h2>
              <button onClick={() => setAddingVax(!addingVax)} className="btn-primary text-sm px-4 py-2">+ Add Record</button>
            </div>
            {addingVax && (
              <div className="card mb-5 border-2 border-brand-primary">
                <h3 className="font-bold text-brand-dark mb-4">Add Vaccination</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Vaccine Name</label>
                    <select value={vaxForm.name} onChange={e => setVaxForm({...vaxForm,name:e.target.value})} className="input-field text-sm">
                      <option value="">Select...</option>
                      {['Rabies','DHPP (5-in-1)','Bordetella','Leptospirosis','Lyme Disease','Influenza','Deworming'].map(v => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Date Given</label>
                    <input type="date" value={vaxForm.date} onChange={e => setVaxForm({...vaxForm,date:e.target.value})} className="input-field text-sm"/>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1 block">Next Due Date</label>
                    <input type="date" value={vaxForm.next} onChange={e => setVaxForm({...vaxForm,next:e.target.value})} className="input-field text-sm"/>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setAddingVax(false)} className="btn-secondary flex-1 text-sm py-2">Cancel</button>
                  <button onClick={saveVax} disabled={saving} className="btn-primary flex-1 text-sm py-2 disabled:opacity-60">{saving ? 'Saving…' : 'Save Record'}</button>
                </div>
              </div>
            )}
            {vaccinations.length === 0 ? (
              <div className="card text-center py-12">
                <div className="text-6xl mb-4">💉</div>
                <p className="text-gray-400 mb-3">No vaccination records yet.</p>
                <button onClick={() => setAddingVax(true)} className="btn-primary">Add First Vaccine</button>
              </div>
            ) : (
              <div className="space-y-3">
                {vaccinations.map((v,i) => (
                  <div key={i} className="card flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">💉</span>
                      <div>
                        <div className="font-bold text-brand-dark">{v.name}</div>
                        <div className="text-sm text-gray-500">Given: {v.date} • Next: {v.next}</div>
                      </div>
                    </div>
                    <span className={"badge "+((v.next && new Date(v.next)>new Date())?'bg-green-100 text-green-700':'bg-red-100 text-red-700')}>
                      {(v.next && new Date(v.next)>new Date())?'✓ Up to date':'⚠ Overdue'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Appointments Tab */}
        {tab === 'appointments' && (
          <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold text-brand-dark">📅 Appointment History</h2>
              <Link href={"/dashboard/appointments?dog="+dog._id} className="btn-primary text-sm px-4 py-2">+ Book Now</Link>
            </div>
            {allAppts.length === 0 ? (
              <div className="card text-center py-12">
                <div className="text-6xl mb-4">📅</div>
                <p className="text-gray-400 mb-3">No appointments booked for {dog.name} yet.</p>
                <Link href={"/dashboard/appointments?dog="+dog._id} className="btn-primary">Book First Service</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {allAppts.map(a => (
                  <div key={a._id} className="card flex items-center justify-between">
                    <div>
                      <div className="font-bold text-brand-dark">{a.serviceName}</div>
                      <div className="text-sm text-gray-500">{a.date} at {a.time} • {a.plan} plan</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-brand-primary">₹{Number(a.price).toLocaleString()}</div>
                      <span className="badge bg-green-100 text-green-700 text-xs capitalize">{(a.status || 'confirmed').replace('_', ' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Health Tab */}
        {tab === 'health' && (
          <div className="max-w-2xl">
            <h2 className="font-display text-xl font-bold text-brand-dark mb-5">🩺 Health Overview</h2>
            <div className="space-y-4">
              <div className="card">
                <h3 className="font-bold text-brand-dark mb-3">Health Notes</h3>
                <p className="text-gray-600">{dog.healthNotes || 'No health notes on file.'}</p>
              </div>
              <div className="card bg-blue-50 border border-blue-200">
                <h3 className="font-bold text-blue-800 mb-2">💡 Health Recommendation</h3>
                <p className="text-blue-700 text-sm">
                  {dog.age > 7 ? `${dog.name} is a senior dog. We recommend bi-annual full checkups.` :
                   dog.age < 1 ? `${dog.name} is a puppy! Initial vaccination series and monthly checkups are important.` :
                   `${dog.name} should have a full health checkup every 6 months to stay in top shape.`}
                </p>
                <Link href="/dashboard/appointments?service=healthcheckup" className="btn-primary mt-3 text-sm px-4 py-2 inline-flex">Book Health Checkup →</Link>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

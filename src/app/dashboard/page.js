'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { SERVICES } from '@/lib/constants'
import { apiGetDogs, apiGetAppointments, apiLogout } from '@/lib/apiClient'
import Image from 'next/image'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [dogs, setDogs] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('dop_user')
    if (!stored) { router.push('/auth/login'); return }
    const u = JSON.parse(stored)
    setUser(u)
    Promise.all([apiGetDogs(), apiGetAppointments()])
      .then(([dogsData, apptData]) => {
        setDogs(dogsData.dogs || [])
        setAppointments(apptData.appointments || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [router])

  if (!user) return <div className="min-h-screen flex items-center justify-center"><div className="text-4xl animate-bounce">🐾</div></div>

  const upcoming = appointments.filter(a => a.status === 'confirmed' || a.status === 'pending')
  const totalSpent = appointments.filter(a => a.paymentStatus === 'paid').reduce((s, a) => s + (a.price || 0), 0)

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <div className="page-container pt-28 pb-16">
        {/* Welcome */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
          <div>
            <div className="text-brand-primary font-semibold text-sm mb-1">Welcome back 👋</div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-dark">{user.name}</h1>
            <p className="text-gray-500 mt-1">{user.email} {user.city ? `• ${user.city}` : ''}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard/dogs/add" className="btn-secondary px-5 py-2.5 text-sm">+ Add Dog</Link>
            <Link href="/dashboard/appointments" className="btn-primary px-5 py-2.5 text-sm">📅 Book Service</Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 stagger">
          {[
            { icon:'🐕', label:'My Dogs', value: loading ? '…' : dogs.length, href:'/dashboard/dogs', color:'bg-orange-50 border-orange-200' },
            { icon:'📅', label:'Total Bookings', value: loading ? '…' : appointments.length, href:'/dashboard/appointments', color:'bg-blue-50 border-blue-200' },
            { icon:'⏳', label:'Upcoming', value: loading ? '…' : upcoming.length, href:'/dashboard/appointments', color:'bg-green-50 border-green-200' },
            { icon:'💰', label:'Total Spent', value: loading ? '…' : `₹${(totalSpent/1000).toFixed(1)}K`, href:'/payment', color:'bg-amber-50 border-amber-200' },
          ].map(stat => (
            <Link key={stat.label} href={stat.href}
              className={`card border-2 text-center hover:scale-105 cursor-pointer ${stat.color}`}>
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="font-display font-bold text-3xl text-brand-dark">{stat.value}</div>
              <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Dogs */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-brand-dark text-lg">🐕 My Dogs</h2>
              <Link href="/dashboard/dogs" className="text-brand-primary text-sm font-semibold hover:underline">View All</Link>
            </div>
            {loading ? (
              <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
            ) : dogs.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-2">🐾</div>
                <p className="text-gray-500 text-sm mb-3">No dogs added yet</p>
                <Link href="/dashboard/dogs/add" className="btn-primary text-sm px-4 py-2">Add My Dog</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {dogs.slice(0, 3).map(dog => (
                  <Link key={dog._id} href={`/dashboard/dogs/${dog._id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-brand-light transition-colors">
                    <Image unoptimized width={48} height={48} src={dog.image || 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=100&auto=format&fit=crop'} alt={dog.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-orange-100"/>
                    <div>
                      <div className="font-bold text-brand-dark">{dog.name}</div>
                      <div className="text-xs text-gray-500">{dog.breed} {dog.gender ? `· ${dog.gender}` : ''}</div>
                    </div>
                    <span className="ml-auto text-xs text-brand-primary">→</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Appointments */}
          <div className="card lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-brand-dark text-lg">📅 Upcoming Appointments</h2>
              <Link href="/dashboard/appointments" className="text-brand-primary text-sm font-semibold hover:underline">View All</Link>
            </div>
            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse"/>)}</div>
            ) : upcoming.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">📅</div>
                <p className="text-gray-500 mb-4">No upcoming appointments</p>
                <Link href="/dashboard/appointments" className="btn-primary text-sm px-6 py-2.5">Book a Service</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.slice(0, 4).map(appt => {
                  const svc = SERVICES.find(s => s.id === appt.serviceId)
                  return (
                    <div key={appt._id} className="flex items-center gap-4 p-4 rounded-2xl bg-brand-light hover:bg-orange-100 transition-colors">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-2xl shadow-sm flex-shrink-0">
                        {svc?.icon || '🐾'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-brand-dark text-sm truncate">{appt.serviceName}</div>
                        <div className="text-xs text-gray-500">{appt.dogName || 'No dog'} · {appt.date} at {appt.time}</div>
                        <div className="text-xs text-gray-400 capitalize">{appt.plan} plan</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-brand-primary text-sm">₹{appt.price?.toLocaleString()}</div>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          appt.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {appt.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick book services */}
        <div className="mt-10">
          <h2 className="font-bold text-brand-dark text-lg mb-5">🐾 Quick Book a Service</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {SERVICES.map(s => (
              <Link key={s.id} href={`/dashboard/appointments?service=${s.id}`}
                className="card p-4 text-center hover:border-brand-primary hover:border-2 hover:shadow-brand group cursor-pointer">
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{s.icon}</div>
                <div className="text-xs font-bold text-brand-dark leading-tight">{s.title}</div>
                <div className="text-xs text-brand-primary font-semibold mt-1">₹{s.price.basic}+</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

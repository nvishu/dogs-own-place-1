'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SERVICES } from '@/lib/constants'
import DogLogo from '@/components/ui/DogLogo'
import {
  Users, Calendar, CreditCard, Settings, BarChart3, LogOut,
  Shield, Search, Trash2, TrendingUp, Menu, Bell, Save, Edit3, X, Eye, Mail
} from 'lucide-react'
import Image from 'next/image'
import MessagesTab from '@/components/admin/MessagesTab'
import {
  apiAdminStats, apiAdminUsers, apiAdminToggleUser, apiAdminDeleteUser,
  apiAdminBookings, apiAdminUpdateBooking, apiLogout
} from '@/lib/apiClient'

const STATUS_COLOR = {
  confirmed:'bg-blue-100 text-blue-700', pending:'bg-yellow-100 text-yellow-700',
  completed:'bg-green-100 text-green-700', cancelled:'bg-red-100 text-red-600',
  in_progress:'bg-purple-100 text-purple-700',
}

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-warm hover:shadow-warm-lg transition-all hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
        <TrendingUp size={14} className="text-green-500 mt-1" />
      </div>
      <div className="font-display font-bold text-2xl text-brand-dark">{value}</div>
      <div className="text-sm font-semibold text-gray-500 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-green-600 font-medium mt-1">{sub}</div>}
    </div>
  )
}

function OverviewTab({ stats }) {
  if (!stats) return <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i=><div key={i} className="h-32 bg-white rounded-2xl animate-pulse"/>)}</div>
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}    label="Total Users"    value={stats.stats.totalUsers}    sub="Registered users"          color="bg-blue-500"/>
        <StatCard icon={Calendar} label="Total Bookings" value={stats.stats.totalBookings} sub="All appointments"           color="bg-brand-primary"/>
        <StatCard icon={CreditCard} label="Revenue"      value={`₹${((stats.stats.totalRevenue||0)/1000).toFixed(1)}K`} sub="Total paid" color="bg-green-500"/>
        <StatCard icon={Shield}   label="Total Dogs"     value={stats.stats.totalDogs}     sub="Dog profiles"              color="bg-purple-500"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-warm p-5">
          <h3 className="font-bold text-brand-dark mb-4 flex items-center gap-2"><Calendar size={16}/> Recent Bookings</h3>
          {(stats.recentBookings || []).length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No bookings yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentBookings.map(b => (
                <div key={b._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-brand-light transition-colors">
                  <div className="w-9 h-9 rounded-full bg-brand-light flex items-center justify-center text-lg flex-shrink-0">
                    {SERVICES.find(s => s.id === b.serviceId)?.icon || '🐾'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-brand-dark text-sm truncate">{b.user?.name || 'Unknown'}</div>
                    <div className="text-xs text-gray-400">{b.serviceName} · {b.date}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-brand-primary text-sm">₹{b.price?.toLocaleString()}</div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_COLOR[b.status]||'bg-gray-100 text-gray-600'}`}>{b.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl shadow-warm p-5">
          <h3 className="font-bold text-brand-dark mb-4 flex items-center gap-2"><BarChart3 size={16}/> Revenue by Service</h3>
          {(stats.revenueByService || []).length === 0
            ? <p className="text-gray-400 text-sm text-center py-8">No revenue data yet</p>
            : (
              <div className="space-y-3">
                {stats.revenueByService.map((s, i) => (
                  <div key={s._id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-600 truncate">{s._id}</span>
                      <span className="text-xs font-bold text-brand-primary ml-2 flex-shrink-0">₹{(s.revenue/1000).toFixed(1)}K</span>
                    </div>
                    <div className="h-1.5 bg-orange-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-primary rounded-full"
                        style={{ width: `${stats.revenueByService[0] ? Math.min(100, (s.revenue/stats.revenueByService[0].revenue)*100) : 0}%` }}/>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  )
}

function UsersTab() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    apiAdminUsers().then(d => setUsers(d.users||[])).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  const onSearch = (v) => {
    setSearch(v)
    clearTimeout(window._uTimer)
    window._uTimer = setTimeout(() => {
      apiAdminUsers(v).then(d => setUsers(d.users||[])).catch(()=>{})
    }, 400)
  }

  const toggleUser = async (id, current) => {
    await apiAdminToggleUser(id, !current)
    setUsers(prev => prev.map(u => u._id === id ? {...u, isActive: !current} : u))
  }

  const deleteUser = async (id) => {
    if (!confirm('Delete this user permanently?')) return
    await apiAdminDeleteUser(id)
    setUsers(prev => prev.filter(u => u._id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
        <input value={search} onChange={e => onSearch(e.target.value)} placeholder="Search users..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-orange-100 bg-white text-sm focus:outline-none focus:border-brand-primary"/>
      </div>
      <div className="bg-white rounded-2xl shadow-warm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Loading users from MongoDB...</div> : (
            <table className="w-full text-sm">
              <thead className="bg-brand-light border-b border-orange-100">
                <tr>{['User','Email','Phone','City','Role','Joined','Status','Actions'].map(h=>(
                  <th key={h} className="px-4 py-3 text-left font-bold text-brand-dark text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-orange-50">
                {users.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">No users found</td></tr>
                ) : users.map(u => (
                  <tr key={u._id} className="hover:bg-brand-light/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {u.name?.[0]?.toUpperCase()||'U'}
                        </div>
                        <span className="font-semibold text-brand-dark whitespace-nowrap">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{u.phone||'—'}</td>
                    <td className="px-4 py-3 text-gray-600">{u.city||'—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${u.role==='admin'?'bg-amber-100 text-amber-700':'bg-blue-50 text-blue-600'}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleUser(u._id, u.isActive)}
                        className={`px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${u.isActive?'bg-green-100 text-green-700 hover:bg-green-200':'bg-red-100 text-red-600 hover:bg-red-200'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteUser(u._id)}
                        className="w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors">
                        <Trash2 size={12}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="px-4 py-3 border-t border-orange-100 text-xs text-gray-400">{users.length} users from MongoDB</div>
      </div>
    </div>
  )
}

function BookingsTab() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    apiAdminBookings(statusFilter).then(d => setBookings(d.bookings||[])).catch(()=>{}).finally(()=>setLoading(false))
  }, [statusFilter])

  const updateStatus = async (id, status) => {
    await apiAdminUpdateBooking(id, status)
    setBookings(prev => prev.map(b => b._id === id ? {...b, status} : b))
  }

  const filtered = bookings.filter(b =>
    b.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.serviceName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search bookings..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-orange-100 bg-white text-sm focus:outline-none focus:border-brand-primary"/>
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-orange-100 bg-white text-sm font-semibold focus:outline-none focus:border-brand-primary">
          {['all','pending','confirmed','in_progress','completed','cancelled'].map(s => (
            <option key={s} value={s} className="capitalize">{s === 'all' ? 'All Statuses' : s}</option>
          ))}
        </select>
      </div>
      <div className="bg-white rounded-2xl shadow-warm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Loading bookings from MongoDB...</div> : (
            <table className="w-full text-sm">
              <thead className="bg-brand-light border-b border-orange-100">
                <tr>{['Customer','Dog','Service','Plan','Date','Price','Payment','Status','Update'].map(h=>(
                  <th key={h} className="px-4 py-3 text-left font-bold text-brand-dark text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-orange-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-12 text-gray-400">No bookings found</td></tr>
                ) : filtered.map(b => (
                  <tr key={b._id} className="hover:bg-brand-light/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-brand-dark whitespace-nowrap">{b.user?.name||'Unknown'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{b.dogName||b.dog?.name||'—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{b.serviceName}</td>
                    <td className="px-4 py-3"><span className="capitalize px-2 py-0.5 bg-orange-100 text-brand-primary rounded-full text-xs font-bold">{b.plan}</span></td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{b.date} {b.time}</td>
                    <td className="px-4 py-3 font-bold text-brand-primary">₹{b.price?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${b.paymentStatus==='paid'?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>
                        {b.paymentStatus==='paid'?'✓ Paid':'⏳ Unpaid'}
                      </span>
                    </td>
                    <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_COLOR[b.status]||'bg-gray-100 text-gray-600'}`}>{b.status}</span></td>
                    <td className="px-4 py-3">
                      <select value={b.status} onChange={e => updateStatus(b._id, e.target.value)}
                        className="text-xs px-2 py-1 rounded-lg border border-orange-100 bg-white focus:outline-none focus:border-brand-primary cursor-pointer">
                        {['pending','confirmed','in_progress','completed','cancelled'].map(s=>(
                          <option key={s} value={s} className="capitalize">{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="px-4 py-3 border-t border-orange-100 text-xs text-gray-400">{filtered.length} bookings from MongoDB</div>
      </div>
    </div>
  )
}

function ServicesTab({ services, setServices }) {
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({})
  const startEdit = (s) => { setEditing(s.id); setEditForm({ ...s.price, title: s.title, shortDesc: s.shortDesc }) }
  const saveEdit = (id) => {
    setServices(prev => prev.map(s => s.id === id ? {
      ...s, title: editForm.title, shortDesc: editForm.shortDesc,
      price: { basic: Number(editForm.basic), standard: Number(editForm.standard), premium: Number(editForm.premium) }
    } : s))
    setEditing(null)
  }
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        💡 Service edits here are in-memory for this session. To persist pricing to MongoDB, connect a Services collection via the API.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {services.map(s => (
          <div key={s.id} className="bg-white rounded-2xl shadow-warm overflow-hidden">
            <div className="relative h-28">
              <Image fill sizes="(max-width: 768px) 100vw, 50vw" src={s.image} alt={s.title} className="w-full h-full object-cover"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
              <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white">
                <span className="text-2xl">{s.icon}</span>
                <div><div className="font-bold text-sm">{s.title}</div><div className="text-xs text-white/70">⏱ {s.duration}</div></div>
              </div>
              <button onClick={() => editing===s.id ? setEditing(null) : startEdit(s)}
                className="absolute top-3 right-3 bg-white/90 text-brand-dark rounded-full p-1.5 hover:bg-white">
                {editing===s.id ? <X size={13}/> : <Edit3 size={13}/>}
              </button>
            </div>
            {editing===s.id ? (
              <div className="p-4 space-y-3 bg-orange-50">
                <input value={editForm.title} onChange={e => setEditForm(f=>({...f,title:e.target.value}))}
                  className="w-full px-3 py-2 rounded-xl border border-orange-200 text-sm focus:outline-none"/>
                <input value={editForm.shortDesc} onChange={e => setEditForm(f=>({...f,shortDesc:e.target.value}))}
                  className="w-full px-3 py-2 rounded-xl border border-orange-200 text-sm focus:outline-none"/>
                <div className="grid grid-cols-3 gap-2">
                  {['basic','standard','premium'].map(p => (
                    <div key={p}>
                      <label className="text-xs text-gray-500 capitalize">{p} ₹</label>
                      <input type="number" value={editForm[p]} onChange={e => setEditForm(f=>({...f,[p]:e.target.value}))}
                        className="w-full px-2 py-1.5 rounded-lg border border-orange-200 text-sm focus:outline-none mt-0.5"/>
                    </div>
                  ))}
                </div>
                <button onClick={() => saveEdit(s.id)}
                  className="w-full bg-brand-primary text-white font-bold py-2 rounded-xl hover:bg-brand-secondary text-sm flex items-center justify-center gap-2">
                  <Save size={13}/> Save
                </button>
              </div>
            ) : (
              <div className="p-4">
                <p className="text-xs text-gray-500 mb-3">{s.shortDesc}</p>
                <div className="grid grid-cols-3 gap-2">
                  {[['basic','bg-gray-50 border-gray-200'],['standard','bg-orange-50 border-orange-200'],['premium','bg-amber-50 border-amber-200']].map(([k,cls])=>(
                    <div key={k} className={`border rounded-xl p-2 text-center ${cls}`}>
                      <div className="text-xs text-gray-500 capitalize">{k}</div>
                      <div className="font-bold text-brand-primary text-sm">₹{s.price[k].toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Admin Page ────────────────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState(null)
  const [services, setServices] = useState(SERVICES)
  const [adminUser, setAdminUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('dop_user')
    if (!stored) { router.push('/auth/login'); return }
    const u = JSON.parse(stored)
    if (u.role !== 'admin') { router.push('/dashboard'); return }
    setAdminUser(u)
    setAuthLoading(false)
    apiAdminStats().then(setStats).catch(console.error)
  }, [router])

  const logout = async () => {
    await apiLogout()
    router.push('/')
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users & Dogs', icon: Users },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'messages', label: 'Messages', icon: Mail },
    { id: 'services', label: 'Services Editor', icon: Settings },
  ]

  if (authLoading) return <div className="min-h-screen flex items-center justify-center text-4xl animate-bounce">🐾</div>

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-brand-dark flex flex-col transition-transform duration-300 ${sidebarOpen?'translate-x-0':'-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}>
        <div className="p-5 border-b border-white/10">
          <Link href="/" className="block">
            <DogLogo size={36} showText={false}/>
            <div className="mt-2">
              <div className="font-display font-bold text-white text-base leading-none">DOG&apos;S OWN PLACE</div>
              <div className="text-xs text-amber-400 font-bold tracking-wider mt-0.5 flex items-center gap-1"><Shield size={10}/> ADMIN · MONGODB</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab===tab.id?'bg-brand-primary text-white shadow-brand':'text-white/60 hover:text-white hover:bg-white/10'}`}>
                <Icon size={18}/> {tab.label}
              </button>
            )
          })}
        </nav>
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 text-sm font-semibold">
            <Eye size={16}/> View Site
          </Link>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm font-semibold">
            <LogOut size={16}/> Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)}/>}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-orange-100 px-4 lg:px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-brand-light">
              <Menu size={20} className="text-brand-dark"/>
            </button>
            <div>
              <h1 className="font-display font-bold text-brand-dark text-lg capitalize">
                {tabs.find(t=>t.id===activeTab)?.label || 'Dashboard'}
              </h1>
              <p className="text-xs text-gray-400 hidden sm:block">Live data from MongoDB Atlas</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-brand-light">
              <Bell size={18} className="text-gray-500"/>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full"/>
            </button>
            <div className="flex items-center gap-2.5 bg-brand-light px-3 py-2 rounded-xl">
              <div className="w-7 h-7 rounded-full bg-brand-primary text-white flex items-center justify-center text-xs font-bold">A</div>
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-brand-dark">Admin</div>
                <div className="text-xs text-green-600 font-semibold">● MongoDB Live</div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {activeTab === 'overview' && <OverviewTab stats={stats}/>}
          {activeTab === 'users'    && <UsersTab/>}
          {activeTab === 'bookings' && <BookingsTab/>}
          {activeTab === 'messages' && <MessagesTab/>}
          {activeTab === 'services' && <ServicesTab services={services} setServices={setServices}/>}
        </main>
      </div>
    </div>
  )
}

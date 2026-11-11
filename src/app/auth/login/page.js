'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import { apiLogin } from '@/lib/apiClient'
import DogLogo from '@/components/ui/DogLogo'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await apiLogin(form)
      // Redirect admin to /admin, users to /dashboard
      router.push(data.user?.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err.message || 'Invalid email or password')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-cream flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{background:'linear-gradient(135deg,#5C2E0A 0%,#E8622A 100%)'}}>
        <div className="absolute inset-0 opacity-10 dots-bg" />
        <Link href="/" className="relative z-10">
          <DogLogo size={44} showText={true} className="[&_div]:text-white [&_.text-brand-primary]:text-amber-300" />
        </Link>
        <div className="relative z-10">
          <h2 className="font-display text-4xl font-bold text-white leading-tight mb-4">
            Welcome back,<br />Dog Parent! 🐾
          </h2>
          <p className="text-orange-100/80 text-lg mb-8">Your dog is waiting. Log in to manage services, track health, and book appointments.</p>
          <div className="space-y-4">
            {[
              { icon:'🎓', text:'Manage training sessions' },
              { icon:'🩺', text:'Track health records' },
              { icon:'📅', text:'Book & manage appointments' },
              { icon:'🐕', text:'Your dog\'s profile & history' },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-3 text-white/80">
                <span className="text-2xl">{item.icon}</span>
                <span className="font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
          <p className="text-white/90 text-sm italic">&ldquo;DOP has been a lifesaver — Bruno transformed in just 4 training sessions!&rdquo;</p>
          <div className="flex items-center gap-3 mt-3">
            <div className="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center text-white font-bold text-sm">PS</div>
            <div className="text-white/70 text-xs">Priya Sharma · Mumbai</div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <Link href="/"><DogLogo size={44} showText={true} className="inline-flex" /></Link>
          </div>
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-brand-dark">Sign In</h1>
            <p className="text-gray-500 mt-2">Enter your credentials to access your account</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm font-medium flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-brand-dark mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="input-field pl-11" required />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-brand-dark mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input type={show ? 'text' : 'password'} placeholder="Your password" value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  className="input-field pl-11 pr-11" required />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-primary">
                  {show ? <EyeOff size={17}/> : <Eye size={17}/>}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-4 text-base disabled:opacity-60">
              {loading
                ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Signing in...</span>
                : <span className="flex items-center gap-2">Sign In <ArrowRight size={18}/></span>}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-6 text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-brand-primary font-bold hover:underline">Create one free →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, ArrowRight, Check } from 'lucide-react'
import { apiRegister } from '@/lib/apiClient'
import DogLogo from '@/components/ui/DogLogo'

const STEPS = ['Account Info', 'Personal Details', 'All Set!']

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '',
    phone: '', city: '', address: '',
  })
  const [errors, setErrors] = useState({})

  const set = (k, v) => { setForm(f => ({...f,[k]:v})); setErrors(e => ({...e,[k]:''})) }

  const validate0 = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.email.includes('@')) e.email = 'Valid email required'
    if (form.password.length < 8) e.password = 'Min 8 characters'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    setErrors(e); return Object.keys(e).length === 0
  }
  const validate1 = () => {
    const e = {}
    if (!form.phone.match(/^\d{10}$/)) e.phone = 'Valid 10-digit phone required'
    if (!form.city.trim()) e.city = 'City is required'
    setErrors(e); return Object.keys(e).length === 0
  }

  const next = () => {
    if (step === 0 && validate0()) { setStep(1); setServerError('') }
    else if (step === 1 && validate1()) handleRegister()
  }

  const handleRegister = async () => {
    setLoading(true)
    setServerError('')
    try {
      await apiRegister({
        name: form.name, email: form.email, password: form.password,
        phone: form.phone, city: form.city, address: form.address,
      })
      setStep(2)
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const Field = ({ icon: Icon, label, name, type='text', placeholder }) => (
    <div>
      <label className="text-sm font-semibold text-brand-dark mb-1.5 block">{label}</label>
      <div className="relative">
        {Icon && <Icon size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"/>}
        <input type={type} placeholder={placeholder} value={form[name]}
          onChange={e => set(name, e.target.value)}
          className={`input-field ${Icon?'pl-11':''} ${errors[name]?'border-red-400 ring-1 ring-red-200':''}`} />
        {name==='password' && (
          <button type="button" onClick={() => setShow(!show)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            {show ? <EyeOff size={17}/> : <Eye size={17}/>}
          </button>
        )}
      </div>
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  )

  return (
    <div className="min-h-screen bg-brand-cream flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 flex-col justify-between p-12 relative overflow-hidden"
        style={{background:'linear-gradient(135deg,#E8622A 0%,#5C2E0A 100%)'}}>
        <div className="absolute inset-0 opacity-10 dots-bg" />
        <Link href="/" className="relative z-10">
          <DogLogo size={44} showText={true} />
        </Link>
        <div className="relative z-10">
          <h2 className="font-display text-4xl font-bold text-white mb-4">Join 5,000+<br/>Happy Dog Parents 🐾</h2>
          <p className="text-orange-100/80 text-lg mb-8">Create your free account and give your dog the premium care they deserve.</p>
          <div className="space-y-3">
            {['Free to join — no credit card required','Book 8 premium dog services instantly','Track health records & vaccinations','GPS-tracked walks & real-time updates'].map(t => (
              <div key={t} className="flex items-center gap-3 text-white/80">
                <Check size={16} className="text-green-400 flex-shrink-0"/>
                <span className="text-sm font-medium">{t}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 grid grid-cols-2 gap-3">
          {[['5,000+','Happy Dogs'],['98%','Satisfaction'],['50+','Cities'],['8','Services']].map(([v,l]) => (
            <div key={l} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
              <div className="font-display font-bold text-2xl text-white">{v}</div>
              <div className="text-white/70 text-xs">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <Link href="/"><DogLogo size={40} showText={true} className="inline-flex" /></Link>
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-3 mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  i < step ? 'bg-green-500 text-white' : i === step ? 'bg-brand-primary text-white shadow-brand' : 'bg-gray-200 text-gray-400'
                }`}>
                  {i < step ? <Check size={14}/> : i + 1}
                </div>
                {i < STEPS.length - 1 && <div className={`w-8 h-0.5 ${i < step ? 'bg-green-400' : 'bg-gray-200'}`}/>}
              </div>
            ))}
          </div>

          {step === 2 ? (
            <div className="text-center py-8">
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 text-5xl">🎉</div>
              <h2 className="font-display text-3xl font-bold text-brand-dark mb-2">You&apos;re in!</h2>
              <p className="text-gray-500 mb-8">Welcome to Dog&apos;s Own Place, {form.name.split(' ')[0]}! Your account is ready.</p>
              <button onClick={() => router.push('/dashboard')} className="btn-primary px-8 py-4 text-base">
                Go to Dashboard 🐾
              </button>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold text-brand-dark mb-1">
                {step === 0 ? 'Create your account' : 'Your details'}
              </h1>
              <p className="text-gray-500 text-sm mb-6">
                {step === 0 ? 'Set up your login credentials' : 'Help us personalise your experience'}
              </p>

              {serverError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm font-medium">
                  ⚠️ {serverError}
                </div>
              )}

              <div className="space-y-4">
                {step === 0 ? (
                  <>
                    <Field icon={User} label="Full Name" name="name" placeholder="Priya Sharma" />
                    <Field icon={Mail} label="Email Address" name="email" type="email" placeholder="priya@example.com" />
                    <Field icon={Lock} label="Password" name="password" type={show?'text':'password'} placeholder="Min 8 characters" />
                    <Field icon={Lock} label="Confirm Password" name="confirm" type="password" placeholder="Repeat password" />
                  </>
                ) : (
                  <>
                    <Field icon={Phone} label="Mobile Number" name="phone" placeholder="10-digit number" />
                    <Field icon={MapPin} label="City" name="city" placeholder="Mumbai, Delhi, Bangalore..." />
                    <div>
                      <label className="text-sm font-semibold text-brand-dark mb-1.5 block">Address (Optional)</label>
                      <textarea value={form.address} onChange={e => set('address', e.target.value)}
                        placeholder="Your full address for home visits"
                        className="input-field resize-none h-20" />
                    </div>
                  </>
                )}

                <button onClick={next} disabled={loading}
                  className="btn-primary w-full justify-center py-4 text-base disabled:opacity-60">
                  {loading
                    ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Creating account...</span>
                    : <span className="flex items-center gap-2">{step === 0 ? 'Continue' : 'Create Account'}<ArrowRight size={18}/></span>}
                </button>

                {step === 1 && (
                  <button onClick={() => setStep(0)} className="w-full text-center text-sm text-gray-500 hover:text-brand-primary py-2">
                    ← Back
                  </button>
                )}
              </div>

              <p className="text-center text-gray-500 mt-6 text-sm">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-brand-primary font-bold hover:underline">Sign in →</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

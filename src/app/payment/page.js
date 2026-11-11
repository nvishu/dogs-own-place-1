'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { apiGetAppointments, apiGetPayments, apiCreatePayment } from '@/lib/apiClient'

function PaymentContent() {
  const router = useRouter()
  const [method, setMethod] = useState('upi')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [paid, setPaid] = useState(false)
  const [user, setUser] = useState(null)
  const [unpaidAppts, setUnpaidAppts] = useState([])
  const [payments, setPayments] = useState([])
  const [selectedAppt, setSelectedAppt] = useState(null)
  const [txnId, setTxnId] = useState('')
  const [error, setError] = useState('')
  const [upiId, setUpiId] = useState('')
  const [cardForm, setCardForm] = useState({ number: '', name: '', expiry: '', cvv: '' })

  useEffect(() => {
    const stored = localStorage.getItem('dop_user')
    if (!stored) { router.push('/auth/login'); return }
    setUser(JSON.parse(stored))
    Promise.all([apiGetAppointments(), apiGetPayments()])
      .then(([apptData, payData]) => {
        const unpaid = (apptData.appointments || []).filter(a => a.paymentStatus !== 'paid' && a.status !== 'cancelled')
        setUnpaidAppts(unpaid)
        setSelectedAppt(unpaid[0] || null)
        setPayments(payData.payments || [])
      })
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [router])

  const formatCard = (v) => v.replace(/\D/g,'').replace(/(\d{4})/g,'$1 ').trim().slice(0,19)
  const formatExpiry = (v) => v.replace(/\D/g,'').replace(/(\d{2})(\d)/,'$1/$2').slice(0,5)
  const amount = selectedAppt?.price || 0

  const handlePay = async (e) => {
    e.preventDefault()
    if (!selectedAppt) return
    setLoading(true); setError('')
    try {
      const data = await apiCreatePayment({
        appointmentId: selectedAppt._id,
        amount, method,
      })
      setTxnId(data.txnId || '')
      setPaid(true)
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return <div className="min-h-screen flex items-center justify-center text-4xl animate-bounce">🐾</div>

  if (paid) return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <div className="page-container pt-28 pb-16 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="w-28 h-28 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 text-6xl">✅</div>
          <h1 className="font-display text-3xl font-bold text-brand-dark mb-2">Payment Successful!</h1>
          <p className="text-gray-500 mb-1">₹{amount.toLocaleString()} paid successfully</p>
          {txnId && <p className="text-xs text-gray-400 mb-2 font-mono">TXN: {txnId}</p>}
          <p className="text-gray-400 text-sm mb-8">Confirmation sent to {user.email}</p>
          <div className="card mb-6 text-left space-y-3">
            {[
              ['Service', selectedAppt?.serviceName],
              ['Date', selectedAppt?.date],
              ['Time', selectedAppt?.time],
              ['Amount', `₹${amount.toLocaleString()}`],
              ['Status', '✅ Paid'],
            ].map(([k,v]) => (
              <div key={k} className="flex justify-between text-sm border-b border-orange-50 pb-2">
                <span className="text-gray-400">{k}</span><span className="font-semibold text-brand-dark">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard" className="btn-primary flex-1 justify-center">Go to Dashboard</Link>
            <Link href="/dashboard/appointments" className="btn-secondary flex-1 justify-center">View Bookings</Link>
          </div>
        </div>
      </div>
    </div>
  )

  const METHODS = [
    { id: 'upi', label: 'UPI', icon: '📱' },
    { id: 'card', label: 'Card', icon: '💳' },
    { id: 'net_banking', label: 'Net Banking', icon: '🏦' },
    { id: 'wallet', label: 'Wallet', icon: '👛' },
  ]

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <div className="page-container pt-28 pb-16">
        <div className="mb-8">
          <Link href="/dashboard/appointments" className="text-brand-primary text-sm font-semibold hover:underline">← Back to Appointments</Link>
          <h1 className="font-display text-3xl font-bold text-brand-dark mt-2">💳 Payment</h1>
        </div>

        {fetching ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 h-96 bg-white rounded-3xl animate-pulse"/>
            <div className="lg:col-span-2 h-64 bg-white rounded-3xl animate-pulse"/>
          </div>
        ) : unpaidAppts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="font-display text-2xl font-bold text-brand-dark mb-3">All Paid Up!</h2>
            <p className="text-gray-500 mb-6">You have no pending payments.</p>
            <Link href="/dashboard/appointments" className="btn-primary px-6 py-3">View Appointments</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              {/* Select appointment */}
              {unpaidAppts.length > 1 && (
                <div className="card mb-6">
                  <h2 className="font-bold text-brand-dark mb-3 text-sm">Select Appointment to Pay</h2>
                  <div className="space-y-2">
                    {unpaidAppts.map(a => (
                      <button key={a._id} onClick={() => setSelectedAppt(a)} type="button"
                        className={`w-full flex items-center justify-between p-3 rounded-xl border-2 text-left transition-all ${selectedAppt?._id===a._id?'border-brand-primary bg-brand-light':'border-gray-100 hover:border-orange-300'}`}>
                        <div>
                          <div className="font-semibold text-brand-dark text-sm">{a.serviceName}</div>
                          <div className="text-xs text-gray-400">{a.date} · {a.time}</div>
                        </div>
                        <div className="font-bold text-brand-primary">₹{a.price?.toLocaleString()}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment form */}
              <div className="card">
                <h2 className="font-bold text-brand-dark mb-5">Choose Payment Method</h2>
                {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">⚠️ {error}</div>}

                <div className="grid grid-cols-4 gap-3 mb-6">
                  {METHODS.map(m => (
                    <button key={m.id} type="button" onClick={() => setMethod(m.id)}
                      className={`p-3 rounded-xl border-2 text-center transition-all ${method===m.id?'border-brand-primary bg-brand-light shadow-brand':'border-gray-100 hover:border-orange-200'}`}>
                      <div className="text-2xl mb-1">{m.icon}</div>
                      <div className="text-xs font-bold text-brand-dark">{m.label}</div>
                    </button>
                  ))}
                </div>

                <form onSubmit={handlePay} className="space-y-4">
                  {method === 'upi' && (
                    <div>
                      <label className="text-sm font-semibold text-brand-dark mb-1.5 block">UPI ID</label>
                      <input value={upiId} onChange={e => setUpiId(e.target.value)}
                        placeholder="yourname@upi" className="input-field"/>
                      <p className="text-xs text-gray-400 mt-1">e.g. 9876543210@paytm or name@okicici</p>
                    </div>
                  )}
                  {method === 'card' && (
                    <>
                      <div>
                        <label className="text-sm font-semibold text-brand-dark mb-1.5 block">Card Number</label>
                        <input value={cardForm.number} onChange={e => setCardForm(f=>({...f,number:formatCard(e.target.value)}))}
                          placeholder="1234 5678 9012 3456" maxLength={19} className="input-field font-mono"/>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-brand-dark mb-1.5 block">Name on Card</label>
                        <input value={cardForm.name} onChange={e => setCardForm(f=>({...f,name:e.target.value}))}
                          placeholder="PRIYA SHARMA" className="input-field uppercase"/>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-semibold text-brand-dark mb-1.5 block">Expiry</label>
                          <input value={cardForm.expiry} onChange={e => setCardForm(f=>({...f,expiry:formatExpiry(e.target.value)}))}
                            placeholder="MM/YY" maxLength={5} className="input-field"/>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-brand-dark mb-1.5 block">CVV</label>
                          <input type="password" value={cardForm.cvv} onChange={e => setCardForm(f=>({...f,cvv:e.target.value.slice(0,3)}))}
                            placeholder="•••" maxLength={3} className="input-field"/>
                        </div>
                      </div>
                    </>
                  )}
                  {method === 'net_banking' && (
                    <div className="grid grid-cols-2 gap-3">
                      {['SBI','HDFC','ICICI','Axis','Kotak','PNB'].map(bank => (
                        <button type="button" key={bank}
                          className="border border-orange-100 rounded-xl p-3 text-sm font-semibold text-brand-dark hover:border-brand-primary hover:bg-brand-light transition-colors">
                          🏦 {bank}
                        </button>
                      ))}
                    </div>
                  )}
                  {method === 'wallet' && (
                    <div className="grid grid-cols-2 gap-3">
                      {['Paytm Wallet','Amazon Pay','Freecharge','MobiKwik'].map(w => (
                        <button type="button" key={w}
                          className="border border-orange-100 rounded-xl p-3 text-sm font-semibold text-brand-dark hover:border-brand-primary hover:bg-brand-light transition-colors">
                          👛 {w}
                        </button>
                      ))}
                    </div>
                  )}
                  <button type="submit" disabled={loading || !selectedAppt}
                    className="btn-primary w-full justify-center py-4 text-base mt-3 disabled:opacity-60">
                    {loading
                      ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Processing...</span>
                      : `🔒 Pay ₹${amount.toLocaleString()} Securely`}
                  </button>
                </form>
              </div>

              {/* Past payments */}
              {payments.length > 0 && (
                <div className="card mt-6">
                  <h2 className="font-bold text-brand-dark mb-4">📋 Payment History</h2>
                  <div className="space-y-3">
                    {payments.slice(0,5).map(p => (
                      <div key={p._id} className="flex items-center justify-between py-2 border-b border-orange-50 last:border-0">
                        <div>
                          <div className="font-semibold text-brand-dark text-sm">{p.appointment?.serviceName || 'Service'}</div>
                          <div className="text-xs text-gray-400 font-mono">{p.txnId}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-brand-primary">₹{p.amount?.toLocaleString()}</div>
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">✓ {p.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Order summary */}
            <div className="lg:col-span-2">
              <div className="card sticky top-28">
                <h2 className="font-bold text-brand-dark mb-5">🧾 Order Summary</h2>
                {selectedAppt ? (
                  <>
                    <div className="space-y-3 text-sm mb-5">
                      {[
                        ['Service', selectedAppt.serviceName],
                        ['Plan', selectedAppt.plan?.charAt(0).toUpperCase()+selectedAppt.plan?.slice(1)],
                        ['Dog', selectedAppt.dogName || 'Not specified'],
                        ['Date', selectedAppt.date],
                        ['Time', selectedAppt.time],
                      ].map(([k,v]) => (
                        <div key={k} className="flex justify-between py-1.5 border-b border-orange-50">
                          <span className="text-gray-400">{k}</span>
                          <span className="font-medium text-brand-dark">{v}</span>
                        </div>
                      ))}
                    </div>
                    <div className="bg-brand-light rounded-xl p-4 text-center">
                      <div className="text-sm text-gray-500 mb-1">Total Amount</div>
                      <div className="font-display font-bold text-3xl text-brand-primary">₹{amount.toLocaleString()}</div>
                      <div className="text-xs text-gray-400 mt-1">Inclusive of all taxes</div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <div className="text-4xl mb-2">📅</div>
                    <p className="text-sm">No pending payments</p>
                    <Link href="/dashboard/appointments" className="btn-primary mt-3 text-sm px-4 py-2 inline-flex">Book a Service</Link>
                  </div>
                )}
                <div className="mt-5 space-y-2 text-xs text-gray-400">
                  <div className="flex items-center gap-2"><span>🔒</span><span>256-bit SSL Encrypted</span></div>
                  <div className="flex items-center gap-2"><span>✅</span><span>RBI Compliant · Saved to MongoDB</span></div>
                  <div className="flex items-center gap-2"><span>🔄</span><span>Easy cancellation & refund policy</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default function PaymentPage() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-4xl animate-bounce">🐾</div>}><PaymentContent /></Suspense>
}

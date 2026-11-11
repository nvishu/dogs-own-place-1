import { NextResponse } from 'next/server'
import crypto from 'crypto'
import Payment from '@/models/Payment'
import Appointment from '@/models/Appointment'
import { requireUser } from '@/lib/auth'
import { isValidId, readJson } from '@/lib/validate'

export const dynamic = 'force-dynamic'

const METHODS = ['upi', 'card', 'net_banking', 'wallet', 'cash']

export async function GET(request) {
  try {
    const { user, error } = await requireUser(request)
    if (error) return error
    const payments = await Payment.find({ user: user.id })
      .populate('appointment', 'serviceName date time plan')
      .sort({ createdAt: -1 })
      .limit(200)
    return NextResponse.json({ payments })
  } catch (err) {
    console.error('GET /api/payments:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/payments — DEMO payment: records a success without charging anything.
// Set ALLOW_MOCK_PAYMENTS=false in production once Razorpay is wired in, so nobody can
// mark bookings "paid" for free.
export async function POST(request) {
  try {
    if (process.env.ALLOW_MOCK_PAYMENTS === 'false') {
      return NextResponse.json({ error: 'Online payments are not enabled yet' }, { status: 503 })
    }
    const { user, error } = await requireUser(request)
    if (error) return error

    const body = await readJson(request)
    const appointmentId = String(body.appointmentId || '')
    if (!isValidId(appointmentId)) return NextResponse.json({ error: 'appointmentId required' }, { status: 400 })

    const appt = await Appointment.findOne({ _id: appointmentId, user: user.id })
    if (!appt) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    if (appt.status === 'cancelled') return NextResponse.json({ error: 'Cancelled bookings cannot be paid' }, { status: 400 })

    // Atomically flip unpaid → paid so a double click / replay can't create two payments
    const claimed = await Appointment.findOneAndUpdate(
      { _id: appt._id, paymentStatus: 'unpaid' },
      { $set: { paymentStatus: 'paid' } },
      { new: true }
    )
    if (!claimed) return NextResponse.json({ error: 'This booking is already paid' }, { status: 409 })

    const txnId = 'TXN' + crypto.randomBytes(6).toString('hex').toUpperCase()
    try {
      const payment = await Payment.create({
        user: user.id,
        appointment: appt._id,
        amount: appt.price, // amount comes from the stored booking, never from the client
        method: METHODS.includes(body.method) ? body.method : 'mock',
        status: 'success',
        txnId,
        paidAt: new Date(),
      })
      await Appointment.findByIdAndUpdate(appt._id, { paymentId: payment._id })
      return NextResponse.json({ success: true, payment, txnId }, { status: 201 })
    } catch (e) {
      await Appointment.findByIdAndUpdate(appt._id, { paymentStatus: 'unpaid' }) // roll back
      throw e
    }
  } catch (err) {
    console.error('POST /api/payments:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

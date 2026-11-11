import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Appointment from '@/models/Appointment'
import Payment from '@/models/Payment'
import { requireAdmin } from '@/lib/auth'
import { isValidId, readJson } from '@/lib/validate'

export const dynamic = 'force-dynamic'

const STATUSES = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']

export async function GET(request) {
  try {
    const { error } = await requireAdmin(request)
    if (error) return error
    await connectDB()
    const status = new URL(request.url).searchParams.get('status')
    const query = status && STATUSES.includes(status) ? { status } : {}
    const [bookings, payments] = await Promise.all([
      Appointment.find(query)
        .populate('user', 'name email city phone')
        .populate('dog', 'name breed')
        .sort({ createdAt: -1 })
        .limit(100),
      Payment.find({ status: 'success' }).select('appointment amount txnId paidAt method'),
    ])
    const paymentMap = {}
    payments.forEach((p) => { paymentMap[p.appointment?.toString()] = p })
    const enriched = bookings.map((b) => ({ ...b.toObject(), payment: paymentMap[b._id.toString()] || null }))
    return NextResponse.json({ bookings: enriched })
  } catch (err) {
    console.error('Admin bookings GET:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const { error } = await requireAdmin(request)
    if (error) return error
    await connectDB()
    const { bookingId, status } = await readJson(request)
    if (!isValidId(String(bookingId || ''))) return NextResponse.json({ error: 'Invalid booking id' }, { status: 400 })
    if (!STATUSES.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    const appt = await Appointment.findByIdAndUpdate(bookingId, { status }, { new: true })
    if (!appt) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, appointment: appt })
  } catch (err) {
    console.error('Admin bookings PATCH:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

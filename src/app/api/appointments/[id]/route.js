import { NextResponse } from 'next/server'
import Appointment from '@/models/Appointment'
import { requireUser } from '@/lib/auth'
import { str, isValidId, readJson } from '@/lib/validate'

export const dynamic = 'force-dynamic'

const notFound = () => NextResponse.json({ error: 'Not found' }, { status: 404 })

export async function GET(request, { params }) {
  try {
    const { user, error } = await requireUser(request)
    if (error) return error
    if (!isValidId(params.id)) return notFound()
    const appt = await Appointment.findOne({ _id: params.id, user: user.id }).populate('dog', 'name breed image')
    return appt ? NextResponse.json({ appointment: appt }) : notFound()
  } catch (err) {
    console.error('GET /api/appointments/[id]:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// Customers can only cancel their own bookings. Status changes by staff go through /api/admin/bookings.
export async function PATCH(request, { params }) {
  try {
    const { user, error } = await requireUser(request)
    if (error) return error
    if (!isValidId(params.id)) return notFound()

    const body = await readJson(request)
    const appt = await Appointment.findOne({ _id: params.id, user: user.id })
    if (!appt) return notFound()
    if (['completed', 'cancelled', 'in_progress'].includes(appt.status)) {
      return NextResponse.json({ error: `A ${appt.status.replace('_', ' ')} booking cannot be cancelled` }, { status: 400 })
    }

    appt.status = 'cancelled'
    appt.cancelReason = str(body.cancelReason, 300)
    await appt.save()
    return NextResponse.json({ success: true, appointment: appt })
  } catch (err) {
    console.error('PATCH /api/appointments/[id]:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

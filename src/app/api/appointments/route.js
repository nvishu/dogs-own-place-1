import { NextResponse } from 'next/server'
import Appointment from '@/models/Appointment'
import Dog from '@/models/Dog'
import { requireUser } from '@/lib/auth'
import { SERVICES } from '@/lib/constants'
import { str, isValidId, readJson } from '@/lib/validate'

export const dynamic = 'force-dynamic'

const PLANS = ['basic', 'standard', 'premium']
const HOME_VISIT_FEE = 200

export async function GET(request) {
  try {
    const { user, error } = await requireUser(request)
    if (error) return error
    const appointments = await Appointment.find({ user: user.id })
      .populate('dog', 'name breed image')
      .sort({ createdAt: -1 })
      .limit(200)
    return NextResponse.json({ appointments })
  } catch (err) {
    console.error('GET /api/appointments:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { user, error } = await requireUser(request)
    if (error) return error

    const body = await readJson(request)
    const serviceId = str(body.serviceId, 40)
    const plan = PLANS.includes(body.plan) ? body.plan : 'standard'
    const date = str(body.date, 10)
    const time = str(body.time, 20)
    const homeVisit = body.homeVisit === true

    // The price is ALWAYS computed on the server — never trusted from the client.
    const service = SERVICES.find((s) => s.id === serviceId)
    if (!service) return NextResponse.json({ error: 'Unknown service' }, { status: 400 })
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
      return NextResponse.json({ error: 'Please choose a valid date' }, { status: 400 })
    }
    const today = new Date(); today.setHours(0, 0, 0, 0)
    if (new Date(date + 'T00:00:00') < new Date(today.getTime() - 24 * 3600 * 1000)) {
      return NextResponse.json({ error: 'Date cannot be in the past' }, { status: 400 })
    }
    if (!time) return NextResponse.json({ error: 'Please choose a time slot' }, { status: 400 })

    let dogId
    let dogName = ''
    if (body.dogId) {
      if (!isValidId(String(body.dogId))) return NextResponse.json({ error: 'Invalid dog' }, { status: 400 })
      const dog = await Dog.findOne({ _id: body.dogId, owner: user.id })
      if (!dog) return NextResponse.json({ error: 'Dog not found' }, { status: 404 })
      dogId = dog._id
      dogName = dog.name
    }

    const price = service.price[plan] + (homeVisit ? HOME_VISIT_FEE : 0)

    const appointment = await Appointment.create({
      user: user.id,
      dog: dogId,
      dogName,
      serviceId: service.id,
      serviceName: service.title,
      plan,
      date,
      time,
      notes: str(body.notes, 500),
      address: str(body.address, 300),
      homeVisit,
      price,
      status: 'confirmed',
      paymentStatus: 'unpaid',
    })

    return NextResponse.json({ success: true, appointment }, { status: 201 })
  } catch (err) {
    console.error('POST /api/appointments:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import Dog from '@/models/Dog'
import { requireUser } from '@/lib/auth'
import { isValidId, readJson, str } from '@/lib/validate'

export const dynamic = 'force-dynamic'

const TYPES = ['vaccination', 'checkup', 'medication', 'note']
const toDate = (v) => {
  const d = new Date(v)
  return typeof v === 'string' && v && !Number.isNaN(d.getTime()) ? d : undefined
}

// POST /api/dogs/[id]/health — add a vaccination / checkup / medication / note
export async function POST(request, { params }) {
  try {
    const { user, error } = await requireUser(request)
    if (error) return error
    if (!isValidId(params.id)) return NextResponse.json({ error: 'Dog not found' }, { status: 404 })

    const body = await readJson(request)
    const type = TYPES.includes(body.type) ? body.type : 'note'
    const title = str(body.title, 100)
    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 })

    const record = { type, title, description: str(body.description, 500), vet: str(body.vet, 80) }
    const date = toDate(body.date)
    const nextDueDate = toDate(body.nextDueDate)
    if (date) record.date = date
    if (nextDueDate) record.nextDueDate = nextDueDate

    const dog = await Dog.findOneAndUpdate({ _id: params.id, owner: user.id }, { $push: { healthRecords: record } }, { new: true })
    if (!dog) return NextResponse.json({ error: 'Dog not found' }, { status: 404 })
    return NextResponse.json({ success: true, dog }, { status: 201 })
  } catch (err) {
    console.error('POST /api/dogs/[id]/health:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

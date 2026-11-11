import { NextResponse } from 'next/server'
import Dog from '@/models/Dog'
import { requireUser } from '@/lib/auth'
import { readJson } from '@/lib/validate'
import { buildDogFields } from '@/lib/dogs'

export const dynamic = 'force-dynamic'

// GET /api/dogs — dogs of the logged-in user
export async function GET(request) {
  try {
    const { user, error } = await requireUser(request)
    if (error) return error
    const dogs = await Dog.find({ owner: user.id }).sort({ createdAt: -1 })
    return NextResponse.json({ dogs })
  } catch (err) {
    console.error('GET /api/dogs:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST /api/dogs — create a dog profile
export async function POST(request) {
  try {
    const { user, error } = await requireUser(request)
    if (error) return error

    const fields = buildDogFields(await readJson(request))
    if (!fields.name || !fields.breed) {
      return NextResponse.json({ error: 'Dog name and breed are required' }, { status: 400 })
    }
    if ((await Dog.countDocuments({ owner: user.id })) >= 20) {
      return NextResponse.json({ error: 'You can add up to 20 dogs' }, { status: 400 })
    }

    const dog = await Dog.create({ ...fields, owner: user.id })
    return NextResponse.json({ success: true, dog }, { status: 201 })
  } catch (err) {
    console.error('POST /api/dogs:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

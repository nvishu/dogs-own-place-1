import { NextResponse } from 'next/server'
import Dog from '@/models/Dog'
import { requireUser } from '@/lib/auth'
import { isValidId, readJson } from '@/lib/validate'
import { buildDogFields } from '@/lib/dogs'

export const dynamic = 'force-dynamic'

const notFound = () => NextResponse.json({ error: 'Dog not found' }, { status: 404 })

export async function GET(request, { params }) {
  try {
    const { user, error } = await requireUser(request)
    if (error) return error
    if (!isValidId(params.id)) return notFound()
    const dog = await Dog.findOne({ _id: params.id, owner: user.id })
    return dog ? NextResponse.json({ dog }) : notFound()
  } catch (err) {
    console.error('GET /api/dogs/[id]:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const { user, error } = await requireUser(request)
    if (error) return error
    if (!isValidId(params.id)) return notFound()

    // Whitelisted fields only — `owner` and `_id` can never be changed
    const fields = buildDogFields(await readJson(request))
    if (fields.name === '' || fields.breed === '') {
      return NextResponse.json({ error: 'Name and breed cannot be empty' }, { status: 400 })
    }
    const dog = await Dog.findOneAndUpdate({ _id: params.id, owner: user.id }, { $set: fields }, { new: true, runValidators: true })
    return dog ? NextResponse.json({ success: true, dog }) : notFound()
  } catch (err) {
    console.error('PATCH /api/dogs/[id]:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { user, error } = await requireUser(request)
    if (error) return error
    if (!isValidId(params.id)) return notFound()
    const dog = await Dog.findOneAndDelete({ _id: params.id, owner: user.id })
    return dog ? NextResponse.json({ success: true, message: 'Dog profile deleted' }) : notFound()
  } catch (err) {
    console.error('DELETE /api/dogs/[id]:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

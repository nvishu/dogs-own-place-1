import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Dog from '@/models/Dog'
import { requireAdmin } from '@/lib/auth'
import { isValidId, readJson } from '@/lib/validate'

export const dynamic = 'force-dynamic'

// Previously this passed the raw request body to findByIdAndUpdate, which let anyone
// with a token set `role` or write an UNHASHED password. Only whitelisted fields now.
export async function PATCH(request, { params }) {
  try {
    const { error } = await requireAdmin(request)
    if (error) return error
    if (!isValidId(params.id)) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    await connectDB()
    const body = await readJson(request)
    const update = {}
    if (typeof body.isActive === 'boolean') update.isActive = body.isActive
    if (['user', 'staff'].includes(body.role)) update.role = body.role // admin role is env-based, never DB-assigned
    if (!Object.keys(update).length) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
    const user = await User.findByIdAndUpdate(params.id, update, { new: true }).select('-password')
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json({ success: true, user })
  } catch (err) {
    console.error('Admin users/[id] PATCH:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { error } = await requireAdmin(request)
    if (error) return error
    if (!isValidId(params.id)) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    await connectDB()
    await User.findByIdAndDelete(params.id)
    await Dog.deleteMany({ owner: params.id })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin users/[id] DELETE:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { requireAuth, requireUser } from '@/lib/auth'
import { str, readJson } from '@/lib/validate'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { user: decoded, error } = await requireAuth(request)
    if (error) return error

    if (decoded.role === 'admin') {
      return NextResponse.json({ user: { _id: 'admin', name: 'Admin', email: decoded.email, role: 'admin', city: 'HQ' } })
    }

    await connectDB()
    const user = await User.findById(decoded.id).select('-password')
    if (!user || !user.isActive) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json({ user })
  } catch (error) {
    console.error('Me error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const { user, error } = await requireUser(request)
    if (error) return error

    const body = await readJson(request)
    const update = {}
    if (body.name !== undefined) {
      update.name = str(body.name, 80)
      if (!update.name) return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 })
    }
    if (body.phone !== undefined) update.phone = str(body.phone, 20)
    if (body.city !== undefined) update.city = str(body.city, 80)
    if (body.address !== undefined) update.address = str(body.address, 300)

    const updated = await User.findByIdAndUpdate(user.id, update, { new: true, select: '-password' })
    if (!updated) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json({ success: true, user: updated })
  } catch (error) {
    console.error('Me PATCH error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

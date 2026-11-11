import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import Dog from '@/models/Dog'
import Appointment from '@/models/Appointment'
import { requireAdmin } from '@/lib/auth'
import { escapeRegex, isValidId, readJson, str } from '@/lib/validate'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { error } = await requireAdmin(request)
    if (error) return error
    await connectDB()
    // Escape the search term: otherwise it is a regex-injection / ReDoS vector
    const search = escapeRegex(str(new URL(request.url).searchParams.get('search'), 60))
    const query = search
      ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
      : {}
    const users = await User.find(query).select('-password').sort({ createdAt: -1 }).limit(500)
    return NextResponse.json({ users })
  } catch (err) {
    console.error('Admin users GET:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const { error } = await requireAdmin(request)
    if (error) return error
    await connectDB()
    const { userId, isActive } = await readJson(request)
    if (!isValidId(String(userId || '')) || typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'userId and isActive (boolean) are required' }, { status: 400 })
    }
    const user = await User.findByIdAndUpdate(userId, { isActive }, { new: true }).select('-password')
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    return NextResponse.json({ success: true, user })
  } catch (err) {
    console.error('Admin users PATCH:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { error } = await requireAdmin(request)
    if (error) return error
    await connectDB()
    const { userId } = await readJson(request)
    if (!isValidId(String(userId || ''))) return NextResponse.json({ error: 'Invalid user id' }, { status: 400 })
    await User.findByIdAndDelete(userId)
    await Dog.deleteMany({ owner: userId }) // don't leave orphaned records behind
    await Appointment.updateMany({ user: userId, status: { $in: ['pending', 'confirmed'] } }, { status: 'cancelled', cancelReason: 'Account removed' })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin users DELETE:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

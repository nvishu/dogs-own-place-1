import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ContactMessage from '@/models/ContactMessage'
import { requireAdmin } from '@/lib/auth'
import { isValidId, readJson } from '@/lib/validate'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { error } = await requireAdmin(request)
    if (error) return error
    await connectDB()
    const [messages, unread] = await Promise.all([
      ContactMessage.find().sort({ createdAt: -1 }).limit(200),
      ContactMessage.countDocuments({ status: 'new' }),
    ])
    return NextResponse.json({ messages, unread })
  } catch (err) {
    console.error('Admin messages GET:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const { error } = await requireAdmin(request)
    if (error) return error
    await connectDB()
    const { id, status } = await readJson(request)
    if (!isValidId(String(id || '')) || !['new', 'read'].includes(status)) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    const m = await ContactMessage.findByIdAndUpdate(id, { status }, { new: true })
    return m ? NextResponse.json({ success: true, message: m }) : NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (err) {
    console.error('Admin messages PATCH:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { error } = await requireAdmin(request)
    if (error) return error
    await connectDB()
    const { id } = await readJson(request)
    if (!isValidId(String(id || ''))) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    await ContactMessage.findByIdAndDelete(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Admin messages DELETE:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

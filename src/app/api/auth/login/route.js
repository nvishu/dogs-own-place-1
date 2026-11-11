import { NextResponse } from 'next/server'
import crypto from 'crypto'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { signToken, setAuthCookie } from '@/lib/auth'
import { str, readJson, rateLimit, clientIp } from '@/lib/validate'

export const dynamic = 'force-dynamic'

const sha = (v) => crypto.createHash('sha256').update(String(v)).digest()
const safeEqual = (a, b) => crypto.timingSafeEqual(sha(a), sha(b))

export async function POST(request) {
  try {
    const body = await readJson(request)
    const email = str(body.email, 254).toLowerCase()
    const password = typeof body.password === 'string' ? body.password : ''

    if (!email || !password || password.length > 200) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const limit = rateLimit(`login:${clientIp(request)}:${email}`, { limit: 10 })
    if (!limit.ok) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
      )
    }

    // ── Admin (credentials live in env vars, no DB record) ─────
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase()
    const adminPassword = process.env.ADMIN_PASSWORD
    if (adminEmail && adminPassword && email === adminEmail) {
      if (!safeEqual(password, adminPassword)) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
      }
      const token = signToken({ id: 'admin', email: adminEmail, name: 'Admin', role: 'admin' })
      const adminUser = { _id: 'admin', name: 'Admin', email: adminEmail, role: 'admin', city: 'HQ' }
      return setAuthCookie(NextResponse.json({ success: true, user: adminUser }), token)
    }

    // ── Regular user ───────────────────────────────────────────
    await connectDB()
    const user = await User.findOne({ email })
    // Same message for unknown user / wrong password (no account enumeration)
    if (!user || !(await user.comparePassword(password))) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }
    if (!user.isActive) {
      return NextResponse.json({ error: 'Account is deactivated. Contact support.' }, { status: 403 })
    }

    const token = signToken({ id: user._id.toString(), email: user.email, name: user.name, role: user.role })
    return setAuthCookie(NextResponse.json({ success: true, user: user.toSafeObject() }), token)
  } catch (error) {
    console.error('Login error:', error)
    const msg = process.env.NODE_ENV !== 'production' ? `Server error: ${error.message}` : 'Server error. Please try again.'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

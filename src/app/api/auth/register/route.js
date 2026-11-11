import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { signToken, setAuthCookie } from '@/lib/auth'
import { str, readJson, rateLimit, clientIp, EMAIL_RE } from '@/lib/validate'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const body = await readJson(request)
    const name = str(body.name, 80)
    const email = str(body.email, 254).toLowerCase()
    const password = typeof body.password === 'string' ? body.password : ''
    const phone = str(body.phone, 20)
    const city = str(body.city, 80)
    const address = str(body.address, 300)

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 })
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }
    // bcrypt only uses the first 72 bytes, so cap there
    if (password.length < 8 || password.length > 72) {
      return NextResponse.json({ error: 'Password must be 8–72 characters' }, { status: 400 })
    }
    if (phone && !/^[0-9+\-\s()]{7,20}$/.test(phone)) {
      return NextResponse.json({ error: 'Please enter a valid phone number' }, { status: 400 })
    }

    const limit = rateLimit(`register:${clientIp(request)}`, { limit: 10, windowMs: 60 * 60 * 1000 })
    if (!limit.ok) {
      return NextResponse.json({ error: 'Too many sign-ups. Please try again later.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } })
    }

    await connectDB()
    if (await User.findOne({ email })) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }

    // role is never taken from the request body
    let user
    try {
      user = await User.create({ name, email, password, phone, city, address })
    } catch (e) {
      if (e?.code === 11000) return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
      throw e
    }

    const token = signToken({ id: user._id.toString(), email: user.email, name: user.name, role: user.role })
    return setAuthCookie(
      NextResponse.json({ success: true, message: 'Account created successfully!', user: user.toSafeObject() }, { status: 201 }),
      token
    )
  } catch (error) {
    console.error('Register error:', error)
    const msg = process.env.NODE_ENV !== 'production' ? `Server error: ${error.message}` : 'Server error. Please try again.'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

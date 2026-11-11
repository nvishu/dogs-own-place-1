import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import { isValidId } from '@/lib/validate'

export const COOKIE_NAME = 'dop_token'

function getSecret() {
  const s = process.env.JWT_SECRET
  if (!s || s.length < 32) {
    throw new Error('JWT_SECRET must be set to a random string of at least 32 characters.')
  }
  return s
}

export function signToken(payload) {
  return jwt.sign(payload, getSecret(), {
    algorithm: 'HS256',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, getSecret(), { algorithms: ['HS256'] })
  } catch {
    return null
  }
}

export function getTokenFromRequest(request) {
  const auth = request.headers.get('authorization')
  if (auth?.startsWith('Bearer ')) return auth.slice(7)
  return request.cookies?.get(COOKIE_NAME)?.value || null
}

export function setAuthCookie(response, token) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return response
}

export function clearAuthCookie(response) {
  response.cookies.set(COOKIE_NAME, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 0, path: '/' })
  return response
}

/** Token-only check (no DB). Used by the admin guard. */
export async function requireAuth(request) {
  const token = getTokenFromRequest(request)
  if (!token) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const decoded = verifyToken(token)
  if (!decoded) return { error: NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 }) }
  return { user: decoded }
}

/**
 * For routes that act on a real DB user (dogs, appointments, payments).
 * Re-checks the DB so deactivated/deleted users lose access immediately and
 * the role always comes from the database, not from a stale token.
 */
export async function requireUser(request) {
  const { user: decoded, error } = await requireAuth(request)
  if (error) return { error }
  if (decoded.role === 'admin' || !isValidId(decoded.id)) {
    return { error: NextResponse.json({ error: 'This action is only available to customer accounts' }, { status: 403 }) }
  }
  await connectDB()
  const dbUser = await User.findById(decoded.id).select('isActive role')
  if (!dbUser || !dbUser.isActive) {
    return { error: NextResponse.json({ error: 'Account not found or deactivated' }, { status: 401 }) }
  }
  return { user: { id: decoded.id, role: dbUser.role } }
}

export async function requireAdmin(request) {
  const { user, error } = await requireAuth(request)
  if (error) return { error }
  if (user.role !== 'admin') return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  return { user }
}

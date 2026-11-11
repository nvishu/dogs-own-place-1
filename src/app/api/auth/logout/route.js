import { NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// The session lives in an httpOnly cookie, so it can only be cleared server-side.
export async function POST() {
  return clearAuthCookie(NextResponse.json({ success: true }))
}

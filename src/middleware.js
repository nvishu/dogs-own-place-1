import { NextResponse } from 'next/server'

// CSRF defence for the cookie-based session: state-changing API calls must come
// from our own origin.
export function middleware(request) {
  const { method, headers, nextUrl } = request
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const origin = headers.get('origin')
    if (origin) {
      let originHost = ''
      try { originHost = new URL(origin).host } catch {}
      const host = headers.get('x-forwarded-host') || headers.get('host') || nextUrl.host
      if (originHost !== host) {
        return NextResponse.json({ error: 'Cross-site request blocked' }, { status: 403 })
      }
    }
  }
  return NextResponse.next()
}

export const config = { matcher: '/api/:path*' }

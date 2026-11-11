import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import connectDB from '@/lib/mongodb'

export const dynamic = 'force-dynamic'

// Open  https://YOUR-SITE/api/health  after deploying to see what is (mis)configured.
// Only true/false flags are returned — never secret values.
export async function GET() {
  const env = {
    MONGODB_URI: !!process.env.MONGODB_URI,
    JWT_SECRET_set: !!process.env.JWT_SECRET,
    JWT_SECRET_long_enough: (process.env.JWT_SECRET || '').length >= 32,
    ADMIN_EMAIL: !!process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: !!process.env.ADMIN_PASSWORD,
  }

  let database = 'not configured'
  if (env.MONGODB_URI) {
    try {
      await connectDB()
      await mongoose.connection.db.admin().ping()
      database = 'connected'
    } catch (e) {
      // Generic hint only; full details go to the Vercel function logs
      console.error('Health check DB error:', e)
      database = /auth/i.test(e?.message || '') ? 'failed: wrong username/password'
        : /ENOTFOUND|querySrv|ECONNREFUSED/i.test(e?.message || '') ? 'failed: cannot reach cluster (check the connection string)'
        : /whitelist|IP|selection|timed out/i.test(e?.message || '') ? 'failed: Atlas Network Access is blocking Vercel (allow 0.0.0.0/0)'
        : 'failed: see Vercel function logs'
    }
  }

  const ready = database === 'connected' && env.JWT_SECRET_long_enough
  return NextResponse.json({ ready, database, env }, { status: ready ? 200 : 503 })
}

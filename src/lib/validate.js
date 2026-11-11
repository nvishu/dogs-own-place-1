import mongoose from 'mongoose'

export const isValidId = (id) => typeof id === 'string' && mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id

/** Returns a trimmed string capped at `max`, or '' if the value is not a string. */
export function str(value, max = 200) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/

export function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Pick only the allowed keys from an object (blocks mass-assignment). */
export function pick(obj, keys) {
  const out = {}
  if (!obj || typeof obj !== 'object') return out
  for (const k of keys) if (Object.prototype.hasOwnProperty.call(obj, k)) out[k] = obj[k]
  return out
}

export async function readJson(request) {
  try {
    const body = await request.json()
    return body && typeof body === 'object' && !Array.isArray(body) ? body : {}
  } catch {
    return {}
  }
}

// ── Tiny in-memory rate limiter ─────────────────────────────────────────────
// Good enough to slow brute force on a single instance. On serverless each
// instance has its own memory, so use Upstash/Vercel KV for strict guarantees.
const buckets = new Map()
export function rateLimit(key, { limit = 10, windowMs = 15 * 60 * 1000 } = {}) {
  const now = Date.now()
  if (buckets.size > 5000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k)
  const b = buckets.get(key)
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs })
    return { ok: true }
  }
  b.count += 1
  return b.count > limit ? { ok: false, retryAfter: Math.ceil((b.reset - now) / 1000) } : { ok: true }
}

export function clientIp(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

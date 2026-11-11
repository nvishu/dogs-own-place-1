import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ContactMessage from '@/models/ContactMessage'
import { str, readJson, rateLimit, clientIp, EMAIL_RE } from '@/lib/validate'

export const dynamic = 'force-dynamic'

// Optional email alert to the business owner. Enable by setting RESEND_API_KEY + CONTACT_TO_EMAIL
// (and CONTACT_FROM_EMAIL, a sender verified in Resend). Failure never blocks the visitor.
async function notifyOwner(m) {
  const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = process.env
  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL) return
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: CONTACT_FROM_EMAIL || 'DOP Website <onboarding@resend.dev>',
        to: [CONTACT_TO_EMAIL],
        reply_to: m.email,
        subject: `New enquiry: ${m.subject || 'Website contact form'}`,
        text: `From: ${m.name} <${m.email}>\nPhone: ${m.phone || '-'}\n\n${m.message}`,
      }),
    })
  } catch (e) {
    console.error('Contact email failed:', e)
  }
}

export async function POST(request) {
  try {
    const body = await readJson(request)

    // Honeypot: real users never fill this hidden field; bots do. Pretend success.
    if (str(body.website, 100)) return NextResponse.json({ success: true })

    const name = str(body.name, 80)
    const email = str(body.email, 254).toLowerCase()
    const phone = str(body.phone, 20)
    const subject = str(body.subject, 120)
    const message = str(body.message, 2000)

    if (!name || !email || !message) return NextResponse.json({ error: 'Name, email and message are required' }, { status: 400 })
    if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    if (message.length < 10) return NextResponse.json({ error: 'Please write a few more words so we can help' }, { status: 400 })
    if (phone && !/^[0-9+\-\s()]{7,20}$/.test(phone)) return NextResponse.json({ error: 'Please enter a valid phone number' }, { status: 400 })

    const limit = rateLimit(`contact:${clientIp(request)}`, { limit: 5, windowMs: 60 * 60 * 1000 })
    if (!limit.ok) {
      return NextResponse.json({ error: 'Too many messages. Please try again later.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } })
    }

    await connectDB()
    const doc = await ContactMessage.create({ name, email, phone, subject, message })
    await notifyOwner(doc)
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('POST /api/contact:', err)
    return NextResponse.json({ error: 'Could not send your message. Please try again.' }, { status: 500 })
  }
}

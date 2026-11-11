# 🐾 DOG'S OWN PLACE

Premium dog-services platform — Next.js 14 (App Router) + MongoDB (Mongoose) + JWT auth.

## Run locally
```bash
npm install
cp .env.example .env.local   # then fill in real values
npm run dev
```

## Deploy on Vercel
Add these under **Project → Settings → Environment Variables** (Production + Preview):

| Name | Notes |
|---|---|
| `MONGODB_URI` | Atlas connection string. Atlas → Network Access must allow `0.0.0.0/0` for Vercel |
| `JWT_SECRET` | **32+ random chars** — `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Admin panel login |
| `ALLOW_MOCK_PAYMENTS` | `true` = demo payments, `false` once Razorpay is live |
| `NEXT_PUBLIC_APP_URL` | Your live URL (e.g. `https://yourdomain.com`) — used for SEO, sitemap, canonical links. **Do not leave it as localhost** |
| `NEXT_PUBLIC_PHONE` / `NEXT_PUBLIC_EMAIL` / `NEXT_PUBLIC_WHATSAPP` | Real business contact details (WhatsApp button shows only when set) |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL` | Optional: email you every new contact-form message |

## Security notes
- Session JWT is an httpOnly cookie (not readable by JS); logout clears it server-side.
- Booking prices and payment amounts are computed on the server, never trusted from the browser.
- All write endpoints whitelist fields, validate ids, and are scoped to the owner.
- Login/register are rate-limited (in-memory; use Upstash/Vercel KV for strict limits at scale).
- Cross-site API writes are rejected in `src/middleware.js`; security headers are in `next.config.js`.
- `.env.local` is git-ignored. Never commit secrets.

## Where things live
- `src/lib/site.js` — business name, phone, email, URL (single source of truth)
- `src/app/globals.css` + `tailwind.config.js` — design system (buttons, cards, animations, reduced-motion support)
- `src/components/effects/` — scroll progress, scroll-reveal, card spotlight, floating call/WhatsApp/back-to-top, count-up numbers
- Contact messages are stored in MongoDB and shown in **Admin → Messages**

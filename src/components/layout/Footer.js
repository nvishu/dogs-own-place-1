import Link from 'next/link'
import { SITE } from '@/lib/site'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-brand-dark text-white">
      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🐾</span>
              <div>
                <div className="font-display font-bold text-xl leading-none">DOG&apos;S OWN PLACE</div>
                <div className="text-xs text-brand-accent font-semibold tracking-widest">DOP</div>
              </div>
            </div>
            <p className="text-orange-200/70 text-sm leading-relaxed">
              Where every dog gets the royal treatment they deserve. Professional care, loving hands.
            </p>
            <div className="flex gap-3 mt-5">
              {['📘', '📸', '🐦', '▶️'].map((icon, i) => (
                <button key={i} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-primary transition-colors text-sm">
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4 text-brand-accent">Services</h4>
            <ul className="space-y-2 text-sm text-orange-200/70">
              {['Dog Training', 'Dog Walking', 'Health Checkup', 'Vaccinations', 'Grooming', 'Daycare'].map(s => (
                <li key={s}>
                  <Link href="/services" className="hover:text-brand-accent transition-colors">🐾 {s}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4 text-brand-accent">Company</h4>
            <ul className="space-y-2 text-sm text-orange-200/70">
              {[['About Us', '/about'], ['Contact', '/contact'], ['Services', '/services'], ['Dashboard', '/dashboard'], ['Book Appointment', '/dashboard/appointments']].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="hover:text-brand-accent transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-lg mb-4 text-brand-accent">Contact</h4>
            <ul className="space-y-3 text-sm text-orange-200/70">
              <li className="flex gap-2"><span>📍</span><span>123 Pawsome Street, Mumbai - 400001</span></li>
              <li className="flex gap-2"><span>📞</span><a href={`tel:${SITE.phone.replace(/[^\d+]/g, '')}`} className="hover:text-white transition-colors">{SITE.phone}</a></li>
              <li className="flex gap-2"><span>✉️</span><a href={`mailto:${SITE.email}`} className="hover:text-white transition-colors">{SITE.email}</a></li>
              <li className="flex gap-2"><span>⏰</span><span>Mon–Sun: 7:00 AM – 9:00 PM</span></li>
            </ul>
          </div>
        </div>

        <hr className="border-white/10 my-10" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-orange-200/50">
          <p>© {year} DOG&apos;S OWN PLACE (DOP). All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-brand-accent transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-brand-accent transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-brand-accent transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

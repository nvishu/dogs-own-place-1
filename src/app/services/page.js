import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { SERVICES } from '@/lib/constants'
import Image from 'next/image'

export const metadata = {
  title: 'Dog Services',
  description: 'Explore dog training, walking, grooming, vaccinations, health checkups and more. Transparent plan pricing.',
  alternates: { canonical: '/services' },
}

export default function ServicesPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="pt-28 pb-16 bg-brand-cream dots-bg relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] hero-blob" />
        <div className="page-container text-center relative z-10">
          <span className="badge bg-orange-100 text-brand-primary mb-4">🐾 All Services</span>
          <h1 className="section-title mb-4">Premium Dog Services</h1>
          <p className="section-subtitle mx-auto">8 expert-led services covering every aspect of your dog&apos;s life — health, fitness, grooming, training, and love.</p>
          <div className="flex flex-wrap gap-3 justify-center mt-8">
            {SERVICES.map(s => (
              <Link key={s.id} href={`/services/${s.id}`}
                className="px-4 py-2 bg-white border border-orange-200 rounded-full text-sm font-semibold text-brand-dark hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all shadow-sm hover:shadow-brand hover:-translate-y-0.5">
                {s.icon} {s.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="page-container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((service, idx) => (
              <Link key={service.id} href={`/services/${service.id}`}
                className="service-card group block"
                style={{ animationDelay: `${idx * 80}ms` }}>
                <div className="relative h-52 overflow-hidden">
                  <Image fill sizes="(max-width: 768px) 100vw, 50vw" src={service.image} alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-bold text-brand-dark shadow-sm">
                    ₹{service.price.basic.toLocaleString()}+
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <span className="text-3xl">{service.icon}</span>
                    <div className="text-white">
                      <div className="font-display font-bold">{service.title}</div>
                      <div className="text-xs text-white/75">⏱ {service.duration}</div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-500 mb-4 leading-relaxed">{service.shortDesc}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {service.features.slice(0, 3).map(f => (
                      <span key={f} className="text-xs bg-brand-light text-brand-brown px-2 py-0.5 rounded-full font-medium">{f}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between border-t border-orange-100 pt-3">
                    <div>
                      <div className="text-xs text-gray-400">Starting at</div>
                      <div className="font-display font-bold text-brand-primary text-lg">₹{service.price.basic.toLocaleString()}</div>
                    </div>
                    <span className="text-sm bg-brand-primary text-white font-bold px-4 py-2 rounded-full group-hover:bg-brand-secondary transition-colors">
                      View Details →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-brand-cream dots-bg">
        <div className="page-container max-w-3xl">
          <div className="text-center mb-12"><h2 className="section-title">Frequently Asked Questions</h2></div>
          <div className="space-y-4">
            {[
              {q:'How do I book a service?',a:'Register for a free account, go to your dashboard, click "Book Appointment", select your service, date & time, then pay securely online.'},
              {q:'Are your trainers certified?',a:'Yes! All trainers hold certifications from recognized pet training bodies and undergo regular skill assessments.'},
              {q:'What if I need to cancel?',a:'You can cancel or reschedule up to 24 hours before your appointment for a full refund. Within 24 hours gets 50% refund.'},
              {q:'Do you offer home visits?',a:'Yes! Training, grooming, and health checkup services are available as home visits in select cities for a small travel fee.'},
              {q:'How is my dog health data stored?',a:'All health data is stored securely in your personal dashboard. You own your data and can export or delete anytime.'},
            ].map((item,i) => (
              <details key={i} className="card group cursor-pointer">
                <summary className="flex items-center justify-between font-bold text-brand-dark list-none">
                  <span>{item.q}</span>
                  <span className="text-brand-primary group-open:rotate-45 transition-transform text-xl ml-4">+</span>
                </summary>
                <p className="text-gray-600 text-sm mt-3 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-orange-gradient">
        <div className="page-container text-center text-white">
          <h2 className="font-display text-3xl font-bold mb-4">Ready to Book Your First Service?</h2>
          <p className="text-white/80 mb-8">Free registration. No credit card required to sign up.</p>
          <Link href="/auth/register" className="inline-flex items-center gap-2 bg-white text-brand-primary font-bold px-8 py-4 rounded-full hover:bg-brand-cream transition-colors shadow-lg">
            Get Started Free 🐾
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  )
}
